const reviews = [
    {
        id: 1,
        customer: 'Priya Sharma',
        vehicle: 'Honda City 2022',
        service: 'Engine Check & Repair',
        rating: 5,
        review: 'Amazing service! The worker arrived on time, diagnosed the engine issue quickly and fixed it on the spot. My car runs perfectly now.',
        date: 'Feb 2026',
    },
    {
        id: 2,
        customer: 'Rahul Verma',
        vehicle: 'Hyundai Creta 2023',
        service: 'Brake Pad Replacement',
        rating: 5,
        review: 'Very professional. Brakes were squeaking badly and the mechanic replaced both pads within an hour. Great quality parts used.',
        date: 'Feb 2026',
    },
    {
        id: 3,
        customer: 'Neha Gupta',
        vehicle: 'Maruti Swift 2021',
        service: 'AC Repair',
        rating: 4,
        review: 'AC was not cooling at all. The worker found the gas leak, fixed it and refilled the gas. AC works like new again. Highly recommend!',
        date: 'Jan 2026',
    },
    {
        id: 4,
        customer: 'Sanjay Mehta',
        vehicle: 'Kia Seltos 2023',
        service: 'Wheel Alignment',
        rating: 5,
        review: 'Smooth experience from start to finish. Submitted the request, got a worker assigned within minutes. Wheel alignment done perfectly.',
        date: 'Jan 2026',
    },
    {
        id: 5,
        customer: 'Deepa Nair',
        vehicle: 'Tata Nexon 2023',
        service: 'Battery Replacement',
        rating: 4,
        review: 'Car battery died suddenly. Used Rodegard and got a replacement within the same day. Very convenient service.',
        date: 'Dec 2025',
    },
    {
        id: 6,
        customer: 'Amit Singh',
        vehicle: 'Toyota Fortuner 2024',
        service: 'Full Service',
        rating: 5,
        review: 'Got a complete service done — oil change, filter replacement, and general checkup. The worker was thorough and very skilled.',
        date: 'Dec 2025',
    },
];

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                ★
            </span>
        ))}
    </div>
);

const SuccessReviews = () => {
    return (
        <section className="py-12 px-4 sm:py-16 sm:px-6 lg:py-24 border-b border-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10 sm:mb-14">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">Successful Repairs</h2>
                    <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
                        Real reviews from real customers. See what people say about our repair service.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {reviews.map((r) => (
                        <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <StarRating rating={r.rating} />
                                <span className="text-xs text-gray-400">{r.date}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed flex-1 mb-3">
                                &ldquo;{r.review}&rdquo;
                            </p>
                            <div className="border-t border-gray-50 pt-3">
                                <p className="text-sm font-semibold text-gray-900">{r.customer}</p>
                                <p className="text-xs text-gray-500">{r.service} &middot; {r.vehicle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SuccessReviews;
