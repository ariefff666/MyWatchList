// src/components/home/FeaturesSection.tsx
import React from 'react';
// Impor ikon Anda (SVG lebih baik)
// import FilmIcon from '../../assets/icons/film-icon.svg';
// import PlaylistIcon from '../../assets/icons/playlist-icon.svg';
// import StarIcon from '../../assets/icons/star-icon.svg';

interface FeatureCardProps {
    // icon: string; // Path ke SVG atau komponen ikon
    title: string;
    description: string;
    children?: React.ReactNode; // Untuk SVG inline
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, children }) => (
    <div className="transform rounded-xl bg-gray-800 p-8 shadow-2xl transition-transform duration-300 hover:scale-105">
        <div className="mb-6 flex justify-center text-blue-500">
            {/* <img src={icon} alt={title} className="h-16 w-16" /> */}
            {/* Contoh penggunaan SVG inline */}
            {children}
        </div>
        <h3 className="mb-3 text-center text-2xl font-semibold text-white">{title}</h3>
        <p className="text-center leading-relaxed text-gray-400">{description}</p>
    </div>
);

const FeaturesSection: React.FC = () => {
    return (
        <section id="features" className="bg-gray-900 py-20">
            <div className="container mx-auto px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-4xl font-bold text-white">Semua Dalam Satu Tempat</h2>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
                        Kelola daftar tontonanmu dengan mudah dan temukan detail lengkap dari setiap judul.
                    </p>
                </div>
                <div className="grid gap-10 md:grid-cols-3">
                    <FeatureCard
                        title="Temukan dari IMDb"
                        description="Cari dan dapatkan detail lengkap film, serial TV, dan anime langsung dari database IMDb."
                    >
                        {/* Ganti dengan SVG ikon pencarian/IMDb */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-16 w-16"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                    </FeatureCard>
                    <FeatureCard
                        title="Playlist Kustom"
                        description="Buat playlist sesuai keinginanmu: 'Sudah Ditonton', 'Ingin Ditonton', 'Favorit Anime', dan lainnya."
                    >
                        {/* Ganti dengan SVG ikon playlist */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-16 w-16"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
                            />
                        </svg>
                    </FeatureCard>
                    <FeatureCard title="Rating Pribadi" description="Berikan rating versimu sendiri untuk setiap tontonan yang ada di playlistmu.">
                        {/* Ganti dengan SVG ikon bintang */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-16 w-16"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.82.61l-4.725-2.885a.562.562 0 0 0-.652 0l-4.725 2.885a.562.562 0 0 1-.82-.61l1.285-5.385a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                            />
                        </svg>
                    </FeatureCard>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
