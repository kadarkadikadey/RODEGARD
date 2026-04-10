import LoginButton from '@/app/componant/LoginButton';
import SignupButton from '@/app/componant/SignupButton';
import HowItWorks from '@/app/componant/HowItWorks';
import SuccessReviews from '@/app/componant/SuccessReviews';
import JoinAsWorker from '@/app/componant/JoinAsWorker';
import Link from 'next/link';

// Reusable NavLink Component to keep code DRY
const NavLink = ({ name, path }: { name: string; path: string }) => (
    <li>
        <Link 
            href={path} 
            className="text-gray-600 hover:text-brand-600 font-medium transition-colors"
        >
            {name}
        </Link>
    </li>
);

const Page = () => {
    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-brand-600">
                        RODEGARD
                    </h1>
                    
                    <nav className="hidden md:block">
                        <ul className="flex gap-8 list-none">
                            <NavLink name="Home" path="/" />
                            <NavLink name="About" path="/about" />
                            <NavLink name="Support" path="/support" />
                        </ul>
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <LoginButton />
                        <SignupButton />
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                <HowItWorks />
                <SuccessReviews />
                <JoinAsWorker />
            </main>

            <footer className="bg-brand-950 text-gray-400 py-8 px-4 sm:py-12 sm:px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 text-center md:grid-cols-2 md:gap-8 md:text-left items-center">
                    <div>
                        <h2 className="text-white text-lg sm:text-xl font-bold tracking-tighter mb-2">RODEGARD</h2>
                        <p className="text-xs sm:text-sm">© 2026 High-performance web architecture.</p>
                    </div>
                    <ul className="flex justify-center md:justify-end gap-6 list-none">
                        <NavLink name="Home" path="/" />
                        <NavLink name="About" path="/about" />
                        <NavLink name="Support" path="/support" />
                    </ul>
                </div>
            </footer>
        </div>
    );
}

export default Page;