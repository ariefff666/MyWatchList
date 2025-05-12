import { Dialog, Transition } from '@headlessui/react'; // Pustaka UI untuk modal aksesibel
import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { Fragment } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
    initialFocus?: React.MutableRefObject<HTMLElement | null>; // Untuk fokus awal
    hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = '2xl', // Default max-width
    initialFocus,
    hideCloseButton = false,
}) => {
    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        '4xl': 'sm:max-w-4xl',
        '5xl': 'sm:max-w-5xl',
        '6xl': 'sm:max-w-6xl',
        '7xl': 'sm:max-w-7xl',
    }[maxWidth];

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-50" // Pastikan z-index cukup tinggi
                onClose={onClose}
                initialFocus={initialFocus}
            >
                {/* Overlay */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                {/* Konten Modal */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className={`w-full ${maxWidthClass} transform overflow-hidden rounded-lg bg-gray-800 text-left align-middle shadow-xl transition-all`}
                            >
                                {title && (
                                    <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
                                        <Dialog.Title as="h3" className="text-lg leading-6 font-semibold text-white">
                                            {title}
                                        </Dialog.Title>
                                        {!hideCloseButton && (
                                            <button type="button" className="text-gray-400 hover:text-white focus:outline-none" onClick={onClose}>
                                                <span className="sr-only">Tutup</span>
                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                )}
                                {/* Children akan dirender di sini, biasanya form atau konten detail */}
                                {children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default Modal;
