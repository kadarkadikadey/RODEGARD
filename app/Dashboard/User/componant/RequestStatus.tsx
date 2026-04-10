'use client';

import { useEffect, useState } from 'react';

type Status = 'pending' | 'accepted' | 'working' | 'finished' | 'rejected' | 'cancelled';

interface RequestData {
    id: string;
    serviceNeeded: string;
    carModel: string;
    date: string;
    location: string;
    status: Status;
    assignedWorker?: string;
    paymentAmount?: string;
}

const statusConfig: Record<Status, { label: string; color: string; bar: string; icon: string; description: string }> = {
    pending:   { label: 'Pending Review',      color: 'text-yellow-600', bar: 'bg-yellow-400', icon: '⏳', description: 'Waiting for admin review.' },
    accepted:  { label: 'Accepted',             color: 'text-blue-600',   bar: 'bg-blue-400',   icon: '✅', description: 'Accepted! Finding a mechanic for you.' },
    working:   { label: 'Mechanic On The Way',  color: 'text-brand-600',  bar: 'bg-brand-500',  icon: '🔧', description: 'A mechanic is assigned and working on your car.' },
    finished:  { label: 'Completed',            color: 'text-green-600',  bar: 'bg-green-500',  icon: '🎉', description: 'Your service has been completed!' },
    rejected:  { label: 'Rejected',             color: 'text-red-600',    bar: 'bg-red-400',    icon: '❌', description: 'Your request was rejected.' },
    cancelled: { label: 'Cancelled',            color: 'text-gray-500',   bar: 'bg-gray-400',   icon: '🚫', description: 'This request was cancelled.' },
};

const steps: Status[] = ['pending', 'accepted', 'working', 'finished'];

interface RequestStatusProps {
    requestId: string;
    onNewRequest: () => void;
}

const RequestStatus = ({ requestId, onNewRequest }: RequestStatusProps) => {
    const [request, setRequest] = useState<RequestData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/showAllRequest');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            const found = data.find((r: any) => r.id === requestId);
            if (found) setRequest(found);
            else setError('Request not found.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, [requestId]);

    if (loading) return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-400">
            Loading your request status...
        </div>
    );

    if (error || !request) return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-sm text-red-400">
            {error || 'Could not load request.'}
        </div>
    );

    const status = (request.status?.toLowerCase() as Status) || 'pending';
    const cfg = statusConfig[status] ?? statusConfig['pending'];
    const isTerminal = ['finished', 'rejected', 'cancelled'].includes(status);
    const currentStepIdx = steps.indexOf(status);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Status Header */}
            <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{cfg.icon}</span>
                    <div>
                        <p className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{cfg.description}</p>
                    </div>
                </div>
                <button
                    onClick={fetchStatus}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-md border border-gray-200 shrink-0 whitespace-nowrap"
                >
                    ↻ Refresh
                </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mx-6" />

            {/* Request Details */}
            <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Service', value: request.serviceNeeded },
                    { label: 'Car', value: request.carModel },
                    { label: 'Date', value: request.date },
                    { label: 'Location', value: request.location },
                ].map(({ label, value }) => (
                    <div key={label}>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{value || '—'}</p>
                    </div>
                ))}
            </div>

            {/* Assigned mechanic */}
            {request.assignedWorker && (
                <>
                    <div className="border-t border-gray-100 mx-6" />
                    <div className="px-6 py-3 flex items-center gap-2 text-sm text-gray-700">
                        <span>👷</span>
                        <span>Assigned Mechanic: <strong>{request.assignedWorker}</strong></span>
                    </div>
                </>
            )}

            {/* Payment (when finished) */}
            {status === 'finished' && request.paymentAmount && (
                <>
                    <div className="border-t border-gray-100 mx-6" />
                    <div className="px-6 py-3 flex items-center gap-2 text-sm text-green-700 font-semibold">
                        <span>💰</span>
                        <span>Amount Charged: ₹{request.paymentAmount}</span>
                    </div>
                </>
            )}

            {/* Progress bar — only for non-terminal */}
            {!isTerminal && (
                <>
                    <div className="border-t border-gray-100 mx-6" />
                    <div className="px-6 py-4">
                        <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">Progress</p>
                        <div className="flex items-center gap-2">
                            {steps.map((s, i) => {
                                const isDone = i < currentStepIdx;
                                const isActive = i === currentStepIdx;
                                return (
                                    <div key={s} className="flex items-center flex-1 gap-2">
                                        <div className="flex-1">
                                            <div className={`h-1.5 rounded-full transition-all ${isDone ? 'bg-green-400' : isActive ? cfg.bar : 'bg-gray-200'}`} />
                                            <p className={`text-xs mt-1.5 font-medium capitalize ${isActive ? cfg.color : isDone ? 'text-green-600' : 'text-gray-300'}`}>
                                                {isDone ? '✓ ' : ''}{statusConfig[s].label.split(' ')[0]}
                                            </p>
                                        </div>
                                        {i < steps.length - 1 && <div className={`w-2 h-0.5 shrink-0 -mt-4 ${isDone ? 'bg-green-300' : 'bg-gray-200'}`} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between">
                <p className="text-xs text-gray-400">Auto-refreshes every 3 sec</p>
                {isTerminal && (
                    <button
                        onClick={onNewRequest}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                    >
                        {status === 'finished' ? '🚗 Submit New Request' : '🔄 Try Again'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default RequestStatus;
