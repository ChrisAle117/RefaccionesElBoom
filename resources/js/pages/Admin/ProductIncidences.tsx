import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, RefreshCw, Layers, ChevronRight, XCircle, ShieldCheck, ArrowLeft, Package } from 'lucide-react';

interface Incidence {
    id_product: number;
    name: string | null;
    code: string | null;
    local_stock: number;
    remote_stock: number;
    difference: number;
    active: boolean;
}

interface PageProps {
    incidences: Incidence[];
    total: number;
}

const ProductIncidences: React.FC<PageProps> = ({ incidences, total }) => {
    const [list, setList] = useState<Incidence[]>(incidences || []);
    const [loading, setLoading] = useState(false);
    const [syncModal, setSyncModal] = useState(false);
    const [syncPassword, setSyncPassword] = useState('');
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback((forceFresh = true) => {
        setLoading(true); setError(null);
        const url = route('admin.products.incidences') + (forceFresh ? '?fresh=1' : '');
        fetch(url, { credentials: 'include', headers: { 'Accept': 'application/json' } })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => {
                if (data.success) {
                    setList(data.incidences || []);
                } else {
                    setError('Respuesta inválida');
                }
            })
            .catch(() => setError('No se pudo refrescar'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!list.length && total > 0) {
            refresh(false);
        }
    }, [list.length, total, refresh]);

    return (
        <AdminLayout title="Incidencias de Stock">
            <Head title="Incidencias de Stock" />

            <div className="container mx-auto p-2 sm:p-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black font-title">Incidencias de Stock</h1>
                            <p className="text-[10px] sm:text-xs font-black text-rose-500 uppercase tracking-widest mt-0.5">Detección de Sobreventas</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <button
                            onClick={() => refresh(true)}
                            disabled={loading}
                            className="flex-1 lg:flex-none h-11 px-6 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-black transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Refrescando...' : 'Actualizar'}
                        </button>

                        <button
                            onClick={() => { setSyncModal(true); setSyncPassword(''); setSyncError(null); setSyncSuccess(null); }}
                            disabled={list.length === 0}
                            className={`flex-1 lg:flex-none h-11 px-6 text-white rounded-lg font-black transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md ${list.length === 0 ? 'bg-gray-300' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-100'}`}
                        >
                            <Layers className="w-4 h-4" />
                            Ajustar Todo
                        </button>

                        <Link
                            href={route('admin.products')}
                            className="h-11 w-11 flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg border border-gray-100 hover:bg-gray-100 transition-all shadow-sm"
                            title="Volver a Productos"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl mb-6 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg text-rose-600 shadow-sm border border-rose-100 group">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs sm:text-sm text-rose-800 font-bold leading-relaxed mb-1 capitalize">
                            Se han detectado {total} productos con stock local inflado.
                        </p>
                        <p className="text-[10px] text-rose-600 font-black uppercase tracking-tight">
                            ⚠️ Verificar existencias físicas e Inventario remoto inmediatamente.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500 text-white p-4 rounded-xl shadow-lg shadow-red-100 mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-left duration-300">
                        <XCircle className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">{error}</span>
                    </div>
                )}

                {/* Tabla de Incidencias */}
                {list.length === 0 ? (
                    <div className="bg-white p-16 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-100">
                        <ShieldCheck className="w-16 h-16 mx-auto text-emerald-100 mb-4" />
                        <p className="text-gray-400 text-lg font-medium">¡Sin incidencias detectadas!</p>
                        <p className="text-gray-300 text-sm">El stock local está sincronizado con el almacén.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Listado de discrepancias</span>
                            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">{total} INCIDENCIAS</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-[900px] w-full divide-y divide-gray-100">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">PRODUCTO</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-40">CÓDIGO</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">STOCK LOCAL</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">REMOTO (REAL)</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">DIFERENCIA</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">ESTADO</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {list.map(i => (
                                        <tr key={i.id_product} className="hover:bg-rose-50/10 transition-all group">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-gray-900 leading-tight uppercase group-hover:text-rose-600 transition-colors line-clamp-2">{i.name || 'SIN NOMBRE'}</div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">{i.code || '—'}</span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="text-base font-black text-slate-400">{i.local_stock}</span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="text-base font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">{i.remote_stock}</span>
                                            </td>

                                            <td className="px-6 py-4 text-center font-semibold text-red-600">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-black text-rose-600">-{i.difference}</span>
                                                    <span className="text-[9px] font-black text-rose-300 uppercase tracking-tighter">EXCESO LOCAL</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-2 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-wider ${i.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    {i.active ? 'PUESTO' : 'INACTIVO'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <Link
                                                    href={route('admin.products', { search: i.code })}
                                                    className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Sincronización */}
            {syncModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/40 p-4 transition-all animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                                <Layers className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-none mb-1">Ajustar Incidencias</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronización Selectiva</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">
                            Esta acción bajará el stock local de los <span className="text-gray-900 font-black"> {total} productos </span>
                            listados para que coincidan con la existencia real del almacén.
                        </p>

                        {syncError && <div className="mb-4 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-4 uppercase tracking-widest">{syncError}</div>}
                        {syncSuccess && <div className="mb-4 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl p-4 uppercase tracking-widest">{syncSuccess}</div>}

                        <div className="mb-8">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">🔒 SEGURIDAD REQUERIDA</label>
                            <input
                                type="password"
                                className="w-full h-14 px-5 border-2 rounded-2xl border-gray-50 bg-gray-50/50 hover:bg-white hover:border-blue-100 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-sm font-black shadow-inner"
                                placeholder="Confirma tu clave de admin"
                                value={syncPassword}
                                onChange={(e) => setSyncPassword(e.target.value)}
                                disabled={syncLoading}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!syncPassword) { setSyncError('Debes ingresar tu contraseña'); return; }
                                    setSyncError(null); setSyncSuccess(null); setSyncLoading(true);
                                    fetch(route('admin.products.sync-stock-incidences'), {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Accept': 'application/json',
                                            'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                                        },
                                        credentials: 'include',
                                        body: JSON.stringify({ password: syncPassword, json: true })
                                    })
                                        .then(async r => {
                                            const parsed = await r.json() as { success?: boolean; error?: string; message?: string };
                                            if (!r.ok || !parsed?.success) { setSyncSuccess(null); setSyncError(parsed?.error || 'Error crítico de ajuste'); }
                                            else { setSyncError(null); setSyncSuccess(parsed.message || 'Stock ajustado con éxito'); refresh(true); setTimeout(() => setSyncModal(false), 2000); }
                                        })
                                        .catch(() => { setSyncSuccess(null); setSyncError('Error de red'); })
                                        .finally(() => setSyncLoading(false));
                                }}
                                className={`w-full py-4 rounded-2xl text-white flex items-center justify-center font-black shadow-xl shadow-orange-100 transition-all text-sm uppercase tracking-[0.2em] cursor-pointer ${syncLoading || !syncPassword ? 'bg-orange-300' : 'bg-orange-600 hover:bg-orange-700 active:scale-95'}`}
                                disabled={syncLoading || !syncPassword}
                            >
                                {syncLoading ? 'AJUSTANDO...' : 'PROCEDER AL AJUSTE'}
                            </button>
                            <button
                                type="button"
                                className="w-full py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-400 font-black transition-all text-xs uppercase tracking-widest cursor-pointer"
                                onClick={() => { if (!syncLoading) setSyncModal(false); }}
                                disabled={syncLoading}
                            >CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ProductIncidences;
