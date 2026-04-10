'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CarRepairRequestForm from './componant/CarRepairRequestForm';
import RequestStatus from './componant/RequestStatus';

const UserDashboard = () => {
    const [userData, setUserData] = useState<any>(null);
    const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

    useEffect(() => {
        const storedData = localStorage.getItem('user_data');
        if (storedData) {
            setUserData(JSON.parse(storedData));
        }
        // Restore any in-progress request from localStorage
        const savedRequestId = localStorage.getItem('active_request_id');
        if (savedRequestId) {
            setActiveRequestId(savedRequestId);
        }
    }, []);

    const handleRequestSubmitted = (requestId: string) => {
        setActiveRequestId(requestId);
        localStorage.setItem('active_request_id', requestId);
    };

    const handleNewRequest = () => {
        setActiveRequestId(null);
        localStorage.removeItem('active_request_id');
    };

    return (
        <div className="min-h-screen bg-brand-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-4 py-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-brand-600">RODEGARD</h1>
                        <p className="text-xs sm:text-sm text-gray-500">User Dashboard</p>
                    </div>
                    <Link
                        href="/Login"
                        onClick={() => {
                            localStorage.removeItem('user_data');
                            localStorage.removeItem('active_request_id');
                        }}
                        className="px-3 py-1.5 text-sm bg-brand-100 text-gray-700 rounded-md hover:bg-brand-300 transition-colors"
                    >
                        Logout
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6 sm:space-y-8">
                {/* Welcome */}
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Welcome back, {userData?.name || userData?.username || 'User'}!
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {activeRequestId
                            ? "Here's the live status of your service request."
                            : "What do you need help with today?"}
                    </p>
                </div>

                {/* Show status OR form */}
                {activeRequestId ? (
                    <RequestStatus
                        requestId={activeRequestId}
                        onNewRequest={handleNewRequest}
                    />
                ) : (
                    <CarRepairRequestForm onSubmitted={handleRequestSubmitted} />
                )}
            </main>
        </div>
    );
};

export default UserDashboard;

