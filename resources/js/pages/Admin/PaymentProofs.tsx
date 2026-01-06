import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { ReceiptText, CheckCircle2, XCircle, FileText, Download, Check, Eye, AlertCircle } from 'lucide-react';

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

    const [generatePdfAfterApproval, setGeneratePdfAfterApproval] = useState(true);
    const pdfAction: 'download' | 'email' = 'download';

    const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const approvalForm = useForm({
        generatePdf: generatePdfAfterApproval,
        pdfAction: pdfAction
    });

    const rejectionForm = useForm({
        admin_notes: '',
    });

    const openApproveModal = (proofId: number) => {
        setApprovingProofId(proofId);
        setGeneratedPdfUrl(null);
        setSuccessMessage(null);
    };

    const handleApprove = () => {
        if (!approvingProofId) return;

        setApproving(true);
        approvalForm.setData('generatePdf', generatePdfAfterApproval);

        approvalForm.post(route('admin.payment-proofs.approve', approvingProofId), {
            preserveScroll: true,
            onSuccess: (response) => {
                setApprovingProofId(null);
                setApproving(false);

                const flashData = (response.props as { flash?: Record<string, unknown> }).flash || {};
                const pdfUrl = typeof flashData.pdfUrl === 'string' ? flashData.pdfUrl : null;

                if (generatePdfAfterApproval && pdfUrl) {
                    setGeneratedPdfUrl(pdfUrl);
                    setSuccessMessage('Comprobante aprobado y PDF generado');
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
        rejectionForm.reset();
    };

    const handleReject = () => {
        if (!rejectingProofId) return;

        rejectionForm.post(route('admin.payment-proofs.reject', rejectingProofId), {
            onSuccess: () => {
                setRejectingProofId(null);
                setSuccessMessage('Comprobante rechazado correctamente');
            },
        });
    };

    return (
        <AdminLayout title="Comprobantes">
            <Head title="Gestión de Comprobantes" />

            <div className="container mx-auto p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                            <ReceiptText className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black font-title">Comprobantes Pendientes</h1>
                    </div>
                </div>

                {/* Mensaje de Éxito / PDF */}
                {successMessage && (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 sm:p-6 rounded-2xl shadow-sm mb-6 animate-in slide-in-from-top duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-emerald-900 font-black uppercase tracking-tight text-sm">¡Operación Confirmada!</p>
                                    <p className="text-emerald-600 text-xs font-medium">{successMessage}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {generatedPdfUrl && (
                                    <a
                                        href={generatedPdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 sm:flex-none h-11 px-6 bg-slate-800 text-white rounded-xl hover:bg-slate-900 font-black transition-all text-xs flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-slate-100"
                                    >
                                        <Download className="w-4 h-4" /> Descargar Surtido
                                    </a>
                                )}
                                <button
                                    onClick={() => { setSuccessMessage(null); setGeneratedPdfUrl(null); }}
                                    className="h-11 w-11 flex items-center justify-center text-emerald-400 hover:bg-emerald-100/50 rounded-xl transition-all"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista */}
                {pendingProofs.length === 0 ? (
                    <div className="bg-white p-16 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-100">
                        <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-100 mb-4" />
                        <p className="text-gray-400 text-lg font-medium">No hay comprobantes pendientes de revisión</p>
                        <p className="text-gray-300 text-sm">¡Todo está al día!</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-[1100px] w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">Orden #</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Información Cliente</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-28">Monto</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">Fecha Subida</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Archivo / Notas</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-36">Operaciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {pendingProofs.map((proof) => (
                                        <tr key={proof.id} className="hover:bg-blue-50/20 transition-all group">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">#{proof.order_id}</span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-gray-900 leading-tight uppercase tracking-tight">{proof.customer_name}</div>
                                                <div className="text-[11px] text-gray-400 font-medium">{proof.customer_email}</div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-black text-gray-900">${Number(proof.total_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">{proof.created_at}</span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <a
                                                        href={`/storage/${proof.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-[11px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-tighter"
                                                    >
                                                        <FileText className="w-3 h-3" /> {proof.file_name}
                                                    </a>
                                                    {proof.notes && (
                                                        <div className="text-[10px] text-gray-400 bg-gray-50 p-1.5 rounded border border-gray-100 italic">
                                                            "{proof.notes}"
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => openApproveModal(proof.id)}
                                                        className="h-9 px-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all border border-emerald-100 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5"
                                                        title="Aprobar Pago"
                                                    >
                                                        <Check className="w-3 h-3" /> OK
                                                    </button>
                                                    <button
                                                        onClick={() => openRejectModal(proof.id)}
                                                        className="h-9 px-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all border border-rose-100 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5"
                                                        title="Rechazar Pago"
                                                    >
                                                        <XCircle className="w-3 h-3" /> NO
                                                    </button>
                                                    <Link
                                                        href={route('orders.show', proof.order_id)}
                                                        className="h-9 w-9 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-lg border border-gray-100 transition-all"
                                                        title="Detalles"
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
                    </div>
                )}
            </div>

            {/* Modal Aprobación */}
            {approvingProofId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/40 p-4 transition-all animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-none mb-1">Confirmar Pago</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Surtido Automático</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-8">
                            <div className="flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                    Al aprobar, confirmas que el dinero está en la cuenta. Esto liberará el proceso de surtido de almacén.
                                </p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="flex items-center group cursor-pointer p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-blue-100 transition-all">
                                <input
                                    type="checkbox"
                                    checked={generatePdfAfterApproval}
                                    onChange={(e) => setGeneratePdfAfterApproval(e.target.checked)}
                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 transition-all"
                                />
                                <div className="ml-4">
                                    <span className="block text-sm font-black text-gray-900 uppercase tracking-tight">Generar PDF de Surtido</span>
                                    <span className="block text-[10px] text-gray-400 font-bold">Descarga inmediata tras aprobación</span>
                                </div>
                            </label>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={handleApprove}
                                className={`w-full py-4 rounded-2xl text-white flex items-center justify-center font-black shadow-xl shadow-emerald-100 transition-all text-sm uppercase tracking-[0.2em] cursor-pointer ${approving ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'}`}
                                disabled={approving}
                            >
                                {approving ? 'PROCESANDO...' : 'CONFIRMAR APROBACIÓN'}
                            </button>
                            <button
                                type="button"
                                className="w-full py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-400 font-black transition-all text-xs uppercase tracking-widest cursor-pointer"
                                onClick={() => setApprovingProofId(null)}
                                disabled={approving}
                            >CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Rechazo */}
            {rejectingProofId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/40 p-4 transition-all animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-inner">
                                <XCircle className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-none mb-1">Rechazar Pago</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aviso al Cliente</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1" htmlFor="notes">⚠️ Motivo del Rechazo</label>
                            <textarea
                                id="notes"
                                value={rejectionForm.data.admin_notes}
                                onChange={e => rejectionForm.setData('admin_notes', e.target.value)}
                                className="w-full p-5 border-2 rounded-2xl border-gray-50 bg-gray-50/50 hover:bg-white hover:border-blue-100 focus:bg-white focus:border-rose-500 focus:outline-none transition-all text-sm font-medium shadow-inner placeholder:text-gray-300"
                                rows={4}
                                placeholder="Escribe aquí por qué se rechaza (ej. Archivo ilegible, monto incorrecto...)"
                            ></textarea>
                            {rejectionForm.errors.admin_notes && <p className="text-rose-500 text-[10px] font-black mt-2 uppercase">{rejectionForm.errors.admin_notes}</p>}
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={handleReject}
                                className={`w-full py-4 rounded-2xl text-white flex items-center justify-center font-black shadow-xl shadow-rose-100 transition-all text-sm uppercase tracking-[0.2em] cursor-pointer ${rejectionForm.processing || !rejectionForm.data.admin_notes ? 'bg-rose-300' : 'bg-rose-600 hover:bg-rose-700 active:scale-95'}`}
                                disabled={rejectionForm.processing || !rejectionForm.data.admin_notes}
                            >
                                {rejectionForm.processing ? 'PROCESANDO...' : 'CONFIRMAR RECHAZO'}
                            </button>
                            <button
                                type="button"
                                className="w-full py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-400 font-black transition-all text-xs uppercase tracking-widest cursor-pointer"
                                onClick={() => setRejectingProofId(null)}
                                disabled={rejectionForm.processing}
                            >ABORTAR</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default PaymentProofs;