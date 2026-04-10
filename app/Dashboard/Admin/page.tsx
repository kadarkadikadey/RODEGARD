'use client';

import { useState } from 'react';
import Link from 'next/link';
import RequestManager from './componant/RequestManager';
import WorkerManager from './componant/WorkerManager';
import AllWorkHistory from './componant/AllWorkHistory';

type Tab = 'requests' | 'workers' | 'history' | 'reports';

const navItems: { key: Tab; label: string }[] = [
    { key: 'requests', label: 'Requests' },
    { key: 'workers', label: 'Workers' },
    { key: 'history', label: 'Work History' },
];

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<Tab>('requests');

    return (
        <div className="min-h-screen bg-brand-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-brand-600">RODEGARD</h1>
                            <p className="text-xs sm:text-sm text-gray-500">Admin Dashboard</p>
                        </div>
                        <Link
                            href="/Login"
                            onClick={() => localStorage.removeItem('user_data')}
                            className="px-3 py-1.5 text-sm bg-brand-100 text-gray-700 rounded-md hover:bg-brand-300 transition-colors"
                        >
                            Logout
                        </Link>
                    </div>

                    {/* Navigation Bar */}
                    <nav className="flex gap-1 -mb-px overflow-x-auto">
                        {navItems.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setActiveTab(item.key)}
                                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                    activeTab === item.key
                                        ? 'border-brand-600 text-brand-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6 sm:space-y-8">
                {activeTab === 'requests' && <RequestManager />}
                {activeTab === 'workers' && <WorkerManager />}
                {activeTab === 'history' && <AllWorkHistory />}
             
            </main>
        </div>
    );
};

export default AdminDashboard;
