import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import React, { Fragment, PropsWithChildren, createContext, useState } from 'react';

interface DropDownContextType {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    toggleOpen: () => void;
}

const DropDownContext = createContext<DropDownContextType | undefined>(undefined);

interface DropdownProps extends PropsWithChildren {
    align?: 'left' | 'right' | 'top'; // Menambahkan 'top'
    width?: string | number; // '48' (Tailwind class w-48) atau angka untuk pixel
    contentClasses?: string;
    trigger: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({
    align = 'right',
    width = '48', // default w-48
    contentClasses = 'py-1 bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5',
    trigger,
    children,
}) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    let alignmentClasses = 'origin-top';
    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    } else if (align === 'top') {
        // Posisi dropdown di atas trigger
        alignmentClasses = 'origin-bottom bottom-full mb-2';
    }

    let widthClasses = '';
    if (width === '48') widthClasses = 'w-48';
    else if (width === '60')
        widthClasses = 'w-60'; // Contoh tambahan
    else if (width === '72') widthClasses = 'w-72';
    else if (typeof width === 'string' && width.startsWith('w-'))
        widthClasses = width; // Jika sudah class Tailwind
    else if (typeof width === 'number') widthClasses = `w-[${width}px]`; // Untuk pixel kustom

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">
                <div onClick={toggleOpen}>{trigger}</div>

                <Transition
                    as={Fragment}
                    show={open}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <div
                        className={`absolute z-50 mt-2 ${widthClasses} rounded-md shadow-lg ${alignmentClasses}`}
                        onClick={() => setOpen(false)} // Tutup dropdown saat konten diklik
                    >
                        <div className={`rounded-md ${contentClasses}`}>{children}</div>
                    </div>
                </Transition>
            </div>
        </DropDownContext.Provider>
    );
};

interface DropdownLinkProps extends PropsWithChildren {
    href: string;
    method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
    as?: 'button' | 'a';
    className?: string;
    active?: boolean; // Untuk menandai link aktif
}

const DropdownLink: React.FC<DropdownLinkProps> = ({ href, method = 'get', as = 'a', className = '', active = false, children, ...props }) => {
    const baseClasses =
        'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-200 hover:bg-gray-600 focus:outline-none focus:bg-gray-600 transition duration-150 ease-in-out';
    const activeClasses = active ? 'bg-gray-600 font-semibold' : '';

    return (
        <Link href={href} method={method} as={as} className={`${baseClasses} ${activeClasses} ${className}`} {...props}>
            {children}
        </Link>
    );
};

interface DropdownButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
}
const DropdownButton: React.FC<DropdownButtonProps> = ({ className = '', children, ...props }) => {
    const baseClasses =
        'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-200 hover:bg-gray-600 focus:outline-none focus:bg-gray-600 transition duration-150 ease-in-out';
    return (
        <button
            type="button" // Default ke button, bisa di-override
            className={`${baseClasses} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

// Dropdown.Link = DropdownLink;
// Dropdown.Button = DropdownButton; // Menambahkan Dropdown.Button

export default Dropdown;
