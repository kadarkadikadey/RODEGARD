'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import WorkerStats from './componant/WorkerStats';
import AssignedJobs from './componant/AssignedJobs';

const WorkerDashboard = () => {
    const [workerName, setWorkerName] = useState('Worker');
    const [statsKey, setStatsKey] = useState(0);

    useEffect(() => {
        const storedData = localStorage.getItem('user_data');
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                if (data && data.name) {
                    setWorkerName(data.name);
                }
            } catch (err) {
                console.error("Failed to parse user data", err);
            }
        }
    }, []);

    const handleRefreshStats = () => {
        setStatsKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-brand-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-4 py-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-brand-600">RODEGARD</h1>
                        <p className="text-xs sm:text-sm text-gray-500">Worker Dashboard</p>
                    </div>
                    <Link
                        href="/Login"
                        onClick={() => localStorage.removeItem('user_data')}
                        className="px-3 py-1.5 text-sm bg-brand-100 text-gray-700 rounded-md hover:bg-brand-300 transition-colors"
                    >
                        Logout
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6 sm:space-y-8">
                {/* Welcome */}
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Welcome back, {workerName}!</h2>
                    <p className="text-sm text-gray-500 mt-1">Here&apos;s your job overview and earnings.</p>
                </div>

                {/* Stats Cards */}
                <WorkerStats key={statsKey} />

                {/* Assigned Jobs with Accept/Decline */}
                <AssignedJobs onStatusChange={handleRefreshStats} />

            </main>
        </div>
    );
};

export default WorkerDashboard;
