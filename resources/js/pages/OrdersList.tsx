import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft } from "lucide-react";

interface OrderItem {
    id_order: number;
    status: string;
    total_amount: number;
    created_at: string;
    expires_at: string | null;
}

interface OrdersListProps {
    orders: OrderItem[];
}


const calculateTimeRemaining = (expiresAt: string | null): string => {
    if (!expiresAt) return 'N/A';

    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expirado';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
};


const translateStatus = (status: string): string => {
    switch (status) {
        case 'pending_payment': return 'Pendiente de pago';
        case 'payment_uploaded': return 'Comprobante subido';
        case 'payment_verified': return 'Pago verificado';
        case 'processing': return 'En procesamiento';
        case 'shipped': return 'Enviado';
        case 'delivered': return 'Entregado';
        case 'cancelled': return 'Pago cancelado';
        case 'rejected': return 'Rechazado';
        default: return status;
    }
};


const getStatusColor = (status: string): string => {
    switch (status) {
        case 'pending_payment': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
        case 'payment_uploaded': return 'bg-blue-100 text-blue-800 border-blue-400';
        case 'payment_verified': return 'bg-green-100 text-green-800 border-green-400';
        case 'processing': return 'bg-indigo-100 text-indigo-800 border-indigo-400';
        case 'shipped': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
        case 'delivered': return 'bg-teal-100 text-teal-800 border-teal-400';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-400';
        case 'rejected': return 'bg-red-100 text-red-800 border-red-400';
        default: return 'bg-gray-100 text-gray-800 border-gray-400';
    }
};


const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Mis Pedidos',
        href: '/orders',
    },
];

const OrdersList: React.FC<OrdersListProps> = ({ orders }) => {
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Pedidos | Refaccionaria El Boom" />

            <div className="container mx-auto p-4 dark:bg-gray-900">
                {/* Botón de Regresar Integrado */}
                <div className="flex items-center mb-4">
                    <button
                        className="w-full sm:w-auto bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 p-2 sm:px-6 rounded-xl shadow-md border-2 border-gray-300 dark:border-gray-500 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 cursor-pointer group"
                        onClick={() => window.location.href = '/dashboard'}
                        type="button"
                    >
                        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-500 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-base sm:text-lg text-gray-800 dark:text-white uppercase">Regresar al catálogo</span>
                    </button>
                </div>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold dark:text-white">Mis pedidos</h1>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                        <p className="text-lg text-gray-600 dark:text-gray-300">No tienes pedidos realizados.</p>
                        <Link
                            href="/dashboard"
                            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                        >
                            Ir a comprar
                        </Link>
                    </div>
                ) : (
                    <>

                        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Orden #
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Tiempo Restante
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {orders.map((order) => (
                                        <tr key={order.id_order}>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    #{order.id_order}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                                    {formatPrice(order.total_amount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md border ${getStatusColor(order.status)}`}>
                                                    {translateStatus(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {order.status === 'pending_payment'
                                                        ? calculateTimeRemaining(order.expires_at)
                                                        : 'N/A'
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <Link
                                                    href={`/orders/${order.id_order}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    Ver detalles
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                        <div className="md:hidden space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id_order}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-900 dark:text-gray-100">
                                            Folio de orden No. {order.id_order}
                                        </span>
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md border ${getStatusColor(order.status)}`}>
                                            {translateStatus(order.status)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Fecha:</p>
                                            <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Total:</p>
                                            <p className="font-medium">{formatPrice(order.total_amount)}</p>
                                        </div>
                                        {order.status === 'pending_payment' && (
                                            <div className="col-span-2">
                                                <p className="text-gray-500 dark:text-gray-400">Tiempo restante:</p>
                                                <p className="font-medium">{calculateTimeRemaining(order.expires_at)}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-2 flex justify-center">
                                        <Link
                                            href={`/orders/${order.id_order}`}
                                            className="w-full text-center py-2 px-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                        >
                                            Ver detalles
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
};

export default OrdersList;