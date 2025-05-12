import { Link } from '@inertiajs/react';

interface NavLinkProps extends React.ComponentProps<typeof Link> {
    active?: boolean;
}
export const NavLink = ({ active = false, className = '', children, ...props }: NavLinkProps) => {
    return (
        <Link
            {...props}
            className={`inline-flex items-center border-b-2 px-1 pt-3 text-sm leading-5 font-medium transition duration-150 ease-in-out focus:outline-none ${
                active
                    ? 'border-indigo-400 text-gray-900 focus:border-indigo-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 focus:text-gray-700'
            } ${className}`}
        >
            {children}
        </Link>
    );
};
