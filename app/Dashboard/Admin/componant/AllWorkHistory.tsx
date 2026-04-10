'use client';

import { useState, useEffect } from 'react';

type Status = 'Pending' | 'Accepted' | 'Working' | 'Finished' | 'Rejected' | 'Cancelled';

interface HistoryItem {
    id: string;
    serviceNeeded: string;
    username: string;
    carModel: string;
    assignedWorker: string;
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

const statusColor: Record<Status, string> = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Accepted: 'bg-brand-200 text-brand-700',
    Working: 'bg-brand-200 text-brand-600',
    Finished: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Cancelled: 'bg-brand-100 text-gray-500',
};

const allStatuses: Status[] = ['Pending', 'Accepted', 'Working', 'Finished', 'Rejected', 'Cancelled'];

const AllWorkHistory = () => {
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [filter, setFilter] = useState<Status | 'All'>('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/showAllRequest');
                if (!res.ok) throw new Error('Failed to fetch work history');
                
                const data = await res.json();
                
                // Map API data to component interface
                const formattedData: HistoryItem[] = data.map((item: any) => ({
                    id: item.id,
                    serviceNeeded: item.serviceNeeded || 'N/A',
                    username: item.username || 'Unknown',
                    carModel: item.carModel || 'Unknown',
                    assignedWorker: item.assignedWorker || '',
                    date: item.date || 'Unknown',
                    amount: 'TBD', // Amount field doesn't exist in DB yet, setting a placeholder
                    status: normalizeStatus(item.status),
                }));

                setHistoryData(formattedData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const filtered = filter === 'All' ? historyData : historyData.filter((h) => h.status === filter);

    const counts: Record<string, number> = { All: historyData.length };
    for (const s of allStatuses) {
        counts[s] = historyData.filter((h) => h.status === s).length;
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-12 text-center text-sm text-gray-400">
                Loading work history...
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
            {/* Header */}
            <div className="px-4 py-4 sm:px-6 border-b border-gray-100">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">All Work History</h3>
                <p className="text-xs text-gray-500">{historyData.length} total records</p>
            </div>

            {/* Filter tabs */}
            <div className="px-4 py-3 sm:px-6 flex flex-wrap gap-2 border-b border-gray-50">
                {(['All', ...allStatuses] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                            filter === s
                                ? 'bg-brand-600 text-white'
                                : 'bg-brand-100 text-gray-600 hover:bg-brand-300'
                        }`}
                    >
                        {s} ({counts[s] || 0})
                    </button>
                ))}
            </div>

            {/* History list */}
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {filtered.map((item) => (
                    <div key={item.id} className="px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.serviceNeeded}</p>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[item.status]}`}>
                                    {item.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {item.username} &middot; {item.carModel} &middot; {item.date}
                            </p>
                            {item.assignedWorker && (
                                <p className="text-xs text-brand-500 mt-0.5">Worker: {item.assignedWorker}</p>
                            )}
                        </div>
                        <span className="text-sm font-semibold text-gray-700 shrink-0">{item.amount}</span>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                        No records with status &ldquo;{filter}&rdquo;
                    </div>
                )}
            </div>
        </div>
    );
};


export default AllWorkHistory;
