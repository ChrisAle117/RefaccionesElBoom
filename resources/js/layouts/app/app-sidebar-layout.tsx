import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { type PropsWithChildren } from 'react';
import { type BreadcrumbItem } from '@/types';
import { NavUser } from '@/components/nav-user';
import React from 'react';
import { SearchBar } from '@/components/search-bar';
import { Link, usePage } from '@inertiajs/react';
import { Cart } from '@/components/shopping-car';
import { ShoppingCarView } from '@/components/shopping-car-view';
import { type SharedData } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Facebook, Instagram, MessageCircle, LayoutDashboard } from 'lucide-react';
import CoachmarkTutorial from '@/components/CoachmarkTutorial';
import WhatsAppWidget from '@/components/WhatsAppWidget';

export default function AppSidebarLayout({
    children,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const [isCartOpen, setIsCartOpen] = React.useState(false);
    const [showMobileSearch, setShowMobileSearch] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const { auth } = usePage<SharedData>().props;

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
            <header className="fixed top-0 left-0 z-50 w-full bg-[#FBCC13] dark:bg-yellow-500 shadow-md text-slate-900 p-4 flex items-center h-[72px] min-h-[72px] transition-all duration-300">
                {/* Logo */}
                <div className="flex items-center flex-shrink-0">
                    <Link href="/">
                        <img
                            src={document.documentElement.classList.contains('dark') ? '/images/logotipo.png' : '/images/logotipo.png'}
                            alt="Logo Refaccionaria El Boom"
                            className="h-17 w-auto object-contain cursor-pointer"
                        />
                    </Link>
                </div>
                {/* Barra de búsqueda */}
                <div className="w-1/3 flex justify-start pl-10 max-sm:hidden">
                    <SearchBar />
                </div>
                {/* Contenedor flexible para los elementos restantes */}
                <div className="flex-1 flex  text-black items-center justify-end gap-35 px-4 max-sm:hidden">

                    {/* Mis pedidos */}
                    {auth?.user && (
                        <div>
                            <Link
                                href="/orders"
                                className='cursor-pointer transition-colors hover:text-[#006CFA]'
                            >
                                Mis pedidos
                            </Link>
                        </div>
                    )}
                    {/* Carrito */}
                    {auth?.user && (
                        <div className="cursor-pointer">
                            <Cart onClick={toggleCart} />
                        </div>
                    )}
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
                    {auth?.user && (
                        <div className="cursor-pointer">
                            <Cart onClick={toggleCart} />
                        </div>
                    )}
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
                    {/* Hamburguesa Animada */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="relative z-50 w-10 h-10 flex items-center justify-center focus:outline-none ml-2"
                        aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                    >
                        <div className="relative w-6 h-5">
                            <motion.span
                                animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                                className="absolute block h-0.5 w-6 bg-slate-900 dark:bg-slate-900 rounded-full"
                                transition={{ duration: 0.3 }}
                            />
                            <motion.span
                                animate={isMobileMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                                className="absolute block h-0.5 w-6 bg-slate-900 dark:bg-slate-900 rounded-full top-2"
                                transition={{ duration: 0.2 }}
                            />
                            <motion.span
                                animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                                className="absolute block h-0.5 w-6 bg-slate-900 dark:bg-slate-900 rounded-full top-4"
                                transition={{ duration: 0.3 }}
                            />
                        </div>
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

            {/* Menú móvil desplegable con AnimatePresence */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop opcional si quieres que se cierre al hacer click fuera, o simplemente el menú */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-[40] sm:hidden"
                            onClick={handleCloseMobileMenu}
                        />

                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                            className="absolute top-[72px] left-0 w-full bg-[#FBCC13] dark:bg-yellow-500 shadow-2xl overflow-hidden z-[100] sm:hidden border-t border-yellow-600/20"
                        >
                            <div className="p-6 flex flex-col space-y-4">
                                {/* Usuario o invitado */}
                                {auth?.user ? (
                                    <>
                                        <div className="flex items-center gap-3 pb-4 border-b border-yellow-600/20">
                                            <div className="rounded-full bg-white/20 text-slate-900 w-10 h-10 flex items-center justify-center font-bold text-lg">
                                                {getInitials(auth?.user?.name)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{auth?.user?.name}</span>
                                                <span className="text-xs text-slate-800 opacity-80">{auth?.user?.email}</span>
                                            </div>
                                        </div>

                                        <Link
                                            href={route('profile.edit')}
                                            className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-white/10 text-slate-900 font-semibold transition-colors"
                                            onClick={handleCloseMobileMenu}
                                        >
                                            <span>Mi Perfil</span>
                                            <div className="text-slate-700">→</div>
                                        </Link>

                                        <Link
                                            href="/orders"
                                            className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-white/10 text-slate-900 font-semibold transition-colors"
                                            onClick={handleCloseMobileMenu}
                                        >
                                            <span>Mis Pedidos</span>
                                            <div className="text-slate-700">→</div>
                                        </Link>

                                        {/* Panel de Administración (Solo para admins) */}
                                        {auth?.user?.role === 'admin' && (
                                            <Link
                                                href="/admin/dashboard"
                                                className="flex items-center justify-between py-3 px-2 rounded-lg bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 font-bold transition-colors mt-2"
                                                onClick={handleCloseMobileMenu}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <LayoutDashboard className="w-5 h-5" />
                                                    <span>Panel de Administración</span>
                                                </div>
                                                <div className="text-slate-700">→</div>
                                            </Link>
                                        )}

                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex items-center justify-between w-full text-left py-3 px-2 rounded-lg hover:bg-red-500/10 text-red-700 font-bold transition-colors mt-4"
                                            onClick={handleCloseMobileMenu}
                                        >
                                            <span>Cerrar Sesión</span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-3 pt-2">
                                            <Link
                                                href="/login"
                                                className="w-full py-4 rounded-xl bg-slate-900 text-[#FBCC13] font-bold text-center shadow-lg active:scale-95 transition-transform"
                                                onClick={handleCloseMobileMenu}
                                            >
                                                Iniciar Sesión
                                            </Link>
                                            <Link
                                                href="/register"
                                                className="w-full py-4 rounded-xl bg-white/20 text-slate-900 font-bold text-center border border-slate-900/10 active:scale-95 transition-transform"
                                                onClick={handleCloseMobileMenu}
                                            >
                                                Registrarse
                                            </Link>
                                        </div>
                                    </>
                                )}

                                {/* Redes Sociales */}
                                <div className="pt-6 mt-6 border-t border-yellow-600/20 flex flex-col gap-4">
                                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider opacity-60 px-2">Nuestras Redes</span>
                                    <div className="flex items-center justify-around px-2">
                                        <a href="https://wa.me/527771810370" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/20 rounded-full text-slate-900 hover:bg-green-500 hover:text-white transition-all shadow-sm active:scale-90">
                                            <MessageCircle className="w-6 h-6" />
                                        </a>
                                        <a href="https://www.facebook.com/boomtractopartes/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/20 rounded-full text-slate-900 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90">
                                            <Facebook className="w-6 h-6" />
                                        </a>
                                        <a href="https://www.instagram.com/elboomtractopartes/?hl=es" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/20 rounded-full text-slate-900 hover:bg-pink-600 hover:text-white transition-all shadow-sm active:scale-90">
                                            <Instagram className="w-6 h-6" />
                                        </a>
                                        <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/20 rounded-full text-slate-900 hover:bg-black hover:text-white transition-all shadow-sm active:scale-90">
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.15 8.15 0 0 1-1.33-1.01c-.13 3.1-.11 6.22-.12 9.33-.01 2.01-.5 4.16-1.92 5.62-1.51 1.56-3.83 2.15-5.91 1.9-2.18-.17-4.29-1.31-5.39-3.21-1.22-1.99-1.23-4.66-.23-6.68.91-1.84 2.82-3.13 4.87-3.41 1.02-.15 2.06-.05 3.03.27V12.44a5.13 5.13 0 0 0-2.88-.04c-1.84.47-3.32 2.1-3.6 4-.29 1.72.33 3.63 1.7 4.75 1.45 1.19 3.56 1.41 5.25.64 1.47-.64 2.32-2.18 2.33-3.76.01-4.71.01-9.42.01-14.13-.01-.39-.06-.78-.06-1.17z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

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
                                            console.error("Error rendering ShoppingCarView:", error);
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