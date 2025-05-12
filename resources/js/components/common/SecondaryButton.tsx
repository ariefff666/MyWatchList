import { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({ type = 'button', className = '', disabled, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-xs font-semibold tracking-widest text-gray-200 uppercase transition duration-150 ease-in-out hover:bg-gray-500 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none active:bg-gray-700 dark:focus:ring-offset-gray-800 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
