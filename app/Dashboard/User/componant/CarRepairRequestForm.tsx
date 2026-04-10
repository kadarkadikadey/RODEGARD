'use client';

import React, { useState } from 'react';

interface RepairForm {
    username: string;
    email: string;
    carModel: string;
    date: string;
    location: string;
    issue: string;
    serviceNeeded: string;
    extraNotes: string;
}

const initialForm: RepairForm = {
    username: '',
    email: '',
    carModel: '',
    date: '',
    location: '',
    issue: '',
    serviceNeeded: '',
    extraNotes: '',
};

interface CarRepairRequestFormProps {
    onSubmitted?: (requestId: string) => void;
}

const CarRepairRequestForm = ({ onSubmitted }: CarRepairRequestFormProps) => {
    const [form, setForm] = useState<RepairForm>(initialForm);

    const handleChange = (field: keyof RepairForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // 1. Add this state at the top of your component
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. Updated handleSubmit function
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent multiple clicks
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/addRequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (response.ok) {
                if (onSubmitted && data.id) {
                    onSubmitted(data.id);
                } else {
                    alert('🚗 Request submitted successfully! Our team will contact you soon.');
                    setForm(initialForm);
                }
            } else {
                // Show the specific error message from the server
                alert(`Error: ${data.details || data.error || 'Something went wrong'}`);
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Could not connect to the server. Please check your internet connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 sm:p-8 shadow-lg">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute right-20 bottom-10 h-20 w-20 rounded-full bg-white/5" />

            <div className="relative">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl sm:text-3xl">🚗</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Request Car Repair</h3>
                </div>
                <p className="text-sm text-brand-200 mb-6">
                    Tell us about your car and the issue — we&apos;ll send the right mechanic to you.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Row 1: Username & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-200 mb-1">Your Name</label>
                            <input
                                type="text"
                                required
                                value={form.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                                placeholder="Full name"
                                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-brand-300 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-200 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-brand-300 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                            />
                        </div>
                    </div>

                    {/* Row 2: Car Model & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-200 mb-1">Car Model</label>
                            <input
                                type="text"
                                required
                                value={form.carModel}
                                onChange={(e) => handleChange('carModel', e.target.value)}
                                placeholder="e.g. Maruti Swift 2022"
                                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-brand-300 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-200 mb-1">Preferred Date</label>
                            <input
                                type="date"
                                required
                                value={form.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                            />
                        </div>
                    </div>

                    {/* Row 3: Location */}
                    <div>
                        <label className="block text-sm font-medium text-brand-200 mb-1">Your Location</label>
                        <input
                            type="text"
                            required
                            value={form.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            placeholder="Street, City, Pincode"
                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-brand-300 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                        />
                    </div>

                    {/* Row 4: What happened */}
                    <div>
                        <label className="block text-sm font-medium text-brand-200 mb-1">What happened to your car?</label>
                        <textarea
                            rows={2}
                            required
                            value={form.issue}
                            onChange={(e) => handleChange('issue', e.target.value)}
                            placeholder="e.g. Engine won't start, strange noise from brakes..."
                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-brand-300 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm resize-none"
                        />
                    </div>

                    {/* Row 5: What you need done */}
                    <div>
                        <label className="block text-sm font-medium text-brand-200 mb-1">What do you need done?</label>
                        <textarea
                            rows={2}
                            required
                            value={form.serviceNeeded}
                            onChange={(e) => handleChange('serviceNeeded', e.target.value)}
                            placeholder="e.g. Full engine check, brake pad replacement..."
                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-brand-300 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm resize-none"
                        />
                    </div>

                    {/* Row 6: Extra Notes */}
                    <div>
                        <label className="block text-sm font-medium text-brand-200 mb-1">Extra Notes <span className="font-normal text-brand-300">(optional)</span></label>
                        <textarea
                            rows={2}
                            value={form.extraNotes}
                            onChange={(e) => handleChange('extraNotes', e.target.value)}
                            placeholder="Anything else we should know..."
                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-brand-300 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting} // Disable while sending
                        className={`w-full sm:w-auto px-6 py-2.5 bg-white text-brand-600 rounded-lg text-sm font-semibold transition-colors shadow-sm ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-50'
                            }`}
                    >
                        {isSubmitting ? 'Sending Request...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CarRepairRequestForm;
