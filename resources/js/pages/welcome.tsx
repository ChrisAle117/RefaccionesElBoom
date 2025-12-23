import Carousel from '@/components/carousel';
import { TabNavigation } from '@/components/TabNavigation';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Facebook, Instagram } from 'lucide-react';
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

export default function Welcome() {
    usePage<SharedData>();

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
        <AppLayout>
            <Head title="El Boom Tractopartes" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative">
                {/* Hero / Carousel */}
                <div className="relative z-10 pt-4">
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
        </AppLayout>
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
