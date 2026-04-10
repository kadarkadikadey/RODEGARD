'use client';

import { useState, useEffect } from 'react';

interface Worker {
    id: string;
    name: string;
    email: string;
    mobileNumber: string;
    gender: string;
    assignedJobs: string[];
    completedJobs: string[];
    earning: string;
    rating: string;
}

interface ServiceRequest {
    id: string;
    serviceNeeded: string;
}

const WorkerManager = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [requestMap, setRequestMap] = useState<Record<string, string>>({});  // id → serviceNeeded
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editEarning, setEditEarning] = useState<Record<string, string>>({});  // workerId → draft value
    const [savingEarning, setSavingEarning] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async (isBackground = false) => {
            if (!isBackground) {
                setLoading(true);
                setError(null);
            }
            try {
                const [workersRes, requestsRes] = await Promise.all([
                    fetch('/api/showAllWorker'),
                    fetch('/api/showAllRequest'),
                ]);
                if (!workersRes.ok) throw new Error('Failed to fetch workers');
                if (!requestsRes.ok) throw new Error('Failed to fetch requests');

                const workersData: Worker[] = await workersRes.json();
                const requestsData: ServiceRequest[] = await requestsRes.json();

                // Build a map: requestId → serviceNeeded
                const map: Record<string, string> = {};
                requestsData.forEach((r: any) => {
                    map[r.id] = r.serviceNeeded || r.id;
                });

                setWorkers(workersData);
                setRequestMap(map);

                // Pre-fill earning edit fields with current values only if not already set
                setEditEarning(prev => {
                    const newDrafts = { ...prev };
                    workersData.forEach(w => {
                        if (newDrafts[w.id] === undefined) {
                            newDrafts[w.id] = w.earning || '';
                        }
                    });
                    return newDrafts;
                });
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

    const saveEarning = async (workerId: string) => {
        setSavingEarning(workerId);
        try {
            const res = await fetch('/api/updateWorker', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: workerId, earning: editEarning[workerId] }),
            });
            if (!res.ok) throw new Error('Failed to update earning');
            // Update local state
            setWorkers(prev =>
                prev.map(w => w.id === workerId ? { ...w, earning: editEarning[workerId] } : w)
            );
        } catch (err: any) {
            alert('Error saving earning: ' + err.message);
        } finally {
            setSavingEarning(null);
        }
    };

    const resolveJobName = (jobId: string) => requestMap[jobId] || jobId;

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-12 text-center text-sm text-gray-400">
                Loading workers...
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

    const workingCount = workers.filter((w) => w.assignedJobs && w.assignedJobs.length > 0).length;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Header */}
            <div className="px-4 py-4 sm:px-6 border-b border-gray-100">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Worker Manager</h3>
                <p className="text-xs text-gray-500">{workers.length} workers &middot; {workingCount} currently working</p>
            </div>

            {/* Worker list */}
            <div className="divide-y divide-gray-50">
                {workers.map((w) => {
                    const isWorking = w.assignedJobs && w.assignedJobs.length > 0;
                    return (
                        <div key={w.id} className="px-4 sm:px-6">
                            {/* Row */}
                            <div
                                className="py-3 sm:py-4 flex items-center justify-between gap-3 cursor-pointer"
                                onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-900">{w.name}</p>
                                        <span className="text-xs text-gray-400 capitalize">{w.gender}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{w.email}</p>
                                    {isWorking && (
                                        <p className="text-xs text-brand-500 mt-0.5">
                                            {w.assignedJobs.length} assigned job{w.assignedJobs.length > 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isWorking ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-gray-500'}`}>
                                        {isWorking ? 'Working' : 'Available'}
                                    </span>
                                    <span className="text-gray-400 text-xs">{expandedId === w.id ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {/* Expanded detail */}
                            {expandedId === w.id && (
                                <div className="pb-4 space-y-3">
                                    {/* Info grid */}
                                    <div className="bg-brand-50 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                                        <div><span className="text-gray-500">Name:</span> <span className="text-gray-900 font-medium">{w.name}</span></div>
                                        <div><span className="text-gray-500">Gender:</span> <span className="text-gray-900 font-medium capitalize">{w.gender}</span></div>
                                        <div><span className="text-gray-500">Mobile:</span> <span className="text-gray-900 font-medium">{w.mobileNumber}</span></div>
                                        <div><span className="text-gray-500">Email:</span> <span className="text-gray-900 font-medium">{w.email}</span></div>

                                        {/* Editable Earnings field */}
                                        <div className="sm:col-span-2 flex items-center gap-2 flex-wrap">
                                            <span className="text-gray-500">Earnings (₹):</span>
                                            <input
                                                type="number"
                                                value={editEarning[w.id] ?? ''}
                                                onChange={(e) => setEditEarning(prev => ({ ...prev, [w.id]: e.target.value }))}
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder="0"
                                                className="w-28 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                                            />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); saveEarning(w.id); }}
                                                disabled={savingEarning === w.id}
                                                className="px-2 py-1 text-xs bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors disabled:opacity-50"
                                            >
                                                {savingEarning === w.id ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>

                                        <div>
                                            <span className="text-gray-500">Rating:</span>{' '}
                                            <span className="text-gray-900 font-bold">{w.rating || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Status:</span>{' '}
                                            <span className={`font-medium px-1.5 py-0.5 rounded ${isWorking ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-gray-500'}`}>
                                                {isWorking ? 'Currently Working' : 'Available'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Completed Jobs:</span>{' '}
                                            <span className="text-gray-900 font-medium">{w.completedJobs?.length ?? 0}</span>
                                        </div>
                                    </div>

                                    {/* Assigned Jobs — shows serviceNeeded instead of ID */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-2">Assigned Jobs</p>
                                        {!w.assignedJobs || w.assignedJobs.length === 0 ? (
                                            <p className="text-xs text-gray-400">No assigned jobs currently.</p>
                                        ) : (
                                            <div className="space-y-1.5">
                                                {w.assignedJobs.map((jobId, idx) => (
                                                    <div key={idx} className="bg-brand-50 rounded-lg px-3 py-2 text-xs text-gray-700 font-medium flex justify-between items-center">
                                                        <span>{resolveJobName(jobId)}</span>
                                                        <span className="text-gray-400 font-normal ml-2 shrink-0">(ID: {jobId.slice(0, 8)}…)</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Completed Jobs — shows serviceNeeded instead of ID */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-2">Completed Jobs</p>
                                        {!w.completedJobs || w.completedJobs.length === 0 ? (
                                            <p className="text-xs text-gray-400">No completed jobs yet.</p>
                                        ) : (
                                            <div className="space-y-1.5">
                                                {w.completedJobs.map((jobId, idx) => (
                                                    <div key={idx} className="bg-green-50 rounded-lg px-3 py-2 text-xs text-green-700 font-medium flex justify-between items-center">
                                                        <span>{resolveJobName(jobId)}</span>
                                                        <span className="text-green-400 font-normal ml-2 shrink-0">(ID: {jobId.slice(0, 8)}…)</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {workers.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                        No workers found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkerManager;
