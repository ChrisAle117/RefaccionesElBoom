import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

interface Order {
    id_order: number;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    status: string;
    created_at: string;
    items_count: number;
    expires_at?: string;
    has_dhl_label?: boolean;
    has_shipping_order_pdf?: boolean;
    shipping_email_sent_at?: string | null;
    is_pickup?: boolean;
}

interface OrdersProps {
    orders: Order[];
    filters: {
        search: string;
        status: string;
    };
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

const OrdersAdmin: React.FC<OrdersProps> = ({ orders, filters, pagination }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    // Estado para cambio manual de estado
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

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
            case 'shipped': return 'bg-orange-200 text-orange-800 border-orange-600';
            case 'delivered': return 'bg-teal-100 text-teal-800 border-teal-400';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-400';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-400';
            default: return 'bg-gray-100 text-gray-800 border-gray-400';
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.orders'), {
            search: searchTerm,
            status: statusFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        router.get(route('admin.orders'), {
            search: searchTerm,
            status
        }, {
            preserveState: true,
            replace: true
        });
    };

    const openStatusModal = (order: Order) => {
        setOrderToEdit(order);
        setNewStatus(order.status);
        setIsModalOpen(true);
    };

    const closeStatusModal = () => {
        setIsModalOpen(false);
        setOrderToEdit(null);
        setNewStatus('');
    };

    const submitStatusChange = () => {
        if (!orderToEdit || !newStatus) return;
        setSubmitting(true);
        router.put(route('admin.orders.status.update', orderToEdit.id_order),
            { status: newStatus },
            {
                preserveState: true,
                onSuccess: () => {
                    closeStatusModal();
                    // Recargar solo la lista para reflejar el nuevo estado
                    router.reload({ only: ['orders', 'pagination'] });
                },
                onFinish: () => setSubmitting(false)
            }
        );
    };

    return (
        <AdminLayout>
            <Head title="Gestión de órdenes" />

                <div className="w-full max-w-screen-2xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Gestión de órdenes</h1>
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                            <input
                                type="text"
                                id="search"
                                placeholder=" Buscar por número de orden, cliente o email"
                                className="w-full h-10 cursor-pointer rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                id="status"
                                className="w-full h-10 cursor-pointer rounded-xl border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                value={statusFilter}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="pending_payment">Pendiente de pago</option>
                                <option value="payment_uploaded">Comprobante subido</option>
                                <option value="payment_verified">Pago verificado</option>
                                <option value="rejected">Rechazado</option>
                                <option value="processing">En procesamiento</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Pago cancelado</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="h-10 px-4 bg-[#006CFA] cursor-pointer text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Filtrar
                            </button>
                        </div>
                    </form>
                </div>

                {/* Lista de órdenes */}
                {orders.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <p className="text-gray-500 text-lg">No se encontraron órdenes con los filtros seleccionados.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <table className="w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Orden #</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Etiqueta DHL</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Orden de surtido</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Enviado</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order.id_order}>
                                            {/* Orden # */}
                                            <td className="px-3 py-3 text-center">
                                                <span className="text-sm font-medium text-gray-900">#{order.id_order}</span>
                                            </td>

                                            {/* Cliente */}
                                            <td className="px-3 py-3 text-center">
                                                <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                                                <div className="text-sm text-gray-500 break-words">{order.customer_email}</div>
                                            </td>

                                            {/* Total */}
                                            <td className="px-3 py-3 text-center">
                                                <span className="text-sm text-gray-900">${Number(order.total_amount).toFixed(2)} MXN</span>
                                            </td>

                                            {/* Productos */}
                                            <td className="px-3 py-3 text-center">
                                                <span className="text-sm text-gray-900">{order.items_count}</span>
                                            </td>

                                            {/* Fecha */}
                                            <td className="px-3 py-3 text-center">
                                                <span className="text-sm text-gray-900">{order.created_at}</span>
                                            </td>

                                            {/* Estado */}
                                            <td className="px-3 py-3 text-center">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md border ${getStatusColor(order.status)}`}>
                                                    {translateStatus(order.status)}
                                                </span>
                                            </td>

                                            {/* Acciones */}
                                            <td className="px-3 py-3 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openStatusModal(order)}
                                                        className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-md border border-indigo-300 hover:bg-indigo-200 cursor-pointer"
                                                        title="Cambiar estado manualmente (uso excepcional)"
                                                    >
                                                        Estado <span className="ml-1">▾</span>
                                                    </button>
                                                    <a
                                                        href={route('admin.orders.show', order.id_order)}
                                                        className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-md border border-gray-300 hover:bg-gray-200 cursor-pointer whitespace-normal"
                                                    >
                                                        Ver detalles
                                                    </a>
                                                </div>
                                            </td>

                                            {/* Etiqueta DHL */}
                                            <td className="px-3 py-3 text-center">
                                                {order.has_dhl_label ? (
                                                    <a
                                                        href={route('admin.orders.label-pdf', order.id_order)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded hover:bg-green-200"
                                                    >
                                                        Descargar etiqueta
                                                    </a>
                                                ) : order.is_pickup ? (
                                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded hover:bg-green-200">
                                                        Se recogerá en sucursal
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">–</span>
                                                )}
                                            </td>

                                            {/* Orden de surtido */}
                                            <td className="px-3 py-3 text-center">
                                                {order.has_shipping_order_pdf ? (
                                                    <a
                                                        href={route('admin.orders.shipping-pdf', order.id_order)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded hover:bg-blue-200"
                                                    >
                                                        Descargar surtido
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">–</span>
                                                )}
                                            </td>

                                            {/* Correo Enviado */}
                                            <td className="px-3 py-3 whitespace-nowrap text-center">
                                                {order.shipping_email_sent_at ? (
                                                    <span className="text-green-500 text-lg">✓</span>
                                                ) : (
                                                    <span className="text-red-500 text-lg">✗</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        {/* Paginación */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Mostrando {orders.length} de {pagination.total} resultados
                                </div>
                                <div className="flex space-x-1">
                                    {pagination.current_page > 1 && (
                                        <a
                                            href={route('admin.orders', {
                                                page: pagination.current_page - 1,
                                                search: searchTerm,
                                                status: statusFilter
                                            })}
                                            className="px-3 py-1 rounded border border-gray-300 text-sm"
                                        >
                                            Anterior
                                        </a>
                                    )}

                                    {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <a
                                                key={i}
                                                href={route('admin.orders', {
                                                    page: pageNum,
                                                    search: searchTerm,
                                                    status: statusFilter
                                                })}
                                                className={`px-3 py-1 rounded border ${pageNum === pagination.current_page
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'border-gray-300 text-gray-700'
                                                    }`}
                                            >
                                                {pageNum}
                                            </a>
                                        );
                                    })}

                                    {pagination.current_page < pagination.last_page && (
                                        <a
                                            href={route('admin.orders', {
                                                page: pagination.current_page + 1,
                                                search: searchTerm,
                                                status: statusFilter
                                            })}
                                            className="px-3 py-1 rounded border border-gray-300 text-sm"
                                        >
                                            Siguiente
                                            </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal: Cambio manual de estado */}
                {isModalOpen && orderToEdit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40" onClick={closeStatusModal} />
                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                            <h3 className="text-lg font-semibold mb-2">Cambiar estado de la orden #{orderToEdit.id_order}</h3>
                            <p className="text-xs text-gray-500 mb-4">Esta acción es manual y no afecta los procesos automáticos. Úsala solo para correcciones.</p>

                            <label htmlFor="statusSelect" className="block text-sm font-medium text-gray-700 mb-1">Nuevo estado</label>
                            <select
                                id="statusSelect"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            >
                                <option value="pending_payment">Pendiente de pago</option>
                                <option value="payment_uploaded">Comprobante subido</option>
                                <option value="payment_verified">Pago verificado</option>
                                <option value="processing">En procesamiento</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Pago cancelado</option>
                                <option value="rejected">Rechazado</option>
                            </select>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeStatusModal}
                                    className="px-4 h-10 rounded-md border border-gray-300 text-gray-700 cursor-pointer"
                                    disabled={submitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={submitStatusChange}
                                    className={`px-4 h-10 rounded-md text-white cursor-pointer ${submitting ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Actualizando…' : 'Actualizar estado'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default OrdersAdmin;
