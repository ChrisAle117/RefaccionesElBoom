import { ProductCatalog } from '@/components/product-catalog';
import { TabNavigation } from '@/components/TabNavigation';
import { Head, Link, usePage } from '@inertiajs/react';
import { SearchBar } from '@/components/search-bar';
import { Facebook, Instagram } from 'lucide-react';
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
    ];

    const carouselImagesMobile = [
        '/images/c1-21x9.webp',
        '/images/c2-21x9.webp',
        '/images/c3-21x9.webp',

    ];

    return (
        <>
            <Head title="El Boom Tractopartes" />

            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative pt-[72px] pb-[80px]">
                <CoachmarkTutorial />
                {/* Floating WhatsApp widget for guest pages */}
                <WhatsAppWidget />
                <nav className="fixed top-0 left-0 z-50 w-full bg-[#FBCC13]  text-black p-4 flex items-center border-b-2 border-red-600 h-[72px] min-h-[72px] justify-between">
                    {/* DESKTOP NAVBAR*/}
                    <div className="hidden sm:flex w-full items-center justify-between">
                        {/* Izquierda: Logo */}
                        <div className="flex items-center">
                            <img
                                src={
                                    document.documentElement.classList.contains('dark')
                                        ? '/images/logotipo-claro.png'
                                        : '/images/logotipo.png'
                                }
                                alt="El Boom Tractopartes"
                                className="w-auto h-14 md:h-16 lg:h-[60px] xl:h-[64px] object-contain max-h-[64px]"
                            />
                        </div>
                        {/* Centro: Barra de búsqueda */}
                        <div className="w-1/2 flex justify-center">
                            <SearchBar />
                        </div>
                        {/* Derecha: Enlaces de autenticación */}
                        <div className="flex items-center">
                            <Link href="/login" className="mr-4 hover:text-red-600">
                                Iniciar sesión
                            </Link>
                            <Link href="/register" className="hover:text-red-600">
                                Registrarse
                            </Link>
                        </div>
                    </div>

                    {/* MOBILE NAVBAR */}
                    <div
                        className={`flex sm:hidden w-full items-center justify-between relative ${searchOpen ? 'max-sm:hidden' : ''
                            }`}
                    >
                        {/* Logo */}
                        <div className="flex items-center flex-shrink-0">
                            <a href="/" aria-label="Ir al inicio">
                                <img
                                    src={
                                        document.documentElement.classList.contains('dark')
                                            ? '/images/logotipo-claro.png'
                                            : '/images/logotipo.png'
                                    }
                                    alt="Logo Refaccionaria el Boom"
                                    className="h-12 w-auto object-contain max-h-[56px] cursor-pointer"
                                />
                            </a>
                        </div>
                        {/* Iconos */}
                        <div className="flex items-center">
                            {/* Lupa */}
                            <button
                                className="flex items-center justify-center ml-2 p-2 rounded-full hover:bg-[#0055b3] transition-colors"
                                onClick={() => setSearchOpen(true)}
                                aria-label="Buscar"
                                type="button"
                            >
                                <img
                                    src="https://images.icon-icons.com/561/PNG/512/search-circular-symbol_icon-icons.com_53800.png"
                                    alt="Buscar"
                                    className="h-7 w-7 opacity-80"
                                />
                            </button>
                            {/* Usuario */}
                            <Link
                                href="/login"
                                className="flex items-center justify-center ml-2 p-2 rounded-full hover:bg-[#0055b3] transition-colors"
                                aria-label="Iniciar sesión"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-7 w-7"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5.121 17.804A13.937 13.937 0 0112 15c2.856 0 5.536.918 7.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile search bar overlay */}
                    {searchOpen && (
                        <div className="absolute left-0 top-0 w-full h-[72px] flex items-center px-4 bg-[#FBBC13] border-b-2 border-[#FBCC13] z-50 animate-slide-in-left sm:hidden">
                            <div className="relative flex items-center w-full">
                                <SearchBar />
                                <button
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 bg-white rounded-full p-1.5 shadow hover:bg-gray-200 transition-colors"
                                    onClick={() => setSearchOpen(false)}
                                    aria-label="Cerrar búsqueda"
                                    type="button"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                    <style>
                        {`
              @keyframes slideInLeft {
                0% { transform: translateX(100%); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
              }
              .animate-slide-in-left {
                animation: slideInLeft 0.3s cubic-bezier(0.4,0,0.2,1);
              }
            `}
                    </style>
                </nav>

                {/* Carrusel*/}
                <Carousel
                    images={carouselImages}
                    imagesMobile={carouselImagesMobile}
                    interval={6000}
                    className="dark:bg-gray-800 overflow-hidden"
                />

                <TabNavigation
                    stickyOffset="top-[72px]"
                    className="dark:bg-gray-800"
                    contentPadding="px-6 sm:px-8"
                    fullWidth={false}
                />

                {/* Footer */}
                <footer className="sticky bottom-0 w-full bg-gradient-to-b from-white to-transparent dark:from-gray-800 dark:to-gray-900 backdrop-blur-md py-4">
                    <div className="container mx-auto flex flex-col items-center px-6 sm:flex-row sm:justify-between">
                        <div className="hidden sm:block w-[100px]"></div>

                        {/* Redes */}
                        <div className="flex space-x-6 justify-center mb-2 sm:mb-0">
                            <a
                                href="https://wa.me/527771810370"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp"
                            >
                                <FaWhatsapp className="w-6 h-6" />
                            </a>
                            <a
                                href="https://www.facebook.com/boomtractopartes/?locale=es_LA"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Facebook"
                            >
                                <Facebook className="w-6 h-6" />
                            </a>
                            <a
                                href="https://www.instagram.com/elboomtractopartes/?hl=es"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Instagram"
                            >
                                <Instagram className="w-6 h-6" />
                            </a>
                            <a
                                href="https://www.tiktok.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="TikTok"
                            >
                                <SiTiktok className="w-6 h-6" />
                            </a>
                        </div>

                        {/* Openpay */}
                        <div className="hidden sm:block">
                            <img src="/images/openpay.png" alt="Vacantes disponibles" className="w-auto h-10" />
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
