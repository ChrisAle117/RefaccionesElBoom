import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Search, Filter, Eye, Tag, FileText, CheckCircle2, XCircle, Clock, Package, ChevronRight, ChevronLeft } from 'lucide-react';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const translateStatus = (status: string): string => {
        switch (status) {
            case 'pending_payment': return 'Pendiente';
            case 'payment_uploaded': return 'Comprobante';
            case 'payment_verified': return 'Verificado';
            case 'processing': return 'Surtido';
            case 'shipped': return 'Enviado';
            case 'delivered': return 'Entregado';
            case 'cancelled': return 'Cancelado';
            case 'rejected': return 'Rechazado';
            default: return status;
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'pending_payment': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'payment_uploaded': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'payment_verified': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'processing': return 'bg-violet-50 text-violet-700 border-violet-200';
            case 'shipped': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'delivered': return 'bg-teal-50 text-teal-700 border-teal-200';
            case 'cancelled':
            case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
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
                    router.reload({ only: ['orders', 'pagination'] });
                },
                onFinish: () => setSubmitting(false)
            }
        );
    };

    return (
        <AdminLayout title="Gestión de Órdenes">
            <Head title="Gestión de Órdenes" />

            <div className="container mx-auto p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-xl sm:text-2xl font-black font-title">Gestión de Órdenes</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            Total: {pagination.total}
                        </span>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-slate-800 transition-all">
                    <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <label htmlFor="search" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Búsqueda Global</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Nombre, email o # de orden..."
                                    className="w-full h-11 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        <div className="w-full lg:w-64">
                            <label htmlFor="status" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Estado del Pedido</label>
                            <select
                                id="status"
                                className="w-full h-11 cursor-pointer rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm font-black uppercase tracking-tight"
                                value={statusFilter}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                            >
                                <option value="">Todos los Estados</option>
                                <option value="pending_payment">Pendiente de pago</option>
                                <option value="payment_uploaded">Comprobante subido</option>
                                <option value="payment_verified">Pago verificado</option>
                                <option value="rejected">Rechazado</option>
                                <option value="processing">En procesamiento (Surtidor)</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Orden cancelada</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                type="submit"
                                className="flex-1 lg:flex-none h-11 px-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-black shadow-md shadow-blue-100 transition-all text-sm flex items-center justify-center uppercase tracking-widest"
                            >
                                Filtrar
                            </button>
                            {(searchTerm || statusFilter) && (
                                <button
                                    type="button"
                                    onClick={() => { setSearchTerm(''); setStatusFilter(''); router.get(route('admin.orders')); }}
                                    className="h-11 w-11 flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all"
                                    title="Limpiar"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Lista */}
                {orders.length === 0 ? (
                    <div className="bg-white p-16 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-100">
                        <FileText className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 text-lg font-medium">No hay órdenes registradas con este criterio</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-[1200px] w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">ID</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Información Cliente</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-28">Total</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">Arts</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-36">Fecha</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-40">Estado</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">Etiqueta DHL</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">Surtido</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-36">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {orders.map((order) => (
                                        <tr key={order.id_order} className="hover:bg-blue-50/20 transition-all group">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-gray-900">#{order.id_order}</span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-gray-900 leading-tight uppercase tracking-tight">{order.customer_name}</div>
                                                <div className="text-[11px] text-gray-400 lowercase font-medium">{order.customer_email}</div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-black text-gray-900">${Number(order.total_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="text-xs font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100 text-gray-500">{order.items_count}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">{order.created_at}</span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                                    {translateStatus(order.status)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {order.has_dhl_label ? (
                                                    <a
                                                        href={route('admin.orders.label-pdf', order.id_order)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-lg border border-amber-200 hover:bg-amber-100 transition-all uppercase tracking-tighter"
                                                    >
                                                        <Tag className="w-3 h-3" /> ETIQUETA
                                                    </a>
                                                ) : order.is_pickup ? (
                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase tracking-tighter">SUCURSAL</span>
                                                ) : (
                                                    <span className="text-gray-300">–</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {order.has_shipping_order_pdf ? (
                                                    <a
                                                        href={route('admin.orders.shipping-pdf', order.id_order)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg border border-blue-200 hover:bg-blue-100 transition-all uppercase tracking-tighter"
                                                    >
                                                        <FileText className="w-3 h-3" /> PDF
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300">–</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => openStatusModal(order)}
                                                        className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-100"
                                                        title="Actualizar estado manualmente"
                                                    >
                                                        <Clock className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={route('orders.show', order.id_order)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-5">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center sm:text-left">
                                MOSTRANDO <span className="text-gray-900">{orders.length}</span> DE <span className="text-gray-900">{pagination.total}</span>
                                <span className="block sm:inline sm:ml-4 font-black">PÁGINA <span className="text-blue-600">{pagination.current_page}</span> / {pagination.last_page}</span>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {pagination.current_page > 1 && (
                                    <button
                                        onClick={() => router.get(route('admin.orders'), {
                                            page: pagination.current_page - 1,
                                            search: searchTerm,
                                            status: statusFilter
                                        }, { preserveState: true })}
                                        className="h-10 px-4 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm uppercase tracking-tighter"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                                    </button>
                                )}

                                <div className="hidden lg:flex items-center gap-2">
                                    {Array.from({ length: pagination.last_page }, (_, i) => {
                                        const pageNum = i + 1;
                                        if (pageNum > 5 && pageNum < pagination.last_page) return null;
                                        if (pageNum === 6 && pagination.last_page > 6) return <span key="dots" className="text-gray-300">...</span>;

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => router.get(route('admin.orders'), {
                                                    page: pageNum,
                                                    search: searchTerm,
                                                    status: statusFilter
                                                }, { preserveState: true })}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl border font-black text-xs transition-all shadow-sm ${pageNum === pagination.current_page
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-100'
                                                    : 'border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-100'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                {pagination.current_page < pagination.last_page && (
                                    <button
                                        onClick={() => router.get(route('admin.orders'), {
                                            page: pagination.current_page + 1,
                                            search: searchTerm,
                                            status: statusFilter
                                        }, { preserveState: true })}
                                        className="h-10 px-4 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm uppercase tracking-tighter"
                                    >
                                        Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Cambio de Estado */}
            {isModalOpen && orderToEdit && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/40 p-4 transition-all animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                                <Clock className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-none mb-1">Status Override</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orden #{orderToEdit.id_order}</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium">
                            Esta herramienta permite saltar procesos automáticos. Úsala exclusivamente para correcciones administrativas manuales.
                        </p>

                        <div className="mb-8">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1" htmlFor="statusSelect">Nuevo Estatus Administrativo</label>
                            <select
                                id="statusSelect"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full h-14 px-5 border-2 rounded-2xl border-gray-50 bg-gray-50/50 hover:bg-white hover:border-blue-100 focus:bg-white focus:border-blue-500 focus:outline-none transition-all font-black text-gray-700 shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="pending_payment">Pendiente de pago</option>
                                <option value="payment_uploaded">Comprobante subido</option>
                                <option value="payment_verified">Pago verificado</option>
                                <option value="rejected">Rechazado</option>
                                <option value="processing">En procesamiento (Surtidor)</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Orden cancelada</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={submitStatusChange}
                                className={`w-full py-4 rounded-2xl text-white flex items-center justify-center font-black shadow-xl shadow-indigo-100 transition-all text-xs uppercase tracking-[0.2em] cursor-pointer ${submitting ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
                                disabled={submitting}
                            >
                                {submitting ? 'ACTUALIZANDO...' : 'GUARDAR CAMBIOS'}
                            </button>
                            <button
                                type="button"
                                className="w-full py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-400 font-black transition-all text-xs uppercase tracking-widest cursor-pointer"
                                onClick={closeStatusModal}
                                disabled={submitting}
                            >DESCARGAR CAMBIO</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default OrdersAdmin;
