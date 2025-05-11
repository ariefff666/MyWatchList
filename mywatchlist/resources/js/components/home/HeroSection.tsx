// src/components/home/HeroSection.tsx
import React from 'react';

const HeroSection: React.FC = () => {
    return (
        <section
            className="relative bg-cover bg-center py-32 text-white md:py-48"
            style={{ backgroundImage: "url('/path/to/your/hero-background.jpg')" }} // Ganti dengan path gambar Anda
        >
            <div className="absolute inset-0 bg-black opacity-60"></div> {/* Overlay */}
            <div className="relative z-10 container mx-auto px-6 text-center">
                <h1 className="mb-6 text-4xl leading-tight font-bold md:text-6xl">Susun Dunia Sinematik Pribadimu.</h1>
                <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-300 md:text-xl">
                    Buat playlist film, anime, dan tontonan favoritmu. Temukan, lacak, dan beri rating untuk semua yang sudah dan akan kamu tonton.
                </p>
                {/* Search bar bisa dipindahkan ke section terpisah atau langsung di sini */}

                <div className="mx-auto max-w-xl">
                    <input
                        type="search"
                        placeholder="Cari film, anime, serial TV..."
                        className="w-full rounded-lg px-6 py-4 text-gray-800 shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                <button className="mt-6 transform rounded-lg bg-blue-600 px-8 py-3 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-blue-700">
                    Mulai Sekarang
                </button>
            </div>
        </section>
    );
};

export default HeroSection;
