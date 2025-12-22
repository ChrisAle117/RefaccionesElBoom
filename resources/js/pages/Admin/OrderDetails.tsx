import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { CollapsibleSection } from '@/components/collapsible-section';

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
    // Función para traducir el estado
    const translateStatus = (status: string): string => {
        switch (status) {
            case 'pending_payment': return 'Pendiente de pago';
            case 'payment_uploaded': return 'Comprobante subido';
            case 'payment_verified': return 'Pago verificado';
            case 'rejected': return 'Rechazado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
    };

    // Preparar totales
    const subtotalProductos = React.useMemo(() => {
        try {
            return (order.items || []).reduce((sum, it) => sum + (it.subtotal || (it.price * it.quantity)), 0);
        } catch {
            return 0;
        }
    }, [order.items]);
    const totalPagado = order.total || 0;
    const costoEnvio = Math.max(0, Number((totalPagado - subtotalProductos).toFixed(2)));

    const resolveImageUrl = (url?: string) => {
        if (!url || url.trim() === '') return '/images/logotipo.png';
        return url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <AdminLayout>
            <Head title={`Orden #${order.id} - Detalles`} />

            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Detalles de la orden #{order.id}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${order.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'payment_uploaded' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'payment_verified' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                        }`}>
                        {translateStatus(order.status)}
                    </span>
                </div>

                {/* Sección de información del cliente */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Información del cliente</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p><span className="font-medium">Nombre:</span> {order.user.name}</p>
                            <p><span className="font-medium">Email:</span> {order.user.email}</p>
                            <p><span className="font-medium">Teléfono:</span> {order.user.telefono}</p>
                        </div>
                        <div>
                            <p><span className="font-medium">Fecha de orden:</span> {order.created_at}</p>
                            <p><span className="font-medium">Subtotal productos:</span> {formatPrice(subtotalProductos)}</p>
                            <p><span className="font-medium">Envío:</span> {formatPrice(costoEnvio)}</p>
                            <p><span className="font-medium">Total pagado (con envío):</span> {formatPrice(totalPagado)}</p>
                        </div>
                    </div>
                </div>

                {/* Dirección de envío */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Dirección de Envío</h2>
                    {order.is_pickup && (
                        <div className="mb-3 inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Recoger sucursal Alpuyeca
                        </div>
                    )}
                    <p>{order.address.street} {order.address.exteriorNumber}{order.address.interiorNumber ? `, Int. ${order.address.interiorNumber}` : ''}</p>
                    <p>{order.address.colony}, {order.address.postalCode}</p>
                    <p>{order.address.city}, {order.address.state}</p>
                    <p>{order.address.reference}</p>
                </div>

                <CollapsibleSection title="Productos">
                    {/* Productos */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center items-center mb-3">
                                                    <div className="w-20 h-20 border border-gray-200 rounded flex items-center justify-center bg-white p-1">
                                                        <img
                                                            src={resolveImageUrl(item.product_image)}
                                                            alt={`Imagen de ${item.product_name}`}
                                                            className="w-full h-full object-contain"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                (e.currentTarget as HTMLImageElement).src = '/images/logotipo.png';
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 block">{item.product_name}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm text-gray-900">{formatPrice(item.price)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm text-gray-900">{item.quantity}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatPrice(item.subtotal)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} className="px-6 py-2 text-right">
                                            Subtotal productos:
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-center">
                                            {formatPrice(subtotalProductos)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-6 py-2 text-right">
                                            Envío:
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-center">
                                            {formatPrice(costoEnvio)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-6 py-3 text-right font-bold">
                                            Total pagado (con envío):
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-center font-bold">
                                            {formatPrice(totalPagado)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Comprobantes de pago */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Comprobantes de Pago</h2>
                    {order.payment_proofs.length === 0 ? (
                        <p className="text-gray-500 text-center">No hay comprobantes de pago registrados.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {order.payment_proofs.map((proof) => (
                                        <tr key={proof.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm text-gray-900">{proof.created_at}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <a
                                                    href={`/storage/${proof.file_path}`}
                                                    target="_blank"
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    {proof.file_name}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div>
                                                    {proof.notes || <span className="text-gray-400">-</span>}
                                                </div>
                                                {proof.status === 'rejected' && proof.admin_notes && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        <span className="font-semibold">Motivo del rechazo:</span> {proof.admin_notes}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${proof.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    proof.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {proof.status === 'pending' ? 'Pendiente' :
                                                        proof.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => window.history.back()}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
                    >
                        Volver a la lista de comprobantes
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default OrderDetails;