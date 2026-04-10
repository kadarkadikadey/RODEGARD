const steps = [
    {
        step: '1',
        title: 'Create Your Account',
        description: 'Sign up with your name, email and phone number. It takes less than a minute to get started.',
    },
    {
        step: '2',
        title: 'Fill a Repair Request',
        description: 'Go to your dashboard and fill the repair request form — select service type, describe the issue, and add your vehicle details.',
    },
    {
        step: '3',
        title: 'Admin Reviews Your Request',
        description: 'Our admin team reviews your request and accepts it. A skilled worker is assigned to handle your repair.',
    },
    {
        step: '4',
        title: 'Worker Arrives & Repairs',
        description: 'The assigned worker reaches your location, inspects the vehicle, and completes the repair on the spot.',
    },
    {
        step: '5',
        title: 'Track & Done',
        description: 'Track your request status in real-time — from pending to finished. Rate the service once completed.',
    },
];

const HowItWorks = () => {
    return (
        <section className="py-12 px-4 sm:py-16 sm:px-6 lg:py-24 border-b border-gray-50 bg-gradient-to-b from-white to-gray-50/50">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10 sm:mb-14">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">How It Works</h2>
                    <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
                        Get your vehicle repaired in 5 simple steps. No hassle, no waiting — just fill a request and we handle the rest.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-4">
                    {steps.map((item, i) => (
                        <div key={item.step} className="relative text-center sm:text-left">
                            {/* Connector line (hidden on last item and mobile) */}
                            {i < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-5 left-[calc(50%+24px)] w-[calc(100%-48px)] h-px bg-gray-200" />
                            )}
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white text-sm font-bold mb-3">
                                {item.step}
                            </div>
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
