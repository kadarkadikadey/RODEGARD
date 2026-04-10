import Link from 'next/link';

const LoginButton = () => {
    return (
        <Link 
            href="/Login" 
            className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors"
        >
            Login
        </Link>
    );
};

export default LoginButton;
