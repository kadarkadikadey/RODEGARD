'use client';

import { useState, useEffect } from 'react';

type Status = 'Pending' | 'Accepted' | 'Working' | 'Finished' | 'Rejected' | 'Cancelled';

interface Job {
    id: string;
    serviceNeeded: string;
    username: string;
    carModel: string;
    location: string;
    date: string;
    amount: string;
    status: Status;
}

// Normalize lowercase Firestore status to capitalized Status type
const normalizeStatus = (raw: string): Status => {
    const map: Record<string, Status> = {
        pending: 'Pending',
        accepted: 'Accepted',
        working: 'Working',
        finished: 'Finished',
        rejected: 'Rejected',
        cancelled: 'Cancelled'
    };
    return map[raw?.toLowerCase()] ?? 'Pending';
};

const statusColor: Record<string, string> = {
    'Accepted': 'bg-brand-200 text-brand-700',
    'Working': 'bg-brand-200 text-brand-600',
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Finished': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700',
    'Cancelled': 'bg-gray-100 text-gray-500',
};

const AssignedJobs = ({ onStatusChange }: { onStatusChange?: () => void }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [workerName, setWorkerName] = useState<string | null>(null);
    const [workerId, setWorkerId] = useState<string | null>(null);
    const [paymentModal, setPaymentModal] = useState<{ jobId: string } | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    // Initial load + user session extraction
    useEffect(() => {
        const fetchJobs = async (isBackground = false) => {
            if (!isBackground) {
                setLoading(true);
                setError(null);
            }
            try {
                // Get the current logged in worker
                const storedData = localStorage.getItem('user_data');
                let currentWorkerName = null;
                let currentWorkerId = null;
                if (storedData) {
                    const data = JSON.parse(storedData);
                    // LoginPage stores data.data directly as "user_data", so it's the worker object.
                    if (data && data.name) {
                        currentWorkerName = data.name;
                        currentWorkerId = data.id;
                        setWorkerName(currentWorkerName);
                        setWorkerId(currentWorkerId);
                    }
                }

                if (!currentWorkerName) {
                    throw new Error("Could not authenticate worker session.");
                }

                const res = await fetch('/api/showAllRequest');
                if (!res.ok) throw new Error('Failed to fetch assigned jobs');

                const data = await res.json();
                
                // Filter jobs assigned specifically to this worker + normalize fields
                const assigned = data
                    .filter((item: any) => {
                        // Priority 1: match by ID if available (added by new Admin Dashboard logic)
                        if (item.assignedWorkerId && currentWorkerId) {
                            return item.assignedWorkerId === currentWorkerId;
                        }
                        // Priority 2: fallback to name matching (robust case-insensitive and trimmed)
                        if (item.assignedWorker && currentWorkerName) {
                            return item.assignedWorker.trim().toLowerCase() === currentWorkerName.trim().toLowerCase();
                        }
                        return false;
                    })
                    .map((item: any) => ({
                        id: item.id,
                        serviceNeeded: item.serviceNeeded || 'N/A',
                        username: item.username || 'Unknown',
                        carModel: item.carModel || 'Unknown',
                        location: item.location || 'Unknown',
                        date: item.date || 'Unknown',
                        amount: 'TBD', // Placeholder since there is no amount field yet
                        status: normalizeStatus(item.status),
                    }));

                setJobs(assigned);

            } catch (err: any) {
                if (!isBackground) setError(err.message);
            } finally {
                if (!isBackground) setLoading(false);
            }
        };

        fetchJobs();
        const interval = setInterval(() => fetchJobs(true), 3000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id: string, newStatus: Job['status'], paymentAmt?: string) => {
        setUpdatingId(id);
        try {
            // 1. Update the Request status (and payment amount if provided)
            const res = await fetch('/api/updateRequest', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    status: newStatus.toLowerCase(),
                    ...(paymentAmt ? { paymentAmount: paymentAmt } : {}),
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Update failed');
            }

            // 2. If finished, sync the worker's assigned/completed job arrays + earnings
            if (newStatus === 'Finished' && workerId) {
                try {
                    const workersRes = await fetch('/api/showAllWorker');
                    const workers = await workersRes.json();
                    const currentWorker = workers.find((w: any) => w.id === workerId);

                    if (currentWorker) {
                        const newAssignedJobs = (currentWorker.assignedJobs || []).filter((j: string) => j !== id);
                        const newCompletedJobs = [...(currentWorker.completedJobs || []), id];
                        const prevEarning = parseFloat(currentWorker.earning || '0') || 0;
                        const newEarning = (prevEarning + (parseFloat(paymentAmt || '0') || 0)).toFixed(2);

                        await fetch('/api/updateWorker', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: workerId,
                                assignedJobs: newAssignedJobs,
                                completedJobs: newCompletedJobs,
                                earning: newEarning,
                            }),
                        });
                    }
                } catch (workerErr) {
                    console.error('Failed to sync worker jobs:', workerErr);
                }
            }

            // Successfully updated => reflect locally
            setJobs((prev) =>
                prev.map((job) => (job.id === id ? { ...job, status: newStatus } : job))
            );

            if (onStatusChange) onStatusChange();

        } catch (err: any) {
            alert('Failed to update status: ' + err.message);
        } finally {
            setUpdatingId(null);
            setPaymentModal(null);
            setPaymentAmount('');
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-12 text-center text-sm text-gray-400">
                Loading your assigned jobs...
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
                        <p className="text-xs text-gray-500">Enter the amount charged for this job before marking it complete.</p>
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
                                onClick={() => updateStatus(paymentModal.jobId, 'Finished', paymentAmount)}
                                disabled={!paymentAmount || updatingId === paymentModal.jobId}
                                className="flex-1 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
                            >
                                {updatingId === paymentModal.jobId ? 'Saving...' : 'Confirm & Finish'}
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
            <div className="px-4 py-4 sm:px-6 border-b border-gray-100">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Your Assigned Jobs</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {jobs.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                        You have no assigned jobs at the moment.
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="px-4 py-3 sm:px-6 sm:py-4 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{job.serviceNeeded}</p>
                                    <p className="text-xs text-gray-500">
                                        Customer: {job.username} &middot; {job.carModel} &middot; {job.location}
                                    </p>
                                    <p className="text-xs text-gray-400">{job.date}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-700">{job.amount}</span>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[job.status] || 'bg-gray-100'}`}>
                                        {job.status}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Action buttons for pending/working jobs */}
                            {(job.status === 'Accepted' || job.status === 'Working') && (
                                <div className="flex gap-2 pt-2 border-t border-gray-100 mt-2">
                                    {job.status === 'Accepted' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(job.id, 'Working')}
                                                disabled={updatingId === job.id}
                                                className="px-3 py-1 text-xs font-medium rounded-md bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
                                            >
                                                Start Working
                                            </button>
                                            <button
                                                onClick={() => updateStatus(job.id, 'Rejected')}
                                                disabled={updatingId === job.id}
                                                className="px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                                            >
                                                Decline
                                            </button>
                                        </>
                                    )}
                                    {job.status === 'Working' && (
                                        <button
                                            onClick={() => { setPaymentModal({ jobId: job.id }); setPaymentAmount(''); }}
                                            disabled={updatingId === job.id}
                                            className="px-3 py-1 text-xs font-medium rounded-md bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
                                        >
                                            Mark as Finished
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AssignedJobs;
