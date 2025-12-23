import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

interface PaymentProofItem {
    id: number;
    order_id: number;
    customer_name: string;
    customer_email: string;
    file_path: string;
    file_name: string;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    total_amount: number;
}

interface PaymentProofsProps {
    pendingProofs: PaymentProofItem[];
}

const PaymentProofs: React.FC<PaymentProofsProps> = ({ pendingProofs }) => {
    const [rejectingProofId, setRejectingProofId] = useState<number | null>(null);
    const [approvingProofId, setApprovingProofId] = useState<number | null>(null);
    const [approving, setApproving] = useState(false);

    // Estado para las opciones de PDF (fijos por ahora)
    const generatePdfAfterApproval = true;
    const pdfAction: 'download' | 'email' = 'download';

    // Estado para guardar la URL del PDF generado
    const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
    // Estado para el mensaje de éxito
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const approvalForm = useForm({
        generatePdf: generatePdfAfterApproval,
        pdfAction: pdfAction
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        admin_notes: '',
    });

    const openApproveModal = (proofId: number) => {
        setApprovingProofId(proofId);
        // Limpiar cualquier PDF generado anteriormente
        setGeneratedPdfUrl(null);
        setSuccessMessage(null);
    };

    // Función para aprobación con opción de generar PDF
    const handleApprove = () => {
        if (!approvingProofId) return;

        setApproving(true);

        // Actualizar el formulario con los valores actuales
        approvalForm.setData('generatePdf', generatePdfAfterApproval);
        approvalForm.setData('pdfAction', pdfAction);

        // Usar el formulario específico para hacer el post
        approvalForm.post(route('admin.payment-proofs.approve', approvingProofId), {
            preserveScroll: true,
            onSuccess: (response) => {
                setApprovingProofId(null);
                setApproving(false);

                // Acceder a la URL del PDF
                const flashData = (response.props as { flash?: Record<string, unknown> }).flash || {};
                const pdfUrl = typeof flashData.pdfUrl === 'string' ? flashData.pdfUrl : null;

                if (generatePdfAfterApproval) {
                    if (pdfAction === 'download' && pdfUrl) {
                        // Guardar la URL para mostrar el botón de descarga
                        setGeneratedPdfUrl(pdfUrl);
                        setSuccessMessage('Comprobante aprobado y PDF generado correctamente');
                    } else if (pdfAction === 'email') {
                        setSuccessMessage('Comprobante aprobado y PDF enviado por correo correctamente');
                    }
                } else {
                    setSuccessMessage('Comprobante aprobado exitosamente');
                }
            },
            onError: () => {
                setApproving(false);
            }
        });
    };

    const openRejectModal = (proofId: number) => {
        setRejectingProofId(proofId);
        reset();
    };

    const handleReject = () => {
        if (!rejectingProofId) return;

        post(route('admin.payment-proofs.reject', rejectingProofId), {
            onSuccess: () => {
                setRejectingProofId(null);
                setSuccessMessage('Comprobante rechazado correctamente');
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Gestión de comprobantes" />

            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Gestión de comprobantes de pago</h1>

                {/* Mensaje de éxito con botón de descarga cuando corresponde */}
                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-md relative">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-3 md:mb-0">
                                <p className="font-bold text-lg">¡Operación exitosa!</p>
                                <p>{successMessage}</p>
                            </div>

                            {generatedPdfUrl && (
                                <a
                                    href={generatedPdfUrl}
                                    target="_blank"
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md flex items-center justify-center"
                                    rel="noopener noreferrer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                    Descargar PDF de surtido
                                </a>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setSuccessMessage(null);
                                setGeneratedPdfUrl(null);
                            }}
                            className="absolute top-2 right-2 text-green-700 hover:text-green-900"
                            aria-label="Cerrar"
                        >
                            &times;
                        </button>
                    </div>
                )}

                {pendingProofs.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <p className="text-lg text-gray-600">No hay comprobantes pendientes de revisión.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Orden #</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Cliente</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Monto</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Fecha</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Comprobante</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Estado</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Acciones</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                                            <span className="whitespace-normal">Detalles de la compra</span>
                                        </th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                                            <span className="whitespace-normal">Orden de surtido</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingProofs.map((proof) => (
                                        <tr key={proof.id}>
                                            <td className="px-3 py-3 whitespace-nowrap text-center">
                                                <span className="text-sm font-medium text-gray-900">#{proof.order_id}</span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <div className="text-sm font-medium text-gray-900">{proof.customer_name}</div>
                                                <div className="text-sm text-gray-500 break-words">{proof.customer_email}</div>
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-center">
                                                <span className="text-sm text-gray-900">${Number(proof.total_amount).toFixed(2)} MXN</span>
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-center">
                                                <span className="text-sm text-gray-900">{proof.created_at}</span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <a
                                                    href={`/storage/${proof.file_path}`}
                                                    target="_blank"
                                                    className="text-blue-600 hover:text-blue-800 break-all inline-block max-w-[200px]"
                                                >
                                                    {proof.file_name}
                                                </a>
                                                {proof.notes && (
                                                    <div className="text-xs text-gray-500 mt-1 break-words">
                                                        <span className="font-semibold">Notas:</span> {proof.notes}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${proof.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    proof.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {proof.status === 'pending' ? 'Pendiente' :
                                                        proof.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <button
                                                    onClick={() => openApproveModal(proof.id)}
                                                    className="text-green-600 hover:text-green-900 block mx-auto cursor-pointer mb-1"
                                                >
                                                    Aprobar
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(proof.id)}
                                                    className="text-red-600 hover:text-red-900 block cursor-pointer mx-auto"
                                                >
                                                    Rechazar
                                                </button>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <a
                                                    href={route('admin.orders.show', proof.order_id)}
                                                    className="text-blue-600 hover:text-blue-800 cursor-pointer whitespace-normal"
                                                >
                                                    Ver detalles
                                                </a>
                                            </td>

                                            {/* Nueva celda para la orden de surtido */}
                                            <td className="px-3 py-3 text-center">
                                                {proof.status === 'approved' ? (
                                                    <a
                                                        href={route('admin.orders.shipping-pdf', proof.order_id)}
                                                        target="_blank"
                                                        className="text-black font-bold py-2 px-4 rounded text-xs inline-flex items-center justify-center w-28"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Descargar PDF
                                                    </a>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded text-xs cursor-not-allowed inline-flex items-center justify-center w-28"
                                                        title="Apruebe el comprobante primero para generar el PDF"
                                                    >
                                                        No disponible
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modal de aprobación con opciones de PDF */}
                {approvingProofId && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4 text-green-700">Aprobar comprobante</h2>
                            <div className="mb-4">
                                <p className="text-gray-700">
                                ¿Estás seguro de que deseas aprobar este comprobante de pago? 
                                Esta acción sugiere que <span className='font-bold underline bg-[#FBCC13]'>El pago del cliente ha sido verificado y confirmado.</span> Esto continuará con el procesamiento del pedido.
                                </p>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <label className="flex items-center mb-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={generatePdfAfterApproval}
                                        onChange={(e) => setGeneratePdfAfterApproval(e.target.checked)}
                                        className="mr-2 h-4 w-4 text-blue-600"
                                    />
                                    <span className="text-gray-700">Generar orden de surtido en PDF</span>
                                </label>
                                {/* 
                                {generatePdfAfterApproval && (
                                    <div className="pl-6 mt-2">
                                        <select
                                            value={pdfAction}
                                            onChange={(e) => setPdfAction(e.target.value as 'download' | 'email')}
                                            className="w-full border rounded p-2 text-sm"
                                        >
                                            <option value="download">Generar PDF para descargar</option>
                                            <option value="email">Enviar por correo al departamento de almacén</option>
                                        </select>
                                    </div>
                                )} */}
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    onClick={() => setApprovingProofId(null)}
                                    className="bg-gray-300 text-black hover:bg-gray-400 cursor-pointer"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    disabled={approving}
                                    className="bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                                >
                                    {approving ? 'Procesando...' : 'Confirmar Aprobación'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de rechazo */}
                {rejectingProofId && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Rechazar comprobante</h2>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Motivo del rechazo</label>
                                <textarea
                                    value={data.admin_notes}
                                    onChange={e => setData('admin_notes', e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                    rows={4}
                                    placeholder="Explique el motivo del rechazo..."
                                ></textarea>
                                {errors.admin_notes && <p className="text-red-500 text-xs mt-1">{errors.admin_notes}</p>}
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    onClick={() => setRejectingProofId(null)}
                                    className="bg-gray-300 text-black hover:bg-gray-400 cursor-pointer"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleReject}
                                    disabled={processing || !data.admin_notes}
                                    className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                                >
                                    {processing ? 'Procesando...' : 'Confirmar Rechazo'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default PaymentProofs;