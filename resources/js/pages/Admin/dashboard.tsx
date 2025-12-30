import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import {
    ReceiptText,
    ClipboardList,
    Package,
    Layers,
    Users,
    BookOpen,
    Truck,
    AlertTriangle,
    ChevronRight,
    LayoutDashboard
} from 'lucide-react';

const Dashboard: React.FC = () => {
    const adminModules = [
        {
            title: 'Comprobantes',
            description: 'Revisa y aprueba comprobantes de pago pendientes de verificación.',
            href: route('admin.payment-proofs.pending'),
            icon: ReceiptText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'hover:border-blue-200'
        },
        {
            title: 'Órdenes',
            description: 'Gestiona los pedidos de los clientes y su estado de procesamiento.',
            href: route('admin.orders'),
            icon: ClipboardList,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'hover:border-emerald-200'
        },
        {
            title: 'Productos',
            description: 'Controla el catálogo completo de productos y existencias.',
            href: route('admin.products'),
            icon: Package,
            color: 'text-violet-600',
            bgColor: 'bg-violet-50',
            borderColor: 'hover:border-violet-200'
        },
        {
            title: 'Familias',
            description: 'Administra agrupaciones de variantes y colores de productos.',
            href: route('admin.product-families.index'),
            icon: Layers,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'hover:border-orange-200'
        },
        {
            title: 'Incidencias',
            description: 'Atiende reportes de sobreventas y diferencias de stock.',
            href: route('admin.products.incidences'),
            icon: AlertTriangle,
            color: 'text-rose-600',
            bgColor: 'bg-rose-50',
            borderColor: 'hover:border-rose-200'
        },
        {
            title: 'Vacantes',
            description: 'Publica y gestiona ofertas laborales en la bolsa de trabajo.',
            href: route('admin.vacancies.index'),
            icon: Users,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'hover:border-amber-200'
        },
        {
            title: 'Catálogos',
            description: 'Sube y organiza los catálogos PDF de la página principal.',
            href: route('admin.catalogs.index'),
            icon: BookOpen,
            color: 'text-sky-600',
            bgColor: 'bg-sky-50',
            borderColor: 'hover:border-sky-200'
        },
        {
            title: 'Recolecciones',
            description: 'Monitorea las recolecciones programadas con DHL.',
            href: route('admin.dhl-pickups.index'),
            icon: Truck,
            color: 'text-slate-600',
            bgColor: 'bg-slate-50',
            borderColor: 'hover:border-slate-200'
        },
        {
            title: 'Orden de Tipos',
            description: 'Configura la jerarquía de aparición de categorías.',
            href: route('admin.product-types.order'),
            icon: Layers,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'hover:border-indigo-200'
        }
    ];

    return (
        <AdminLayout title="Resumen">
            <Head title="Panel de Administrador" />

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black font-title text-gray-900 uppercase tracking-tight">Panel de Control</h1>
                    </div>
                    <p className="text-gray-400 font-medium text-sm sm:text-base">Bienvenido al centro de mando de Refacciones El Boom.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {adminModules.map((module, index) => (
                        <Link
                            key={index}
                            href={module.href}
                            className="group"
                        >
                            <div className={`h-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ${module.borderColor} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
                                {/* Background decoration */}
                                <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${module.bgColor} rounded-full opacity-30 group-hover:scale-150 transition-transform duration-500`} />

                                <div className="relative z-10">
                                    <div className={`w-14 h-14 ${module.bgColor} rounded-2xl flex items-center justify-center ${module.color} mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                                        <module.icon className="w-7 h-7" />
                                    </div>

                                    <h2 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tight">{module.title}</h2>
                                    <p className="text-xs font-medium text-gray-400 leading-relaxed mb-6 line-clamp-2">
                                        {module.description}
                                    </p>

                                    <div className="flex items-center text-[10px] font-black text-blue-600 uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
                                        Gestionar ahora
                                        <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
