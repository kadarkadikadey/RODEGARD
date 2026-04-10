'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type Role = 'user' | 'worker';
type Gender = 'male' | 'female' | 'other';

interface SignupForm {
    name: string;
    email: string;
    mobileNumber: string;
    gender: Gender | '';
    password: '';        // Added field
    confirmPassword: '';
}

const initialForm: SignupForm = {
    name: '',
    email: '',
    mobileNumber: '',
    gender: '',
    password: '',        // Add this
    confirmPassword: '', // Add this
};

const SignupPage = () => {
    const [role, setRole] = useState<Role>('user');
    const [form, setForm] = useState<SignupForm>(initialForm);

    const handleRoleSwitch = (newRole: Role) => {
        setRole(newRole);
        setForm(initialForm);
    };

    const handleChange = (field: keyof SignupForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // Inside your SignupPage component
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validation: Ensure passwords match
        if (form.password !== form.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Map the role to your specific API paths
        const apiPath = role === 'user' ? '/api/addUsers' : '/api/addWorkers';

        try {
            const response = await fetch(apiPath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form), // Send the form data
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Success:", data);
                alert(`Account created successfully as a ${role}!`);
                setForm(initialForm); // Clear form on success
            } else {
                // Handle server-side errors (like the 500 error we saw earlier)
                alert(`Error: ${data.details || data.error || 'Signup failed'}`);
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Could not connect to the server.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-black tracking-tighter text-brand-600">RODEGARD</h2>
                    <h3 className="mt-4 text-xl font-bold text-gray-900">Create an Account</h3>
                    <p className="mt-2 text-sm text-gray-500">Please select your role and sign up</p>
                </div>

                {/* Role Selector */}
                <div className="flex p-1 bg-brand-100 rounded-lg">
                    {(['user', 'worker'] as const).map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => handleRoleSwitch(r)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${role === r
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
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Enter your name"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="you@example.com"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                            />
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                                Mobile Number
                            </label>
                            <input
                                id="mobile"
                                type="tel"
                                required
                                value={form.mobileNumber}
                                onChange={(e) => handleChange('mobileNumber', e.target.value)}
                                placeholder="+91 98765 43210"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
                            </label>
                            <div className="flex gap-6">
                                {(['male', 'female', 'other'] as const).map((g) => (
                                    <label
                                        key={g}
                                        className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
                                    >
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={g}
                                            checked={form.gender === g}
                                            onChange={() => handleChange('gender', g)}
                                            className="accent-brand-600"
                                        />
                                        <span className="capitalize">{g}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Create Password</label>
                            <input
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                placeholder="Min 6 characters"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500"
                            />
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={form.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                placeholder="Repeat password"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                    >
                        Sign up as {role}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <Link href="/Login" className="text-sm text-brand-600 hover:underline">
                        If you Signup then Click Hear
                        <br></br>
                    </Link>
                    <Link href="/Login" className="text-sm text-brand-600 hover:underline">
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
