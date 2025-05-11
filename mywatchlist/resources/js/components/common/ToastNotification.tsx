import { Transition } from '@headlessui/react';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastNotificationProps extends ToastMessage {
    onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastNotificationProps> = ({ id, message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, 3000); // Auto dismiss after 5 seconds
        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    let IconComponent;
    let bgColor = '';
    let textColor = 'text-white';

    switch (type) {
        case 'success':
            IconComponent = CheckCircleIcon;
            bgColor = 'bg-green-600';
            break;
        case 'error':
            IconComponent = XCircleIcon;
            bgColor = 'bg-red-600';
            break;
        case 'warning':
            IconComponent = ExclamationTriangleIcon;
            bgColor = 'bg-yellow-500';
            textColor = 'text-gray-800';
            break;
        case 'info':
        default:
            IconComponent = InformationCircleIcon;
            bgColor = 'bg-blue-600';
            break;
    }

    return (
        <Transition
            show={true}
            appear={true}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div
                className={`w-full max-w-sm ${bgColor} ${textColor} ring-opacity-5 pointer-events-auto overflow-hidden rounded-lg shadow-2xl ring-1 ring-black`}
            >
                <div className="p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <IconComponent className={`h-6 w-6 ${textColor}`} aria-hidden="true" />
                        </div>
                        <div className="ml-3 w-0 flex-1 pt-0.5">
                            <p className="text-sm font-semibold">{message}</p>
                        </div>
                        <div className="ml-4 flex flex-shrink-0">
                            <button
                                type="button"
                                className={`inline-flex rounded-md ${bgColor} ${textColor} hover:opacity-80 focus:ring-2 focus:ring-offset-2 focus:outline-none focus:ring-offset-${type}-50 focus:ring-${type}-600`}
                                onClick={() => onDismiss(id)}
                            >
                                <span className="sr-only">Tutup</span>
                                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    );
};

// Komponen untuk mengelola dan menampilkan semua toast
export const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const handleShowToast = (event: Event) => {
            const customEvent = event as CustomEvent<Omit<ToastMessage, 'id'>>;
            setToasts((prevToasts) => [
                ...prevToasts,
                { ...customEvent.detail, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) },
            ]);
        };

        window.addEventListener('showToast', handleShowToast);
        return () => {
            window.removeEventListener('showToast', handleShowToast);
        };
    }, []);

    const handleDismiss = (id: string) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    return (
        <div
            aria-live="assertive"
            className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-end justify-start px-4 py-6 sm:items-end sm:justify-start sm:p-6" // z-index tinggi
        >
            <div className="mt-16 w-full max-w-sm space-y-3">
                {' '}
                {/* Margin top agar tidak tertutup header */}
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onDismiss={handleDismiss} />
                ))}
            </div>
        </div>
    );
};

// Helper function untuk dispatch toast event
export const showToast = (message: string, type: ToastType = 'info') => {
    window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }));
};
