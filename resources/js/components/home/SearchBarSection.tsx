// src/components/home/SearchBarSection.tsx
import React, { useState } from 'react';
// Anda mungkin butuh ikon search
// import { SearchIcon } from '@heroicons/react/solid'; // Contoh

const SearchBarSection: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Logika pencarian menggunakan API IMDb
        console.log('Mencari:', searchTerm);
    };

    return (
        <section className="bg-gray-800 py-16">
            {' '}
            {/* Atau warna lain yang kontras */}
            <div className="container mx-auto px-6">
                <h2 className="mb-8 text-center text-3xl font-semibold text-white">Temukan Tontonan Berikutnya</h2>
                <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl items-center overflow-hidden rounded-lg bg-white shadow-xl">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Masukkan judul film, anime, atau serial TV..."
                        className="w-full px-6 py-4 leading-tight text-gray-700 focus:outline-none"
                    />
                    <button type="submit" className="bg-blue-600 p-4 text-white transition-colors duration-300 hover:bg-blue-700">
                        {/* <SearchIcon className="h-6 w-6" /> Ganti dengan SVG atau ikon Anda */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                            />
                        </svg>
                    </button>
                </form>
            </div>
        </section>
    );
};

export default SearchBarSection;
