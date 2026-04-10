'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
    const [role, setRole] = useState<'user' | 'worker' | 'admin'>('user');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            // Determine the API endpoint based on role
            const endpoint = role === 'user' ? '/api/loginUser' : role === 'worker' ? '/api/loginWorker' : role === 'admin' ? '/api/loginAdmin' : null;

            if (!endpoint) {
                alert(`Login for ${role} is not implemented yet.`);
                return;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store user data in localStorage (including ID for future updates)
                const sessionData = { ...data.data, id: data.id };
                localStorage.setItem('user_data', JSON.stringify(sessionData));
                console.debug("Login successful. Session stored:", sessionData);

                const roleMap = { user: 'User', worker: 'Worker', admin: 'Admin' } as const;
                router.push(`/Dashboard/${roleMap[role]}`);
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login request failed:', error);
            alert('An error occurred during login.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-black tracking-tighter text-brand-600">RODEGARD</h2>
                    <h3 className="mt-4 text-xl font-bold text-gray-900">Welcome Back</h3>
                    <p className="mt-2 text-sm text-gray-500">Please select your role and sign in</p>
                </div>

                {/* Role Selector */}
                <div className="flex p-1 bg-brand-100 rounded-lg">
                    {(['user', 'worker', 'admin'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRole(r)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                                role === r
                                    ? 'bg-white text-brand-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                            
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                    >
                        Sign in as {role}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <Link href="/" className="text-sm text-brand-600 hover:underline">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
