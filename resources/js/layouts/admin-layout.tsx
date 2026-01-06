import React, { ReactNode, useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import { ChevronRight, LayoutDashboard, ReceiptText, ClipboardList, Package, Layers, Users, BookOpen, Store, Truck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    fullWidth?: boolean;
}

type AdminPageProps = {
    auth: {
        user: {
            name: string;
            role: string;
        };
    };
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Admin', fullWidth = false }) => {
    const { auth } = usePage<AdminPageProps>().props;
    const [incidenceCount, setIncidenceCount] = useState<number | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        let aborted = false;
        const intervalMs = (import.meta.env.VITE_INCIDENCES_POLL_INTERVAL_MS ? parseInt(import.meta.env.VITE_INCIDENCES_POLL_INTERVAL_MS) : 60000) || 60000;
        const fetchCount = () => {
            fetch(route('admin.products.incidences-count'), { credentials: 'include' })
                .then(r => r.ok ? r.json() : null)
                .then(data => { if (!aborted && data && data.success) setIncidenceCount(data.count); })
                .catch(() => { });
        };
        fetchCount();
        const id = setInterval(fetchCount, intervalMs);
        return () => { aborted = true; clearInterval(id); };
    }, []);

    const navLinks = [
        { name: 'Inicio', href: route('admin.dashboard'), icon: LayoutDashboard },
        { name: 'Comprobantes', href: route('admin.payment-proofs.pending'), icon: ReceiptText },
        { name: 'Ordenes', href: route('admin.orders'), icon: ClipboardList },
        { name: 'Gestión de productos', href: route('admin.products'), icon: Package },
        { name: 'Orden de tipos', href: route('admin.product-types.order'), icon: Layers },
        { name: 'Familias', href: route('admin.product-families.index'), icon: Layers }, // Podría ser otro icono si existe
        { name: 'Vacantes', href: route('admin.vacancies.index'), icon: Users },
        { name: 'Catálogos', href: route('admin.catalogs.index'), icon: BookOpen },
        { name: 'Recolecciones DHL', href: route('admin.dhl-pickups.index'), icon: Truck },
        { name: 'Incidencias', href: route('admin.products.incidences'), icon: AlertTriangle, badge: incidenceCount },
    ];

    return (
        <div className="min-h-screen bg-gray-100 text-slate-900 relative">
            {/* Optional: WhatsApp widget in admin area too */}
            <WhatsAppWidget />
            <Head title={title} />

            {/* Header */}
            <header className="bg-white shadow sticky top-0 z-40">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            {/* Hamburguesa para móvil */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="sm:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
                                aria-label="Abrir menú"
                            >
                                <div className="w-6 h-5 relative flex flex-col justify-between">
                                    <motion.span
                                        animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                                        className="w-full h-0.5 bg-current rounded-full"
                                    />
                                    <motion.span
                                        animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                        className="w-full h-0.5 bg-current rounded-full"
                                    />
                                    <motion.span
                                        animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                                        className="w-full h-0.5 bg-current rounded-full"
                                    />
                                </div>
                            </button>

                            <div className="flex-shrink-0 flex items-center ml-2 sm:ml-0">
                                <Link href={route('admin.dashboard')} className="flex items-center gap-2 group">
                                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
                                        <LayoutDashboard className="w-4 h-4" />
                                    </div>
                                    <h1 className="text-sm font-black uppercase tracking-tighter text-slate-900">Admin</h1>
                                </Link>
                                {title && title !== 'Admin' && (
                                    <div className="flex items-center">
                                        <ChevronRight className="w-4 h-4 mx-1 text-slate-300" />
                                        <h2 className="text-sm font-bold text-slate-500 truncate max-w-[120px] sm:max-w-none">{title}</h2>
                                    </div>
                                )}
                            </div>

                            <div className="hidden sm:ml-6 lg:flex sm:space-x-4 xl:space-x-8">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-xs xl:text-sm font-medium relative"
                                    >
                                        {link.name}
                                        {typeof link.badge === 'number' && link.badge > 0 && (
                                            <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-600 text-white">
                                                {link.badge}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="hidden md:block mr-2 text-right">
                                <span className="block text-xs font-semibold text-gray-900">{auth.user.name}</span>
                                <span className="block text-[10px] text-gray-500 capitalize">{auth.user.role}</span>
                            </div>

                            <Link
                                href={route('admin.dashboard')}
                                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Panel Principal"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                            </Link>

                            <Link
                                href={route('home')}
                                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                title="Ir a la Tienda"
                            >
                                <Store className="w-5 h-5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Tienda</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="sm:hidden bg-white border-t overflow-hidden shadow-lg overflow-y-auto max-h-[calc(100vh-64px)]"
                        >
                            <nav className="p-4 space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                                    >
                                        <div className="flex items-center gap-3">
                                            <link.icon className="w-5 h-5 text-gray-400" />
                                            <span className="font-semibold">{link.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {typeof link.badge === 'number' && link.badge > 0 && (
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                                                    {link.badge}
                                                </span>
                                            )}
                                            <ChevronRight className="w-4 h-4 text-gray-300" />
                                        </div>
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Main content */}
            <main className="py-10">
                <div className={fullWidth ? 'w-full px-4 sm:px-6 lg:px-8' : 'max-w-7xl mx-auto sm:px-6 lg:px-8'}>
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white shadow-inner py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} E-Commerce El Boom Admin. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default AdminLayout;