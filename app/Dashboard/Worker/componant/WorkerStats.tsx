'use client';

import { useEffect, useState } from 'react';

const WorkerStats = () => {
    const [workerData, setWorkerData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const storedData = localStorage.getItem('user_data');
            if (storedData) {
                try {
                    const session = JSON.parse(storedData);
                    const workerId = session.id;

                    if (workerId) {
                        const res = await fetch('/api/showAllWorker');
                        if (res.ok) {
                            const workers = await res.json();
                            const currentWorker = workers.find((w: any) => w.id === workerId);
                            if (currentWorker) {
                                setWorkerData(currentWorker);
                            } else {
                                console.warn(`WorkerStats: Worker with ID ${workerId} not found in database.`);
                            }
                        } else {
                            console.error("WorkerStats API Error", await res.text());
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch worker stats", err);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        { label: 'Assigned Jobs', value: loading ? '...' : (workerData?.assignedJobs?.length || '0'), color: 'text-brand-600' },
        { label: 'Completed', value: loading ? '...' : (workerData?.completedJobs?.length || '0'), color: 'text-brand-500' },
        { label: 'Earnings (₹)', value: loading ? '...' : (workerData?.earning || '0'), color: 'text-brand-500' },
        { label: 'Rating', value: loading ? '...' : (workerData?.rating || '0.0'), color: 'text-yellow-600' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className={`text-2xl sm:text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
            ))}
        </div>
    );
};

export default WorkerStats;
