// src/components/common/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-gray-700 bg-gray-900">
            <div className="container mx-auto px-6 py-8 text-center">
                <a href="/" className="text-xl font-bold text-white transition-colors duration-300 hover:text-blue-400">
                    Film<span className="text-blue-500">Lister</span>
                </a>
                <p className="mt-4 text-sm text-gray-500">© {new Date().getFullYear()} FilmLister. Dibuat dengan ❤️ untuk para pecinta film.</p>
                <div className="mt-4">
                    <a href="#" className="px-2 text-sm text-gray-400 hover:text-white">
                        Tentang Kami
                    </a>
                    <a href="#" className="px-2 text-sm text-gray-400 hover:text-white">
                        Privasi
                    </a>
                    <a href="#" className="px-2 text-sm text-gray-400 hover:text-white">
                        Kontak
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
