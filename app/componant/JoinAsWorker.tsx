import Link from 'next/link';

const benefits = [
    {
        title: 'Flexible Hours',
        description: 'Work when you want. Choose jobs that fit your schedule — no fixed shifts, no pressure.',
        icon: '🕐',
    },
    {   
        title: 'Earn Good Money',
        description: 'Get paid for every job you complete. Top workers earn ₹40,000+ per month with consistent work.',
        icon: '💰',
    },
    {
        title: 'Get Trained',
        description: 'We provide free training and skill upgrades so you stay ahead with the latest repair techniques.',
        icon: '📚',
    },
    {
        title: 'Steady Job Flow',
        description: 'No need to find customers yourself. We assign jobs directly to you based on your skills and location.',
        icon: '📋',
    },
    {
        title: 'Tools & Support',
        description: 'Access to quality tools and a dedicated support team to help you with any issues on the job.',
        icon: '🔧',
    },
    {
        title: 'Grow Your Career',
        description: 'Build your reputation with ratings and reviews. High-rated workers get priority on premium jobs.',
        icon: '📈',
    },
];

const stats = [
    { value: '100+', label: 'Active Workers' },
    { value: '₹35K', label: 'Avg. Monthly Earning' },
    { value: '4.7★', label: 'Avg. Worker Rating' },
    { value: '500+', label: 'Jobs Completed' },
];

const JoinAsWorker = () => {
    return (
        <section className="py-12 px-4 sm:py-16 sm:px-6 lg:py-24">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10 sm:mb-14">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">Join as a Worker</h2>
                    <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
                        Are you a skilled mechanic? Join Rodegard and start earning. We connect you with customers who need your expertise.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-blue-50 rounded-xl px-4 py-4 text-center">
                            <p className="text-xl sm:text-2xl font-bold text-blue-600">{s.value}</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Benefits grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-14">
                    {benefits.map((b) => (
                        <div key={b.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
                            <span className="text-2xl mb-2 block">{b.icon}</span>
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{b.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{b.description}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center bg-gray-900 rounded-2xl px-6 py-8 sm:px-10 sm:py-12">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Ready to Start Earning?</h3>
                    <p className="text-sm text-gray-400 mb-5 max-w-md mx-auto">
                        Sign up today, complete your profile, and start receiving job assignments in your area.
                    </p>
                    <Link
                        href="/Signup"
                        className="inline-block px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Apply as Worker
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default JoinAsWorker;
