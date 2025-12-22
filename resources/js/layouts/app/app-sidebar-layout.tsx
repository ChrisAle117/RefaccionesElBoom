import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { NavUser } from '@/components/nav-user';
import React from 'react';
import { SearchBar } from '@/components/search-bar';
import { Link, usePage } from '@inertiajs/react';
import { Cart } from '@/components/shopping-car';
import { ShoppingCarView } from '@/components/shopping-car-view';
import { Menu, X } from 'lucide-react';
import { TabNavigation } from '@/components/TabNavigation';
import { LocationSelector } from '@/components/location-selector';
import CoachmarkTutorial from '@/components/CoachmarkTutorial';
import WhatsAppWidget from '@/components/WhatsAppWidget';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const [isCartOpen, setIsCartOpen] = React.useState(false);
    const [showMobileSearch, setShowMobileSearch] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const pageProps = usePage().props as any;
    const auth = pageProps?.auth ?? {};

    const toggleCart = () => setIsCartOpen(!isCartOpen);
    const handleMobileSearchClick = () => setShowMobileSearch(true);
    const handleCloseMobileSearch = () => setShowMobileSearch(false);
    const handleOpenMobileMenu = () => setIsMobileMenuOpen(true);
    const handleCloseMobileMenu = () => setIsMobileMenuOpen(false);

    // Función para obtener iniciales del usuario
    const getInitials = (name?: string) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <AppShell>
            <CoachmarkTutorial />
            {/* Floating WhatsApp widget appears on all pages */}
            <WhatsAppWidget />
            {/* Barra superior fija */}
            <header className="fixed top-0 left-0 z-50 w-full bg-[#FBCC13] text-white p-4 flex items-center border-b-2 border-red-600 h-[72px] min-h-[72px]">
                {/* Logo */}
                <div className="flex items-center flex-shrink-0">
                    <a href="/dashboard">
                        <img
                            src={document.documentElement.classList.contains('dark') ? '/images/logotipo.png' : '/images/logotipo.png'}
                            alt="Logo Refaccionaria El Boom"
                            className="h-17 w-auto object-contain cursor-pointer"
                        />
                    </a>
                </div>
                {/* Barra de búsqueda */}
                <div className="w-1/3 flex justify-start pl-10 max-sm:hidden">
                    <SearchBar />
                </div>
                {/* Contenedor flexible para los elementos restantes */}
                <div className="flex-1 flex  text-black items-center justify-end gap-35 px-4 max-sm:hidden">
                    
                    {/* Mis pedidos */}
                    <div>
                        <Link
                            href="/orders"
                            className='cursor-pointer transition-colors'
                        >
                            Mis pedidos
                        </Link>
                    </div>
                    {/* Carrito */}
                    <div className="cursor-pointer">
                        <Cart onClick={toggleCart} />
                    </div>
                    {/* Usuario */}
                    <div className="flex items-center cursor-pointer">
                        {auth?.user ? (
                            <NavUser />
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="hover:text-[#006CFA]">Iniciar sesión</Link>
                                <Link href="/register" className="hover:text-[#006CFA]">Registrarse</Link>
                            </div>
                        )}
                    </div>
                </div>
                {/* Iconos y links para pantallas pequeñas */}
                <div className={`flex items-center space-x-1 flex-1 justify-end sm:hidden ${showMobileSearch ? 'max-sm:hidden' : ''}`}>
                    {/* Carrito */}
                    <div className="cursor-pointer">
                        <Cart onClick={toggleCart} />
                    </div>
                    {/* Lupa */}
                    <button
                        className="flex items-center justify-center ml-2 p-2 rounded-full hover:bg-[#0055b3] transition-colors"
                        onClick={handleMobileSearchClick}
                        aria-label="Buscar"
                        type="button"
                    >
                        <img
                            src="https://images.icon-icons.com/561/PNG/512/search-circular-symbol_icon-icons.com_53800.png"
                            alt="Buscar"
                            className="h-7 w-7 opacity-80 invert"
                        />
                    </button>
                    {/* Hamburguesa */}
                    <button
                        className="flex items-center justify-center ml-2 p-2 rounded-full hover:bg-[#0055b3] transition-colors"
                        onClick={handleOpenMobileMenu}
                        aria-label="Abrir menú"
                        type="button"
                    >
                        <Menu className="h-7 w-7" />
                    </button>
                </div>
                {/* Mobile search bar overlay: centrada, sin borde amarillo, con animación */}
                {showMobileSearch && (
                    <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center sm:hidden animate-slide-in-left pointer-events-none">
                        <div className="w-[90%] max-w-lg mx-auto relative pointer-events-auto">
                            <div className="relative flex items-center">
                                <SearchBar />
                                <button
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 bg-white rounded-full p-1.5 shadow hover:bg-gray-200 transition-colors"
                                    onClick={handleCloseMobileSearch}
                                    aria-label="Cerrar búsqueda"
                                    type="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Animación para mobile search */}
                <style>
                    {`
                        @keyframes slideInLeft {
                            0% {
                                transform: translateX(100%);
                                opacity: 0;
                            }
                            100% {
                                transform: translateX(0);
                                opacity: 1;
                            }
                        }
                        .animate-slide-in-left {
                            animation: slideInLeft 0.3s cubic-bezier(0.4,0,0.2,1);
                        }
                    `}
                </style>
            </header>

            {/* Menú lateral móvil */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[200] flex">
                    {/* Fondo oscuro */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-40"
                        onClick={handleCloseMobileMenu}
                    />
                    {/* Drawer */}
                    <aside className="relative ml-auto w-72 max-w-full h-full bg-white shadow-lg z-[201] animate-slide-in-left flex flex-col">
                        {/* Cerrar */}
                        <button
                            className="absolute top-4 right-4 text-gray-700 hover:text-[#006CFA] transition-colors "
                            onClick={handleCloseMobileMenu}
                            aria-label="Cerrar menú"
                        >
                            <X className="h-7 w-7" />
                        </button>
                        <div className="p-6 pt-12 flex flex-col gap-2 h-full">
                            {/* Usuario o invitado */}
                            {auth?.user ? (
                                <>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="rounded-full bg-gray-200 text-gray-700 w-10 h-10 flex items-center justify-center font-bold text-lg text-black">
                                            {getInitials(auth?.user?.name)}
                                        </div>
                                        <span className="font-semibold text-base text-black">{auth?.user?.name}</span>
                                    </div>
                                    {/* Configuración */}
                                    <Link
                                        href={route('profile.edit')}
                                        className="block py-2 px-4 rounded hover:bg-[#F5F7FA] text-[#006CFA] font-bold mr-[50%]"
                                        onClick={handleCloseMobileMenu}
                                        as="button"
                                        prefetch
                                    >
                                        Configuración
                                    </Link>
                                    {/* Mis pedidos */}
                                    <Link
                                        href="/orders"
                                        className="block py-2 px-4 rounded hover:bg-[#F5F7FA] text-[#006CFA] font-semibold"
                                        onClick={handleCloseMobileMenu}
                                    >
                                        Mis pedidos
                                    </Link>
                                    {/* Cerrar sesión */}
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="block w-full text-left py-2 px-4 rounded hover:bg-[#F5F7FA] text-red-600 mt-auto"
                                        onClick={handleCloseMobileMenu}
                                    >
                                        Cerrar sesión
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="rounded-full bg-gray-200 text-gray-700 w-10 h-10 flex items-center justify-center font-bold text-lg text-black">
                                            {getInitials()}
                                        </div>
                                        <span className="font-semibold text-base text-black">Invitado</span>
                                    </div>
                                    <Link
                                        href="/login"
                                        className="block py-2 px-4 rounded hover:bg-[#F5F7FA] text-[#006CFA] font-bold"
                                        onClick={handleCloseMobileMenu}
                                    >
                                        Iniciar sesión
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="block py-2 px-4 rounded hover:bg-[#F5F7FA] text-[#006CFA] font-semibold"
                                        onClick={handleCloseMobileMenu}
                                    >
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>
                    </aside>
                    <style>
                        {`
            @keyframes slideInLeft {
                0% {
                    transform: translateX(100%);
                    opacity: 0;
                }
                100% {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .animate-slide-in-left {
                animation: slideInLeft 0.3s cubic-bezier(0.4,0,0.2,1);
            }
            `}
                    </style>
                </div>
            )}

            <div className="pt-20">
                <AppContent>
                    {isCartOpen ? (
                        <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900 overflow-auto flex flex-col" style={{ height: '100vh', width: '100vw', top: 0, left: 0 }}>
                            <div className="relative flex-1 min-h-0">
                                <button
                                    onClick={toggleCart}
                                    className="absolute top-4 right-4 text-[#000000] rounded-full p-2 hover:text-[#FBCC13] dark:text-white hover:cursor-pointer z-10"
                                >
                                    Cerrar
                                </button>
                                <div className="pt-16 px-2 sm:px-8">
                                    {(() => {
                                        try {
                                            return <ShoppingCarView />;
                                        } catch (error) {
                                            // console.error("Error rendering ShoppingCarView:", error);
                                            return <p>Error al cargar el carrito de compras.</p>;
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                    ) : (
                        children
                    )}
                </AppContent>
            </div>
        </AppShell>
    );
}