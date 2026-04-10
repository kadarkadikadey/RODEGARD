'use client';

import { useState, useEffect } from 'react';

type Status = 'Pending' | 'Accepted' | 'Working' | 'Finished' | 'Rejected';

interface Request {
    id: string;
    username: string;
    email: string;
    carModel: string;
    serviceNeeded: string;
    issue: string;
    location: string;
    date: string;
    status: Status;
    assignedWorker: string;
    assignedWorkerId?: string;  // Firestore ID of assigned worker
}

interface WorkerOption {
    id: string;
    name: string;
    assignedJobs: string[];
    completedJobs: string[];
}

// Normalize lowercase Firestore status to capitalized Status type
const normalizeStatus = (raw: string): Status => {
    const map: Record<string, Status> = {
        pending: 'Pending',
        accepted: 'Accepted',
        working: 'Working',
        finished: 'Finished',
        rejected: 'Rejected',
    };
    return map[raw?.toLowerCase()] ?? 'Pending';
};

const statusColor: Record<Status, string> = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Accepted: 'bg-brand-200 text-brand-700',
    Working: 'bg-brand-200 text-brand-600',
    Finished: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
};

const statusOptions: Status[] = ['Pending', 'Accepted', 'Working', 'Rejected'];

const RequestManager = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [workerOptions, setWorkerOptions] = useState<WorkerOption[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
    const [workerSelections, setWorkerSelections] = useState<Record<string, string>>({});  // requestId → workerId
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const [paymentModal, setPaymentModal] = useState<{ req: Request } | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    useEffect(() => {
        const fetchData = async (isBackground = false) => {
            if (!isBackground) {
                setLoading(true);
                setError(null);
            }
            try {
                const [requestsRes, workersRes] = await Promise.all([
                    fetch('/api/showAllRequest'),
                    fetch('/api/showAllWorker'),  // Full worker objects (id, name, assignedJobs, completedJobs)
                ]);

                if (!requestsRes.ok) throw new Error('Failed to fetch requests');
                if (!workersRes.ok) throw new Error('Failed to fetch workers');

                const requestsData = await requestsRes.json();
                const workersData = await workersRes.json();

                // Normalize status values from Firestore (lowercase → capitalized)
                const normalized = requestsData.map((r: any) => ({
                    ...r,
                    status: normalizeStatus(r.status),
                }));

                // Filter out Finished requests so they don't show up in the RequestManager
                const activeRequests = normalized.filter((r: any) => r.status !== 'Finished');

                setRequests(activeRequests);
                setWorkerOptions(workersData);
            } catch (err: any) {
                if (!isBackground) setError(err.message);
            } finally {
                if (!isBackground) setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(() => fetchData(true), 3000);
        return () => clearInterval(interval);
    }, []);

    // Helper to call updateWorker API for a worker
    const callUpdateWorker = async (workerId: string, updates: Record<string, any>) => {
        const res = await fetch('/api/updateWorker', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: workerId, ...updates }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Worker update failed');
        }
    };

    // Updates request status in DB + local state (for Accept/Reject only — not Finish)
    const updateRequestStatus = async (req: Request, updates: Partial<Request>) => {
        setUpdating(req.id);
        try {
            const firestoreUpdates = {
                ...updates,
                ...(updates.status ? { status: updates.status.toLowerCase() } : {}),
            };

            const res = await fetch('/api/updateRequest', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: req.id, ...firestoreUpdates }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert('Update failed: ' + (err.error || 'Unknown error'));
                return;
            }

            // Update local request state
            setRequests(prev => prev.map(r => (r.id === req.id ? { ...r, ...updates } : r)));
        } catch (err: any) {
            alert('Request update failed: ' + err.message);
        } finally {
            setUpdating(null);
        }
    };

    // Marks a request as Finished after collecting payment amount
    const finishRequest = async (req: Request, amount: string) => {
        setUpdating(req.id);
        try {
            // 1. Update the service request with status + payment amount
            const res = await fetch('/api/updateRequest', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: req.id, status: 'finished', paymentAmount: amount }),
            });
            if (!res.ok) {
                const err = await res.json();
                alert('Update failed: ' + (err.error || 'Unknown error'));
                return;
            }

            // 2. Update the worker's assigned/completed jobs AND add to earnings
            if (req.assignedWorkerId) {
                const worker = workerOptions.find(w => w.id === req.assignedWorkerId);
                if (worker) {
                    const newAssignedJobs = (worker.assignedJobs || []).filter(j => j !== req.id);
                    const newCompletedJobs = [...(worker.completedJobs || []), req.id];
                    // Add payment to existing earnings
                    const prevEarning = parseFloat((worker as any).earning || '0') || 0;
                    const newEarning = (prevEarning + (parseFloat(amount) || 0)).toFixed(2);
                    try {
                        await callUpdateWorker(worker.id, {
                            assignedJobs: newAssignedJobs,
                            completedJobs: newCompletedJobs,
                            earning: newEarning,
                        });
                        setWorkerOptions(prev => prev.map(w =>
                            w.id === worker.id
                                ? { ...w, assignedJobs: newAssignedJobs, completedJobs: newCompletedJobs }
                                : w
                        ));
                    } catch (workerErr: any) {
                        console.warn('Worker update failed:', workerErr.message);
                    }
                }
            }

            // 3. Remove from local view (finished requests are filtered out)
            setRequests(prev => prev.filter(r => r.id !== req.id));
        } catch (err: any) {
            alert('Request update failed: ' + err.message);
        } finally {
            setUpdating(null);
            setPaymentModal(null);
            setPaymentAmount('');
        }
    };

    // Assigns a worker: updates request (assignedWorker + status) AND worker (adds to assignedJobs)
    const assignWorker = async (req: Request) => {
        const workerId = workerSelections[req.id];
        if (!workerId) return;

        const worker = workerOptions.find(w => w.id === workerId);
        if (!worker) return;

        setUpdating(req.id);
        try {
            // 1. Update the service request
            const reqRes = await fetch('/api/updateRequest', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: req.id,
                    assignedWorker: worker.name,
                    assignedWorkerId: worker.id,
                    status: 'working',
                }),
            });

            if (!reqRes.ok) {
                const err = await reqRes.json();
                alert('Assign worker failed: ' + (err.error || 'Unknown error'));
                return;
            }

            // 2. Add requestId to worker's assignedJobs array in DB
            const newAssignedJobs = [...(worker.assignedJobs || []), req.id];
            await callUpdateWorker(worker.id, { assignedJobs: newAssignedJobs });

            // 3. Update local state
            setRequests(prev =>
                prev.map(r =>
                    r.id === req.id
                        ? { ...r, assignedWorker: worker.name, assignedWorkerId: worker.id, status: 'Working' }
                        : r
                )
            );
            setWorkerOptions(prev => prev.map(w =>
                w.id === worker.id ? { ...w, assignedJobs: newAssignedJobs } : w
            ));
            setWorkerSelections(prev => {
                const copy = { ...prev };
                delete copy[req.id];
                return copy;
            });
        } catch (err: any) {
            alert('Assign failed: ' + err.message);
        } finally {
            setUpdating(null);
        }
    };

    const filtered = filterStatus === 'All'
        ? requests
        : requests.filter((r) => r.status === filterStatus);

    const counts: Record<string, number> = { All: requests.length };
    for (const s of statusOptions) {
        counts[s] = requests.filter((r) => r.status === s).length;
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-12 text-center text-sm text-gray-400">
                Loading requests...
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-12 text-center text-sm text-red-500">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Payment Modal */}
            {paymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-80 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900">Enter Payment Amount</h3>
                        <p className="text-xs text-gray-500">This amount will be recorded on the request and added to the worker&apos;s earnings.</p>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹)</label>
                            <input
                                type="number"
                                min="0"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="e.g. 500"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => finishRequest(paymentModal.req, paymentAmount)}
                                disabled={!paymentAmount || updating === paymentModal.req.id}
                                className="flex-1 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
                            >
                                {updating === paymentModal.req.id ? 'Saving...' : 'Confirm & Finish'}
                            </button>
                            <button
                                onClick={() => { setPaymentModal(null); setPaymentAmount(''); }}
                                className="flex-1 py-2 text-sm font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="px-4 py-4 sm:px-6 border-b border-gray-100">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Request Manager</h3>
                <p className="text-xs text-gray-500">{requests.length} total &middot; {counts['Pending'] || 0} pending</p>
            </div>

            {/* Status filter tabs */}
            <div className="px-4 py-3 sm:px-6 flex flex-wrap gap-2 border-b border-gray-50">
                {(['All', ...statusOptions] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                            filterStatus === s
                                ? 'bg-brand-600 text-white'
                                : 'bg-brand-100 text-gray-600 hover:bg-brand-300'
                        }`}
                    >
                        {s} ({counts[s] || 0})
                    </button>
                ))}
            </div>

            {/* Request rows */}
            <div className="divide-y divide-gray-50">
                {filtered.map((req) => (
                    <div key={req.id} className="px-4 sm:px-6">
                        {/* Main row — always visible */}
                        <div
                            className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 cursor-pointer"
                            onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-900 truncate">{req.serviceNeeded}</p>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[req.status]}`}>
                                        {req.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {req.username} &middot; {req.carModel} &middot; {req.date}
                                </p>
                                {req.assignedWorker && (
                                    <p className="text-xs text-brand-500 mt-0.5">Worker: {req.assignedWorker}</p>
                                )}
                            </div>

                            {/* Inline actions */}
                            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                {req.status === 'Pending' && (
                                    <>
                                        <button
                                            onClick={() => updateRequestStatus(req, { status: 'Accepted' })}
                                            disabled={updating === req.id}
                                            className="px-3 py-1 text-xs font-medium rounded-md bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-40"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => updateRequestStatus(req, { status: 'Rejected' })}
                                            disabled={updating === req.id}
                                            className="px-3 py-1 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                <span className="text-gray-400 text-xs">{expandedId === req.id ? '▲' : '▼'}</span>
                            </div>
                        </div>

                        {/* Expanded detail panel */}
                        {expandedId === req.id && (
                            <div className="pb-4 space-y-3">
                                {/* Request details */}
                                <div className="bg-brand-50 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                                    <div><span className="text-gray-500">Customer:</span> <span className="text-gray-900 font-medium">{req.username}</span></div>
                                    <div><span className="text-gray-500">Email:</span> <span className="text-gray-900 font-medium">{req.email}</span></div>
                                    <div><span className="text-gray-500">Vehicle:</span> <span className="text-gray-900 font-medium">{req.carModel}</span></div>
                                    <div><span className="text-gray-500">Location:</span> <span className="text-gray-900 font-medium">{req.location}</span></div>
                                    <div><span className="text-gray-500">Date:</span> <span className="text-gray-900 font-medium">{req.date}</span></div>
                                    <div><span className="text-gray-500">Status:</span> <span className={`font-medium px-1.5 py-0.5 rounded ${statusColor[req.status]}`}>{req.status}</span></div>
                                    <div className="sm:col-span-2"><span className="text-gray-500">Service:</span> <span className="text-gray-900">{req.serviceNeeded}</span></div>
                                    <div className="sm:col-span-2"><span className="text-gray-500">Issue / Notes:</span> <span className="text-gray-900">{req.issue}</span></div>
                                    {req.assignedWorker && (
                                        <div className="sm:col-span-2"><span className="text-gray-500">Assigned Worker:</span> <span className="text-brand-600 font-medium">{req.assignedWorker}</span></div>
                                    )}
                                </div>

                                {/* Assign worker (for Accepted requests without a worker) */}
                                {req.status === 'Accepted' && !req.assignedWorker && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                        <span className="text-xs text-gray-500">Assign Worker:</span>
                                        <select
                                            value={workerSelections[req.id] || ''}
                                            onChange={(e) => setWorkerSelections((prev) => ({ ...prev, [req.id]: e.target.value }))}
                                            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                        >
                                            <option value="">Select Worker</option>
                                            {workerOptions.map((w) => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => assignWorker(req)}
                                            disabled={!workerSelections[req.id] || updating === req.id}
                                            className="px-3 py-1 text-xs font-medium rounded-md bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {updating === req.id ? 'Assigning...' : 'Assign & Start'}
                                        </button>
                                    </div>
                                )}

                                {/* Mark Finished (for Working requests) */}
                                {req.status === 'Working' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Update Status:</span>
                                        <button
                                            onClick={() => { setPaymentModal({ req }); setPaymentAmount(''); }}
                                            disabled={updating === req.id}
                                            className="px-3 py-1 text-xs font-medium rounded-md bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-40"
                                        >
                                            Mark Finished
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                        No requests with status &ldquo;{filterStatus}&rdquo;
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestManager;

/* =========================================================
   OLD STATIC MOCK DATA (commented out — replaced by API calls)
   =========================================================

// OLD availableWorkers (names only, no IDs):
// const availableWorkers = ['Ravi Kumar', 'Amit Singh', 'Suresh Yadav', 'Manoj Tiwari', 'Vikram Patel'];

// OLD initialRequests (hardcoded):
// const initialRequests: Request[] = [ ... ];

// OLD updateRequest (local state only, no DB, no worker sync):
// const updateRequest = (id: number, updates: Partial<Request>) => { setRequests(prev => prev.map(r => r.id === id ? {...r, ...updates} : r)); };

// OLD assignWorker (no DB worker update):
// const assignWorker = (id: number) => { ... };

========================================================= */
