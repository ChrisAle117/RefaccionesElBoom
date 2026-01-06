import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import {
    User, MapPin, CreditCard,
    ArrowLeft, Package, Truck, Phone, Mail,
    FileText, CheckCircle2, AlertCircle, Clock, ExternalLink, X, Info
} from 'lucide-react';

interface OrderItem {
    id: number;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface PaymentProof {
    id: number;
    file_path: string;
    file_name: string;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
}

interface OrderAddress {
    street: string;
    exteriorNumber: string;
    interiorNumber?: string;
    colony: string;
    postalCode: string;
    city: string;
    state: string;
    reference: string;
}

interface OrderDetailsProps {
    order: {
        id: number;
        user: {
            name: string;
            email: string;
            telefono: string;
        };
        status: string;
        created_at: string;
        total: number;
        address: OrderAddress;
        items: OrderItem[];
        payment_proofs: PaymentProof[];
        is_pickup?: boolean;
    };
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
    const translateStatus = (status: string): { label: string; icon: React.ElementType; color: string } => {
        switch (status) {
            case 'pending_payment': return { label: 'Pendiente Pago', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' };
            case 'payment_uploaded': return { label: 'Comprobante Subido', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-100' };
            case 'payment_verified': return { label: 'Pago Verificado', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
            case 'rejected': return { label: 'Rechazado', icon: AlertCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' };
            case 'cancelled': return { label: 'Cancelado', icon: X, color: 'text-gray-600 bg-gray-50 border-gray-100' };
            default: return { label: status, icon: Info, color: 'text-gray-600 bg-gray-50' };
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
    };

    const subtotalProductos = React.useMemo(() => {
        return (order.items || []).reduce((sum, it) => sum + (it.subtotal || (it.price * it.quantity)), 0);
    }, [order.items]);

    const totalPagado = order.total || 0;
    const costoEnvio = Math.max(0, Number((totalPagado - subtotalProductos).toFixed(2)));

    const resolveImageUrl = (url?: string) => {
        if (!url || url.trim() === '') return '/images/logotipo.png';
        return url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const statusInfo = translateStatus(order.status);

    return (
        <AdminLayout title={`Orden #${order.id}`}>
            <Head title={`Orden #${order.id} - Detalles`} />

            <div className="container mx-auto p-2 sm:p-4 max-w-6xl">
                {/* Header Responsivo */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.orders.index')}
                            className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl sm:text-3xl font-black font-title text-gray-900 tracking-tight">Orden #{order.id}</h1>
                                <span className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-black rounded-full uppercase border shadow-sm ${statusInfo.color}`}>
                                    <statusInfo.icon className="w-3 h-3" />
                                    {statusInfo.label}
                                </span>
                            </div>
                            <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Emitida el {order.created_at}</p>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto flex gap-2">
                        <button className="flex-1 sm:flex-none h-11 px-6 bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center justify-center gap-2">
                            <FileText className="w-4 h-4" /> Exportar PDF
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna Izquierda: Información del Cliente y Pago */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Tarjeta Cliente */}
                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <User className="w-5 h-5" />
                                </div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Información del Cliente</h3>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div>
                                    <p className="text-sm font-black text-gray-900 uppercase">{order.user.name}</p>
                                    <div className="flex items-center gap-2 text-gray-400 mt-2">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-xs font-medium">{order.user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 mt-2">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-xs font-medium">{order.user.telefono}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50/50 rounded-full group-hover:scale-125 transition-transform" />
                        </section>

                        {/* Tarjeta Envío */}
                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Punto de Entrega</h3>
                            </div>

                            <div className="space-y-3">
                                {order.is_pickup ? (
                                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 mb-4">
                                        <Truck className="w-5 h-5 text-emerald-600" />
                                        <span className="text-[10px] font-black text-emerald-700 uppercase leading-tight">Recoger en Sucursal Alpuyeca</span>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-gray-800 leading-tight uppercase">
                                            {order.address.street} {order.address.exteriorNumber}{order.address.interiorNumber ? `, Int. ${order.address.interiorNumber}` : ''}
                                        </p>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {order.address.colony}, CP {order.address.postalCode}
                                        </p>
                                        <p className="text-xs text-gray-500 font-bold uppercase">
                                            {order.address.city}, {order.address.state}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">REFERENCIAS:</p>
                                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">{order.address.reference || 'Sin referencias'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Resumen Financiero */}
                        <section className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200 text-white overflow-hidden relative">
                            <div className="flex items-center gap-3 mb-8">
                                <CreditCard className="w-5 h-5 text-blue-400" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance de Orden</h3>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                                    <span>Subtotal Productos</span>
                                    <span className="text-white">{formatPrice(subtotalProductos)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                                    <span>Logística de Envío</span>
                                    <span className="text-white">{formatPrice(costoEnvio)}</span>
                                </div>
                                <div className="h-px bg-slate-800 my-4"></div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">TOTAL FINAL</span>
                                    <span className="text-2xl font-black text-white">{formatPrice(totalPagado)}</span>
                                </div>
                            </div>
                            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
                        </section>
                    </div>

                    {/* Columna Derecha: Partidas y Comprobantes */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Partidas de la Orden */}
                        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 sm:px-8 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
                                <Package className="w-5 h-5 text-gray-400" />
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partidas del Pedido ({order.items.length})</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <tbody className="divide-y divide-gray-50">
                                        {order.items.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-all">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl p-1 flex-shrink-0 shadow-sm">
                                                            <img
                                                                src={resolveImageUrl(item.product_image)}
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => e.currentTarget.src = '/images/logotipo.png'}
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-black text-gray-900 uppercase truncate leading-tight mb-1">{item.product_name}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">CANTIDAD: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <p className="text-xs text-gray-400 font-bold mb-0.5">{formatPrice(item.price)} C/U</p>
                                                    <p className="text-sm font-black text-gray-900">{formatPrice(item.subtotal)}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Bloque de Comprobantes */}
                        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 sm:px-8 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Historial de Pagos</h3>
                            </div>

                            {order.payment_proofs.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Clock className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                                    <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Esperando primer pago...</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {order.payment_proofs.map((proof) => (
                                        <div key={proof.id} className="p-6 hover:bg-gray-50 transition-all">
                                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <a
                                                            href={`/storage/${proof.file_path}`}
                                                            target="_blank"
                                                            className="text-sm font-black text-blue-600 uppercase hover:underline flex items-center gap-1.5"
                                                        >
                                                            {proof.file_name} <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Subido el {proof.created_at}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase border ${proof.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        proof.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                        {proof.status === 'approved' ? 'APROBADO' : proof.status === 'rejected' ? 'RECHAZADO' : 'PENDIENTE'}
                                                    </span>
                                                </div>
                                            </div>

                                            {(proof.notes || (proof.status === 'rejected' && proof.admin_notes)) && (
                                                <div className="mt-4 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                                    {proof.notes && (
                                                        <div className="mb-2">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">NOTA DEL CLIENTE:</p>
                                                            <p className="text-xs text-gray-600 font-medium">{proof.notes}</p>
                                                        </div>
                                                    )}
                                                    {proof.status === 'rejected' && proof.admin_notes && (
                                                        <div className="pt-2 border-t border-gray-100">
                                                            <p className="text-[9px] font-black text-rose-400 uppercase mb-1">MOTIVO DEL RECHAZO:</p>
                                                            <p className="text-xs text-rose-600 font-black">{proof.admin_notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>

                {/* Footer contextual */}
                <div className="mt-12 text-center pb-8 border-t border-gray-100 pt-8">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Fin de los detalles de la orden</p>
                    <Link
                        href={route('admin.orders.index')}
                        className="inline-flex h-11 px-6 bg-gray-50 text-gray-400 hover:text-gray-900 border border-gray-100 rounded-xl font-black text-xs uppercase tracking-widest transition-all items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al Listado
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
};

export default OrderDetails;