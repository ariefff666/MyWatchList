// resources/js/Pages/Welcome.tsx
import { Head, Link, usePage } from '@inertiajs/react'; // Tambahkan Link
import { useEffect, useState } from 'react';
import LoginForm from './auth/login';
import RegisterForm from './auth/register';

export default function Welcome() {
    const { props } = usePage<{ auth: any; defaultForm?: string }>(); // Tambahkan auth untuk cek user

    const [isLogin, setIsLogin] = useState(true);

    useEffect(() => {
        if (props.defaultForm === 'register') {
            setIsLogin(false);
        }
    }, [props.defaultForm]);

    // Redirect jika sudah login
    useEffect(() => {
        if (props.auth.user) {
            // Jika menggunakan Inertia, redirect bisa dilakukan dari controller
            // atau dengan Inertia.visit('/dashboard') di sini.
            // Untuk kesederhanaan, anggap controller sudah menangani ini.
        }
    }, [props.auth.user]);

    return (
        <>
            <Head title="Selamat Datang di MyWatchList" />
            <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12">
                <div className="relative flex w-full max-w-5xl overflow-hidden rounded-xl bg-gray-800 shadow-2xl">
                    {/* Left Section - Form */}
                    <div className="flex w-full flex-col items-center justify-center p-8 sm:p-10 lg:w-1/2">
                        {/* Ganti warna teks agar kontras dengan background gelap */}
                        <Link href="/">
                            <h1 className="mt-2 mb-8 text-center text-3xl font-bold text-white">
                                My<span className="text-blue-500">Watch</span>List
                            </h1>
                        </Link>

                        <div className="mb-6 text-center">
                            <h2 className="mb-1 text-2xl font-semibold text-white">{isLogin ? 'Selamat Datang Kembali!' : 'Buat Akun Baru'}</h2>
                            <p className="text-sm text-gray-400">
                                {isLogin ? 'Silakan masukkan detail Anda.' : 'Bergabunglah dengan kami dan mulai susun daftar tontonanmu!'}
                            </p>
                        </div>

                        {/* Slider Toggle - Sesuaikan warna */}
                        <div className="relative mb-8 flex h-12 w-full max-w-xs items-center justify-between rounded-full bg-gray-700 p-1">
                            <div
                                className={`absolute top-1 left-1 h-10 w-1/2 rounded-full bg-blue-600 shadow-md transition-all duration-300 ${
                                    isLogin ? 'translate-x-0' : 'translate-x-[96%]' // Sesuaikan jika perlu
                                }`}
                            />
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`z-10 w-1/2 py-2 text-sm font-semibold transition-colors duration-300 ${
                                    isLogin ? 'text-white' : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                Masuk
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`z-10 w-1/2 py-2 text-sm font-semibold transition-colors duration-300 ${
                                    !isLogin ? 'text-white' : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                Daftar
                            </button>
                        </div>

                        {/* Form Section */}
                        <div className="w-full max-w-sm">
                            {isLogin ? <LoginForm canResetPassword={false} setIsLogin={setIsLogin} /> : <RegisterForm setIsLogin={setIsLogin} />}
                        </div>
                    </div>

                    {/* Right Section - Image - Sesuaikan background dan mungkin gambar */}
                    <div className="relative hidden w-1/2 items-center justify-center border-l border-gray-700 bg-gray-800/50 lg:flex">
                        {/* Tambahkan overlay gelap jika gambar terlalu terang */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-800/50 to-transparent"></div>
                        <img
                            src="/images/welcome-cinema.jpg" // Ganti dengan gambar yang lebih tematik, misal interior bioskop, tumpukan tiket, dll.
                            alt="Cinema Illustration"
                            className="h-auto max-h-[700px] w-full object-cover opacity-70" // Sesuaikan opacity atau blending mode
                        />
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-10 text-center">
                            <h2 className="mb-4 text-4xl leading-tight font-bold text-white drop-shadow-lg">Atur Dunia Sinematikmu</h2>
                            <p className="max-w-md text-lg text-gray-200 drop-shadow-md">
                                Temukan, lacak, dan beri peringkat film, serial TV, dan anime favoritmu. Semua dalam satu tempat.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
