import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
    const baseStyles = 'font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-150 ease-in-out';

    let variantStyles = '';
    switch (variant) {
        case 'primary':
            variantStyles = 'bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400';
            break;
        case 'secondary':
            variantStyles = 'bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500';
            break;
        case 'danger':
            variantStyles = 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400';
            break;
        case 'ghost':
            variantStyles = 'bg-transparent hover:bg-slate-700 text-slate-300 hover:text-white focus:ring-slate-500 border border-slate-600';
            break;
    }

    let sizeStyles = '';
    switch (size) {
        case 'sm':
            sizeStyles = 'px-3 py-1.5 text-sm';
            break;
        case 'md':
            sizeStyles = 'px-4 py-2 text-base';
            break;
        case 'lg':
            sizeStyles = 'px-6 py-3 text-lg';
            break;
    }

    return (
        <button className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
