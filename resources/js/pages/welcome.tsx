import { ProductCatalog } from '@/components/product-catalog';
import { TabNavigation } from '@/components/TabNavigation';
import { Head, Link, usePage } from '@inertiajs/react';
import { SearchBar } from '@/components/search-bar';
import { Facebook, Instagram, User, Search, Menu, X, ShoppingBag } from 'lucide-react';
import Ubication from '@/components/ubication';
import { Catalog } from '@/components/catalog';
import Carousel from '@/components/carousel';
import AboutUs from '@/components/about-us';
import { FaWhatsapp } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { type SharedData } from '@/types';
import { useState } from 'react';
import React from 'react';
import CoachmarkTutorial from '@/components/CoachmarkTutorial';
import WhatsAppWidget from '@/components/WhatsAppWidget';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [searchOpen, setSearchOpen] = useState(false);


    const carouselImages = [
        '/images/c1-21x9.webp',
        '/images/c2-21x9.webp',
        '/images/c3-21x9.webp',
        '/images/c4.png',
    ];

    const carouselImagesMobile = [
        '/images/c1.png',
        '/images/c2.png',
        '/images/c3.png',
        '/images/c4.png',
    ];

    return (
        <>
            <Head title="El Boom Tractopartes" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative pt-[72px] pb-[80px]">
                <CoachmarkTutorial />
                {/* Floating WhatsApp widget for guest pages */}
                <WhatsAppWidget />

                {/* NAVBAR */}
                <nav className="fixed top-0 left-0 z-50 w-full bg-[#FBCC13] dark:bg-yellow-500 shadow-md text-slate-900 border-b border-yellow-500/50 h-[72px] min-h-[72px] transition-all duration-300">
                    <div className="mx-auto container h-full px-4 sm:px-6 lg:px-8">
                        {/* DESKTOP NAVBAR */}
                        <div className="hidden sm:flex w-full h-full items-center justify-between gap-8">
                            {/* Logo */}
                            <Link href="/" className="flex-shrink-0 transition-transform hover:scale-105 duration-200">
                                <img
                                    src={
                                        document.documentElement.classList.contains('dark')
                                            ? '/images/logotipo-claro.png'
                                            : '/images/logotipo.png'
                                    }
                                    alt="El Boom Tractopartes"
                                    className="h-10 md:h-12 w-auto object-contain"
                                />
                            </Link>

                            {/* Search */}
                            <div className="flex-1 max-w-2xl flex justify-center">
                                <SearchBar />
                            </div>

                            {/* Auth Links */}
                            <div className="flex items-center space-x-6 text-sm font-semibold tracking-wide">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 rounded-lg hover:bg-black/10 transition-colors duration-200"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2.5 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        </div>

                        {/* MOBILE NAVBAR */}
                        <div className={`flex sm:hidden w-full h-full items-center justify-between ${searchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            {/* Logo */}
                            <Link href="/">
                                <img
                                    src="/images/logotipo.png"
                                    alt="Logo El Boom"
                                    className="h-10 w-auto object-contain"
                                />
                            </Link>

                            {/* Icons */}
                            <div className="flex items-center space-x-2">
                                <button
                                    className="p-2.5 rounded-full hover:bg-black/10 active:scale-95 transition-all"
                                    onClick={() => setSearchOpen(true)}
                                    aria-label="Buscar"
                                >
                                    <Search className="h-6 w-6 text-slate-800" />
                                </button>
                                <Link
                                    href="/login"
                                    className="p-2.5 rounded-full hover:bg-black/10 active:scale-95 transition-all"
                                    aria-label="Perfil"
                                >
                                    <User className="h-6 w-6 text-slate-800" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search Overlay */}
                    <div
                        className={`absolute inset-0 bg-[#FBCC13] px-4 flex items-center z-50 transition-transform duration-300 ease-in-out sm:hidden ${searchOpen ? 'translate-x-0' : 'translate-x-full'
                            }`}
                    >
                        <div className="flex items-center w-full gap-2">
                            <div className="flex-1">
                                <SearchBar />
                            </div>
                            <button
                                onClick={() => setSearchOpen(false)}
                                className="p-2 bg-white/20 rounded-full text-slate-800 hover:bg-white/40 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Hero / Carousel */}
                <div className="relative z-10">
                    <Carousel
                        images={carouselImages}
                        imagesMobile={carouselImagesMobile}
                        interval={6000}
                        className="shadow-2xl mb-8"
                    />
                </div>

                {/* Main Content Area */}
                <main className="container mx-auto">
                    <TabNavigation
                        stickyOffset="top-[80px]"
                        className="dark:bg-gray-800 rounded-xl my-6"
                        contentPadding="px-4 sm:px-0"
                        fullWidth={false}
                    />
                </main>

                {/* Footer */}
                <footer className="mt-auto bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <div className="container mx-auto px-6 py-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                            {/* Brand / Copyright */}
                            <div className="text-center md:text-left">
                                <p className="text-sm text-gray-500 font-medium">
                                    © {new Date().getFullYear()} El Boom Tractopartes.
                                </p>
                            </div>

                            {/* Social Icons */}
                            <div className="flex space-x-6">
                                <SocialLink href="https://wa.me/527771810370" icon={<FaWhatsapp />} label="WhatsApp" color="hover:text-green-500" />
                                <SocialLink href="https://www.facebook.com/boomtractopartes/?locale=es_LA" icon={<Facebook />} label="Facebook" color="hover:text-blue-600" />
                                <SocialLink href="https://www.instagram.com/elboomtractopartes/?hl=es" icon={<Instagram />} label="Instagram" color="hover:text-pink-600" />
                                <SocialLink href="https://www.tiktok.com" icon={<SiTiktok />} label="TikTok" color="hover:text-black dark:hover:text-white" />
                            </div>

                            {/* Trust Badge */}
                            <div className="opacity-80 hover:opacity-100 transition-opacity">
                                <img src="/images/openpay.png" alt="Pagos Seguros" className="h-8 w-auto mix-blend-multiply dark:mix-blend-normal" />
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

function SocialLink({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className={`text-gray-400 transition-all duration-300 transform hover:scale-110 ${color} w-6 h-6 [&>svg]:w-full [&>svg]:h-full`}
        >
            {icon}
        </a>
    );
}

