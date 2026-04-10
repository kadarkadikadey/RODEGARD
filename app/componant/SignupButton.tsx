import Link from 'next/link';

const SignupButton = () => {
    return (
        <Link 
            href="/Signup" 
            className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base bg-brand-500 text-white rounded-md hover:bg-brand-600 transition-colors"
        >
            Signup
        </Link>
    );
};

export default SignupButton;
