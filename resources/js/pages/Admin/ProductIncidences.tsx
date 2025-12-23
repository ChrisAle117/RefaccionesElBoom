import React, { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';

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

    const refresh = (forceFresh = true) => {
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
    };

    useEffect(() => {
        if (!list.length && total > 0) {
            refresh(false);
        }
    }, []);

    return (
        <AdminLayout title="Incidencias de Stock">
            <Head title="Incidencias de Stock" />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Incidencias de stock (sobreventa)</h1>
                <div className="flex gap-2">
                    <button onClick={() => refresh(true)} disabled={loading} className={`px-4 py-2 rounded text-white text-sm font-semibold flex items-center cursor-pointer ${loading ? 'bg-blue-500/60' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {loading && <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" className="opacity-25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>}
                        Refrescar
                    </button>
                    <button
                        onClick={() => { setSyncModal(true); setSyncPassword(''); setSyncError(null); setSyncSuccess(null); }}
                        disabled={list.length === 0}
                        className={`px-4 py-2 rounded text-white text-sm font-semibold flex items-center cursor-pointer ${list.length === 0 ? 'bg-gray-400' : 'bg-amber-600 hover:bg-amber-700'}`}
                        title="Ajustar existencias locales solo de las incidencias"
                    >
                        Ajustar incidencias
                    </button>
                    <Link href={route('admin.products')} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold">Volver</Link>
                </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Se listan productos cuya existencia es mayor que la existencia de almacén.</p>
            <p className='bg-red-500 text-white p-2 w-80 rounded'>VERIFICARLAS INMEDIATANAMENTE</p><br />
            {error && <div className="mb-4 p-2 rounded bg-red-50 text-sm text-red-600 border border-red-200">{error}</div>}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <span className="text-sm text-gray-700">Total de incidencias: <strong>{total}</strong></span>
                </div>
                {list.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">No hay incidencias actualmente.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Producto</th>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Código</th>
                                    <th className="px-4 py-2 text-center font-semibold text-gray-600">Local</th>
                                    <th className="px-4 py-2 text-center font-semibold text-gray-600">Remoto</th>
                                    <th className="px-4 py-2 text-center font-semibold text-gray-600">Diferencia</th>
                                    <th className="px-4 py-2 text-center font-semibold text-gray-600">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {list.map(i => (
                                    <tr key={i.id_product} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap max-w-xs truncate">{i.name || '—'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{i.code || '—'}</td>
                                        <td className="px-4 py-2 text-center text-gray-800">{i.local_stock}</td>
                                        <td className="px-4 py-2 text-center text-gray-800">{i.remote_stock}</td>
                                        <td className="px-4 py-2 text-center font-semibold text-red-600">{i.difference}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${i.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{i.active ? 'Activo' : 'Inactivo'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {syncModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-200">
                        <h2 className="text-lg font-semibold mb-2">Ajustar solo incidencias</h2>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">Sincroniza la existencia local de los productos listados (local &gt; remoto) bajándola al valor remoto.</p>
                        {syncError && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{syncError}</div>}
                        {syncSuccess && <div className="mb-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2">{syncSuccess}</div>}
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sync-inc-password">Contraseña</label>
                        <input
                            id="sync-inc-password"
                            type="password"
                            className="w-full h-10 px-3 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                            placeholder="Ingresa tu contraseña"
                            value={syncPassword}
                            onChange={(e) => setSyncPassword(e.target.value)}
                            disabled={syncLoading}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 cursor-pointer"
                                onClick={() => { if (!syncLoading) setSyncModal(false); }}
                                disabled={syncLoading}
                            >Cancelar</button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!syncPassword) { setSyncError('Ingresa tu contraseña'); return; }
                                    setSyncError(null); setSyncSuccess(null); setSyncLoading(true);
                                    fetch(route('admin.products.sync-stock-incidences'), {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Accept': 'application/json',
                                            'X-Requested-With': 'XMLHttpRequest',
                                            'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                                        },
                                        credentials: 'include',
                                        body: JSON.stringify({ password: syncPassword, json: true })
                                    })
                                        .then(async r => {
                                            let data: unknown = null;
                                            try { data = await r.json(); } catch (err) { console.error('No se pudo parsear respuesta de incidencias', err); }
                                            const parsed = data as { success?: boolean; error?: string; message?: string } | null;
                                            if (!r.ok || !parsed?.success) { setSyncSuccess(null); setSyncError(parsed?.error || 'Error al sincronizar incidencias'); }
                                            else { setSyncError(null); setSyncSuccess(parsed.message || 'Incidencias sincronizadas'); refresh(true); }
                                        })
                                        .catch(() => { setSyncSuccess(null); setSyncError('Error de red'); })
                                        .finally(() => setSyncLoading(false));
                                }}
                                className={`px-4 py-2 rounded text-white flex items-center font-medium cursor-pointer shadow ${syncLoading ? 'bg-amber-600/60' : 'bg-amber-600 hover:bg-amber-700'}`}
                                disabled={syncLoading}
                            >
                                {syncLoading && <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                                Ajustar
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => { if (!syncLoading) setSyncModal(false); }}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                            aria-label="Cerrar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ProductIncidences;
