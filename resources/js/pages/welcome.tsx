import Carousel from '@/components/carousel';
import { TabNavigation } from '@/components/TabNavigation';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import React from 'react';

export default function Welcome() {
    usePage<SharedData>();

    // SEO dinámico basado en la pestaña activa
    const [pageTitle, setPageTitle] = React.useState('Refaccionaria El Boom | Tractopartes Nuevas y Usadas');
    const [metaDescription, setMetaDescription] = React.useState('Especialistas en tractopartes nuevas y usadas. Calidad y servicio para tu tractocamión en México.');

    React.useEffect(() => {
        const updateSeo = () => {
            const path = window.location.pathname;
            const params = new URLSearchParams(window.location.search);
            const productType = params.get('type');

            if (path.includes('/productos')) {
                const title = productType
                    ? `${productType.charAt(0).toUpperCase() + productType.slice(1)} | Refaccionaria El Boom`
                    : 'Catálogo de Productos | Refaccionaria El Boom';
                setPageTitle(title);
                setMetaDescription(`Explora nuestro amplio catálogo de refacciones${productType ? ' para ' + productType : ''}: faros LED, bocinas, suspensiones y más.`);
            } else if (path.includes('/nosotros')) {
                setPageTitle('Sobre Nosotros | Refaccionaria El Boom');
                setMetaDescription('Conoce la historia y el compromiso de Refaccionaria El Boom con el transporte de carga en México.');
            } else if (path.includes('/sucursales')) {
                setPageTitle('Nuestras Sucursales | Refaccionaria El Boom');
                setMetaDescription('Encuentra la sucursal de Refaccionaria El Boom más cercana a ti.');
            } else if (path.includes('/deshuesadero')) {
                setPageTitle('Deshuesadero de Tractocamiones | Refaccionaria El Boom');
                setMetaDescription('Venta de tractopartes usadas y componentes recuperados con garantía.');
            } else if (path.includes('/vacantes')) {
                setPageTitle('Bolsa de Trabajo | Únete al equipo del Boom');
                setMetaDescription('Buscas empleo? Conoce nuestras vacantes disponibles y únete a Refaccionaria El Boom.');
            } else {
                setPageTitle('Refaccionaria El Boom | Tractopartes Nuevas y Usadas');
                setMetaDescription('Especialistas en tractopartes nuevas y usadas en México. Calidad y servicio excepcional.');
            }
        };

        updateSeo();
        window.addEventListener('popstate', updateSeo);
        return () => window.removeEventListener('popstate', updateSeo);
    }, []);

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
        <AppLayout fullWidth={true}>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                {/* Metas dinámicos de OG para compartir */}
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />


                {/* Preload de imagen LCP del carrusel */}
                <link
                    rel="preload"
                    as="image"
                    href="/images/c1-21x9.webp"
                />
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative">
                {/* Hero / Carousel - Full Width */}
                <div className="relative z-10 w-full font-sans">
                    <Carousel
                        images={carouselImages}
                        imagesMobile={carouselImagesMobile}
                        interval={6000}
                        className="mb-8"
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
                                <SocialLink href="https://wa.me/527771810370" icon={<MessageCircle />} label="WhatsApp" color="hover:text-green-500" />
                                <SocialLink href="https://www.facebook.com/boomtractopartes/?locale=es_LA" icon={<Facebook />} label="Facebook" color="hover:text-blue-600" />
                                <SocialLink href="https://www.instagram.com/elboomtractopartes/?hl=es" icon={<Instagram />} label="Instagram" color="hover:text-pink-600" />
                                <SocialLink
                                    href="https://www.tiktok.com/@elboomtractopartes"
                                    icon={
                                        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-full h-full">
                                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.15 8.15 0 0 1-1.33-1.01c-.13 3.1-.11 6.22-.12 9.33-.01 2.01-.5 4.16-1.92 5.62-1.51 1.56-3.83 2.15-5.91 1.9-2.18-.17-4.29-1.31-5.39-3.21-1.22-1.99-1.23-4.66-.23-6.68.91-1.84 2.82-3.13 4.87-3.41 1.02-.15 2.06-.05 3.03.27V12.44a5.13 5.13 0 0 0-2.88-.04c-1.84.47-3.32 2.1-3.6 4-.29 1.72.33 3.63 1.7 4.75 1.45 1.19 3.56 1.41 5.25.64 1.47-.64 2.32-2.18 2.33-3.76.01-4.71.01-9.42.01-14.13-.01-.39-.06-.78-.06-1.17z" />
                                        </svg>
                                    }
                                    label="TikTok"
                                    color="hover:text-black dark:hover:text-white"
                                />
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
            className={`text-gray-400 transition-all duration-300 transform hover:scale-110 ${color} w-12 h-12 flex items-center justify-center`}
        >
            <div className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                {icon}
            </div>
        </a>
    );
}
