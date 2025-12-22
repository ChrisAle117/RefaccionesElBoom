import React, { useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useCountdown } from '@/hooks/use-countdown';
import { CollapsibleSection } from '@/components/collapsible-section';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface OrderItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    description: string;
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

interface PaymentProof {
    id_payment_proof: number;
    file_path: string;
    file_name: string;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
}

interface OrderProps {
    order: {
        id: number;
        status: string;
        total: number;
        created_at: string;
        expires_at: string;
        time_left: number;
        address: OrderAddress;
        items: OrderItem[];
        payment_proofs?: PaymentProof[];
    };
}

const OrderSummary: React.FC<OrderProps> = ({ order }) => {
    const { hours, minutes, seconds } = useCountdown(order.time_left);
    const { data, setData, post, processing, errors } = useForm({
        payment_proof: null as File | null,
        notes: '',
    });

    // Estados para el diálogo de cancelación
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelProcessing, setCancelProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('payment_proof', e.target.files[0]);
        }
    };

    
    const openFileSelector = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(`/orders/${order.id}/payment-proof`, {
            forceFormData: true,
        });
    };

    // Funciones para manejar la cancelación de la orden
    const handleCancelOrder = () => {
        setShowCancelDialog(true);
    };

    const confirmCancelOrder = () => {
        setCancelProcessing(true);

        router.post(`/orders/${order.id}/cancel`, {}, {
            onSuccess: () => {
                setShowCancelDialog(false);
                setCancelProcessing(false);
                
            },
            onError: () => {
                setCancelProcessing(false);
                
            }
        });
    };

    const isExpired = hours <= 0 && minutes <= 0 && seconds <= 0;
    const isPending = order.status === 'pending_payment';

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
    };

    // Totales calculados
    const subtotalProductos = React.useMemo(() => {
        try {
            return (order.items || []).reduce((sum, it) => sum + (it.price * it.quantity), 0);
        } catch (e) {
            return 0;
        }
    }, [order.items]);

    const totalPagado = order.total || 0;
    const costoEnvio = Math.max(0, Number((totalPagado - subtotalProductos).toFixed(2)));

    return (
        <div className="container mx-auto p-4">
            <Head title="Resumen de Orden" />

            
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar cancelación</DialogTitle>
                        <DialogDescription>
                            ¿Está seguro de que desea cancelar esta orden? Los productos volverán al inventario disponible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => setShowCancelDialog(false)}
                            disabled={cancelProcessing}
                            className="bg-gray-300 text-black hover:bg-gray-400 cursor-pointer"
                        >
                            No, mantener orden
                        </Button>
                        <Button
                            onClick={confirmCancelOrder}
                            disabled={cancelProcessing}
                            className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                        >
                            {cancelProcessing ? 'Cancelando...' : 'Sí, cancelar orden'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Resumen de orden #{order.id}</h1>
                <img
                    src="/images/logotipo.png"
                    alt="Logo"
                    className="h-12 cursor-pointer"
                    onClick={() => window.location.href = '/dashboard'}
                />
            </div>

            
            <div className={`p-4 mb-6 rounded-md border ${getStatusColor(order.status)}`}>
                <p className="font-bold">{getStatusMessage(order.status)}</p>
            </div>

            
            {isPending && !isExpired && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
                    <p className="font-bold">Tiempo restante para subir su comprobante:</p>
                    <div className="text-2xl font-bold text-center">
                        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(Math.floor(seconds)).padStart(2, '0')}
                    </div>
                </div>
            )}

            
            {isPending && isExpired && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                    <p className="font-bold">El tiempo para cargar su comprobante ha expirado.</p>
                    <p>Su pedido ha sido cancelado y los productos han regresado a su stock.</p>
                </div>
            )}

            
            {order.status === 'rejected' && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                    <p className="font-bold">Hemos encontrado incongruencias en su comprobante, o su comprobante no se puede abrir.</p>
                    <p>Por tal motivo los artículos han sido regresados a stock.</p>

                    {order.payment_proofs && order.payment_proofs.length > 0 ? (
                        <div className="mt-2">
                            <p className="font-semibold">Motivos de rechazo:</p>
                            <ul className="list-disc pl-5 mt-1">
                                {order.payment_proofs
                                    .filter(proof => proof.status === 'rejected' && proof.admin_notes)
                                    .map((proof, index) => (
                                        <li key={index} className="mt-1">
                                            <span className="text-sm">
                                                {proof.admin_notes}
                                            </span>
                                            <br />
                                            <span>
                                                <span className="font-medium">Nombre del comprobante: {proof.file_name}</span>
                                            </span>
                                        </li>
                                    ))
                                }
                            </ul>
                            {!order.payment_proofs.some(proof => proof.status === 'rejected' && proof.admin_notes) && (
                                <p className="text-sm mt-1">No se especificó un motivo de rechazo.</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm mt-1">No se especificó un motivo de rechazo.</p>
                    )}
                </div>
            )}

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border p-4 rounded shadow">
                    <h2 className="text-xl font-bold mb-2">Detalles del pedido</h2>
                    <p><span className="font-bold">Fecha de creación:</span> {new Date(order.created_at).toLocaleString()}</p>
                    <p><span className="font-bold">Subtotal productos:</span> {formatPrice(subtotalProductos)}</p>
                    <p><span className="font-bold">Envío:</span> {formatPrice(costoEnvio)}</p>
                    <p><span className="font-bold">Total pagado (con envío):</span> {formatPrice(totalPagado)}</p>
                    <p><span className="font-bold">Estado:</span> {translateStatus(order.status)}</p>
                </div>

                <div className="border p-4 rounded shadow">
                    <h2 className="text-xl font-bold mb-2">Dirección de envío</h2>
                    <p>{order.address.street} {order.address.exteriorNumber}{order.address.interiorNumber ? `, Int. ${order.address.interiorNumber}` : ''}</p>
                    <p>{order.address.colony}, {order.address.postalCode}</p>
                    <p>{order.address.city}, {order.address.state}</p>
                    <p><strong>Referencia: </strong>{order.address.reference}</p>
                </div>
            </div>

            
            <CollapsibleSection title="Productos">
                <div className="border p-4 rounded shadow mb-6">
                    <h2 className="text-xl font-bold mb-4">Productos</h2>
                    <div className="divide-y">
                        {order.items.map(item => (
                            <div key={item.id} className="py-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                                <div className="sm:col-span-1">
                                    <img
                                        src={item.image && item.image.trim() !== '' ?
                                            (item.image.startsWith('http') ? item.image : `${window.location.origin}${item.image.startsWith('/') ? '' : '/'}${item.image}`)
                                            : "/images/logotipo.png"}
                                        alt={item.name || "Producto"}
                                        className="w-20 h-20 object-contain rounded bg-white border"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "/images/logotipo.png";
                                        }}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                                <div className="sm:col-span-1 text-right">
                                    <p>{formatPrice(item.price)} MXN por unidad</p>
                                    <p className="font-bold">Subtotal: {formatPrice(item.price * item.quantity)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <div className="flex flex-col items-end gap-1">
                            <p className="text-sm">Subtotal productos: <span className="font-semibold">{formatPrice(subtotalProductos)}</span></p>
                            <p className="text-sm">Envío: <span className="font-semibold">{formatPrice(costoEnvio)}</span></p>
                            <p className="font-bold text-lg">Total pagado (con envío): {formatPrice(totalPagado)}</p>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            
            {isPending && !isExpired && (
                <div className="border p-4 rounded shadow mb-6">
                    {/* <h2 className="text-xl font-bold mb-4">Subir Comprobante de Pago</h2> */}
                    <form onSubmit={handleSubmit}>
                        {/* <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Archivo de Comprobante</label>
                            <div
                                onClick={openFileSelector}
                                className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border border-dashed border-gray-400 cursor-pointer hover:bg-gray-100"
                            >
                                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                                <p className="text-sm text-gray-600">
                                    {data.payment_proof
                                        ? data.payment_proof.name
                                        : 'Haga clic para seleccionar un archivo o arrástrelo aquí'}
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                />
                            </div>
                            {errors.payment_proof && <p className="text-red-500 text-xs mt-1">{errors.payment_proof}</p>}
                            <p className="text-xs text-gray-500 mt-2">Formatos permitidos: PDF. Tamaño máximo: 5MB</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Notas (opcional)</label>
                            <textarea
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                                rows={3}
                                placeholder="Añada cualquier información adicional sobre su pago..."
                            ></textarea>
                            {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes}</p>}
                        </div> */}

                        <div className="flex justify-between mt-4">
                            <Button
                                type="button"
                                className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                                onClick={handleCancelOrder}
                            >
                                Cancelar compra
                            </Button>
                            {/* <Button
                                disabled={!data.payment_proof || processing}
                                type="submit"
                                className="bg-[#006CFA] text-white hover:bg-[#FBCC13] hover:text-black cursor-pointer"
                            >
                                {processing ? 'Enviando...' : 'Enviar Comprobante'}
                            </Button> */}
                        </div>
                    </form>
                </div>
            )}

            <div className="flex justify-center">
                <Button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-gray-300 text-black hover:bg-gray-400 cursor-pointer"
                >
                    Volver al Inicio
                </Button>
            </div>
        </div>
    );
};


function getStatusColor(status: string): string {
    switch (status) {
        case 'pending_payment': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
        case 'payment_uploaded': return 'bg-blue-100 text-blue-800 border-blue-400';
        case 'payment_verified': return 'bg-green-100 text-green-800 border-green-400';
        case 'processing': return 'bg-indigo-100 text-indigo-800 border-indigo-400';
        case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-400';
        case 'delivered': return 'bg-teal-100 text-teal-800 border-teal-400';
        case 'rejected': return 'bg-red-100 text-red-800 border-red-400';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-400';
        default: return 'bg-gray-100 text-gray-800 border-gray-400';
    }
}

function getStatusMessage(status: string): string {
    switch (status) {
        case 'pending_payment': return 'Pedido pendiente de pago. Por favor suba su comprobante para procesar su pedido, de lo contrario, al expirar el tiempo su pedido será cancelado y los artículos regresarán a su stock. Su recibo deberá de ser legible y contener la información de la transferencia.';
        case 'payment_uploaded': return 'Hemos recibido su comprobante. Estamos verificando su pago.';
        case 'payment_verified': return '¡Su pago ha sido verificado! Su pedido está siendo procesado.';
        case 'processing': return 'Estamos preparando su pedido.';
        case 'shipped': return 'Su pedido ha sido enviado.';
        case 'delivered': return 'Su pedido ha sido entregado.';
        case 'rejected': return 'Su comprobante de pago ha sido rechazado. Los productos han regresado a su stock.';
        case 'cancelled': return 'Su pedido ha sido cancelado.';
        default: return 'Estado desconocido';
    }
}

function translateStatus(status: string): string {
    switch (status) {
        case 'pending_payment': return 'Pendiente de pago';
        case 'payment_uploaded': return 'Comprobante subido';
        case 'payment_verified': return 'Pago verificado';
        case 'processing': return 'En procesamiento';
        case 'shipped': return 'Enviado';
        case 'delivered': return 'Entregado';
        case 'rejected': return 'Rechazado';
        case 'cancelled': return 'Pago cancelado';
        default: return status;
    }
}

export default OrderSummary;