import { Bars3Icon, MagnifyingGlassIcon, PlusCircleIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

const Navbar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // Ganti dengan nama user dari state/props jika sudah login
    const userName = 'Nama User'; // Contoh, ambil dari state atau context

    const handleLogout = () => {
        // Implementasi logout Laravel (misal POST ke /logout)
        // Di sini kita bisa menggunakan form tersembunyi atau window.location
        // Untuk Laravel Breeze, biasanya ada route POST /logout
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/logout'; // Sesuaikan dengan route logout Laravel Anda
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <nav className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo / Brand */}
                    <div className="flex-shrink-0">
                        <a href="/dashboard" className="text-2xl font-bold text-sky-400 transition-colors hover:text-sky-300">
                            PlayLister
                        </a>
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="mx-4 hidden max-w-xl flex-grow md:flex">
                        <div className="relative w-full">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="search"
                                name="search"
                                id="search"
                                className="block w-full rounded-md border border-slate-700 bg-slate-800 py-2 pr-3 pl-10 leading-5 text-slate-200 placeholder-slate-400 focus:border-sky-500 focus:ring-sky-500 focus:outline-none sm:text-sm"
                                placeholder="Cari film, anime..."
                            />
                        </div>
                    </div>

                    {/* Navigation Links & User - Desktop */}
                    <div className="hidden items-center space-x-4 md:flex">
                        <button
                            title="Buat Playlist Baru"
                            className="rounded-full p-2 text-slate-300 hover:bg-slate-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
                            // onClick={() => {/* Logika buka modal buat playlist */}}
                        >
                            <PlusCircleIcon className="h-7 w-7" />
                        </button>
                        <div className="relative">
                            <button className="group flex items-center space-x-2 rounded-full p-2 text-slate-300 hover:bg-slate-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none">
                                <UserCircleIcon className="h-7 w-7" />
                                <span className="text-sm font-medium">{userName}</span>
                            </button>
                            {/* Dropdown Menu (Contoh sederhana, bisa dikembangkan) */}
                            <div className="ring-opacity-5 absolute right-0 mt-2 w-48 rounded-md bg-slate-800 py-1 opacity-0 shadow-lg ring-1 ring-black transition-opacity duration-150 ease-in-out group-focus-within:opacity-100">
                                <a href="#" className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">
                                    Profil
                                </a>
                                <button onClick={handleLogout} className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700">
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="rounded-md p-2 text-slate-300 hover:bg-slate-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="border-t border-slate-700 md:hidden">
                    <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                        {/* Search Bar - Mobile */}
                        <div className="relative mb-2 w-full">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="search"
                                name="search-mobile"
                                id="search-mobile"
                                className="block w-full rounded-md border border-slate-700 bg-slate-800 py-2 pr-3 pl-10 leading-5 text-slate-200 placeholder-slate-400 focus:border-sky-500 focus:ring-sky-500 focus:outline-none sm:text-sm"
                                placeholder="Cari film, anime..."
                            />
                        </div>
                        <a
                            href="#"
                            className="flex items-center rounded-md px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-700 hover:text-white"
                            // onClick={() => {/* Logika buka modal buat playlist */}}
                        >
                            <PlusCircleIcon className="mr-2 h-6 w-6" />
                            Buat Playlist
                        </a>
                        <a
                            href="#"
                            className="flex items-center rounded-md px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-700 hover:text-white"
                        >
                            <UserCircleIcon className="mr-2 h-6 w-6" />
                            {userName} (Profil)
                        </a>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center rounded-md px-3 py-2 text-left text-base font-medium text-red-400 hover:bg-red-700 hover:text-white"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
