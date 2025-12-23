import React, { ReactNode, useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import WhatsAppWidget from '@/components/WhatsAppWidget';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    fullWidth?: boolean;
}

type AdminPageProps = { auth: unknown };

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Admin', fullWidth = false }) => {
    const { auth } = usePage<AdminPageProps>().props;
    const [incidenceCount, setIncidenceCount] = useState<number | null>(null);

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

    return (
        <div className="min-h-screen bg-gray-100 relative">
            {/* Optional: WhatsApp widget in admin area too */}
            <WhatsAppWidget />
            <Head title={title} />

            {/* Header */}
            <header className="bg-white shadow">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold">Panel de Administración</h1>
                            </div>

                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    href={route('admin.dashboard')}
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Inicio
                                </Link>
                                <Link
                                    href={route('admin.payment-proofs.pending')}
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Comprobantes
                                </Link>
                                <Link
                                    href={route('admin.orders')}
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Ordenes
                                </Link>
                                <Link
                                    href={route('admin.products')}
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Gestión de productos
                                </Link>
                                <Link
                                    href={route('admin.product-types.order')}
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Orden de tipos
                                </Link>
                                <Link
                                    href={route('admin.product-families.index')}
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Familias
                                </Link>
                                <Link
                                    href={route('admin.vacancies.index')}
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Vacantes
                                </Link>

                                <Link
                                    href={route('admin.catalogs.index')}
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Catálogos
                                </Link>
                                <Link
                                    href={route('admin.dhl-pickups.index')}
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Recolecciones DHL
                                </Link>
                                <Link
                                    href={route('admin.products.incidences')}
                                    className="relative border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Incidencias
                                    {incidenceCount !== null && incidenceCount > 0 && (
                                        <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-600 text-white">
                                            {incidenceCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="ml-3 relative">
                                <div>
                                    <span className="text-sm font-medium text-gray-700">{auth.user.name}</span>
                                </div>
                            </div>
                            <Link
                                href={route('dashboard')}
                                className="ml-4 text-sm text-blue-600 hover:text-blue-900"
                            >
                                Volver a Tienda
                            </Link>
                        </div>
                    </div>
                </div>
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