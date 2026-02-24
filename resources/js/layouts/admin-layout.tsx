import React, { ReactNode, useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { ChevronRight, LayoutDashboard, ReceiptText, ClipboardList, Package, Layers, Users, BookOpen, Store, Truck, AlertTriangle, Bell, CheckCheck, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificaciones } from '@/hooks/use-notificaciones';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";

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
    const { url, props } = usePage<AdminPageProps>();
    const { auth } = props;
    const [incidenceCount, setIncidenceCount] = useState<number | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Activar notificaciones por polling y obtener estado
    const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotificaciones();

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
        { name: 'Clientes', href: route('admin.users.index'), icon: Users },
        { name: 'Reportes', href: route('admin.reporting.index'), icon: ReceiptText },
    ];

    return (
        <div className="min-h-screen bg-gray-100 text-slate-900 relative">
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
                                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform shadow-sm">
                                        <LayoutDashboard className="w-4 h-4" />
                                    </div>
                                </Link>
                            </div>

                            <div className="hidden sm:ml-6 lg:flex sm:space-x-1 xl:space-x-4">
                                {navLinks.map((link) => {
                                    const isActive = url.startsWith(new URL(link.href).pathname);
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`inline-flex items-center px-3 pt-1 border-b-2 text-xs xl:text-sm font-black uppercase tracking-tight transition-all relative h-16 ${isActive
                                                ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                                                : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-200'
                                                }`}
                                        >
                                            {link.name}
                                            {typeof link.badge === 'number' && link.badge > 0 && (
                                                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-600 text-white">
                                                    {link.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                            <Sheet onOpenChange={(open) => { if (open) fetchNotifications(true); }}>
                                <SheetTrigger asChild>
                                    <button
                                        aria-label="Abrir notificaciones"
                                        className="relative p-2 text-gray-500 hover:text-blue-600 transition-all duration-200 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md group"
                                    >
                                        <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-bounce-short">
                                                {unreadCount > 9 ? '+9' : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </SheetTrigger>
                                <SheetContent className="w-full sm:max-w-md p-0 overflow-hidden flex flex-col">
                                    <SheetHeader className="p-6 border-b bg-slate-50">
                                        <div className="flex items-center justify-between">
                                            <SheetTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                                <Bell className="w-5 h-5 text-blue-600" />
                                                Notificaciones
                                            </SheetTitle>
                                            <div className="flex items-center gap-3">
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={() => markAsRead(notifications.filter(n => !n.leida).map(n => n.id))}
                                                        className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                                                    >
                                                        <CheckCheck className="w-3 h-3" />
                                                        Marcar todas como leídas
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </SheetHeader>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                                        {notifications.filter(n => !n.leida).length === 0 ? (
                                            <div className="h-40 flex flex-col items-center justify-center text-gray-400 gap-2">
                                                <Inbox className="w-8 h-8 opacity-20" />
                                                <p className="text-xs font-semibold uppercase tracking-widest text-center px-4">Todas las notificaciones han sido leídas</p>
                                            </div>
                                        ) : (
                                            notifications.filter(n => !n.leida).map((n) => (
                                                <div
                                                    key={n.id}
                                                    className="p-4 rounded-xl border bg-white border-blue-100 shadow-sm ring-1 ring-blue-50 transition-all duration-200 relative group overflow-hidden"
                                                >
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 transition-all" />
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
                                                            {n.titulo}
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-gray-400 text-right">
                                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                                                        {n.mensaje}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead([n.id]);
                                                            }}
                                                            className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"
                                                        >
                                                            <CheckCheck className="w-3 h-3" />
                                                            Marcar como leída
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-4 border-t bg-white">
                                        <SheetClose asChild>
                                            <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors shadow-sm">
                                                Cerrar Panel
                                            </button>
                                        </SheetClose>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <div className="hidden md:block mr-2 text-right">
                                <span className="block text-xs font-semibold text-gray-900">{auth.user.name}</span>
                                <span className="block text-[10px] text-gray-500 capitalize">{auth.user.role}</span>
                            </div>

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