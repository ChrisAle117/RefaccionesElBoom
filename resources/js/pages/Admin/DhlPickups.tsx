import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

interface Pickup {
    id: number;
    order_id: number;
    dispatch_confirmation_number?: string;
    planned_pickup_at?: string;
    pickup_date?: string;
    pickup_date_display?: string;
    planned_pickup_tz?: string;
    close_time?: string;
    location?: string;
    location_type?: string;
    origin_postal_code?: string;
    origin_city_name?: string;
    origin_province_code?: string;
    origin_country_code?: string;
    origin_address_line1?: string;
    created_at: string;
    label_available?: boolean;
    dispatch_group_count?: number;
}

interface Props {
    pickups: Pickup[];
    filters: { search?: string; date?: string };
    pagination: { total: number; per_page: number; current_page: number; last_page: number };
}

const DhlPickups: React.FC<Props> = ({ pickups, filters, pagination }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.dhl-pickups.index'), { search, date }, { preserveState: true, replace: true });
    };

    const formatCdmx = (iso?: string) => {
        if (!iso) return '—';
        try {
            const d = new Date(iso);
            return new Intl.DateTimeFormat('es-MX', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false, timeZone: 'America/Mexico_City'
            }).format(d);
        } catch { return '—'; }
    };

    const formatTimeCdmx = (iso?: string) => {
        if (!iso) return '—';
        try {
            const d = new Date(iso);
            return new Intl.DateTimeFormat('es-MX', {
                hour: '2-digit', minute: '2-digit',
                hour12: false, timeZone: 'America/Mexico_City'
            }).format(d);
        } catch { return '—'; }
    };

    const buildCloseDateISO = (startIso?: string, closeTime?: string) => {
        if (!startIso || !closeTime) return undefined;
        try {
            const start = new Date(startIso);
            const [hh, mm] = closeTime.split(':');
            const dt = new Date(start);
            dt.setHours(parseInt(hh || '0'), parseInt(mm || '0'), 0, 0);
            return dt.toISOString();
        } catch {
            return undefined;
        }
    };

    return (
        <AdminLayout>
            <Head title="Recolecciones DHL" />
            <div className="w-full max-w-screen-2xl mx-auto p-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Recolecciones DHL</h1>
                    <a href={route('admin.orders')} className="text-sm text-blue-600 hover:underline">Ir a órdenes</a>
                </div>

                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <form onSubmit={submitFilters} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="No. despacho, orden, CP, ciudad"
                                className="w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                        </div>
                        <div className="w-full md:w-64">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha planificada</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                className="w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="h-10 px-4 bg-[#006CFA] text-white rounded-md cursor-pointer">Filtrar</button>
                        </div>
                    </form>
                    <div className="mt-3 text-sm bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-3">
                        El horario es aproximado. DHL puede recoger en cualquier momento dentro de la ventana previa a la hora objetivo.
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Orden</th>
                                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Despacho</th>
                                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hora estimada de recolección</th>
                                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Día de recolección</th>
                                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Origen</th>
                                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ver etiqueta</th>
                                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Creado</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pickups.length === 0 ? (
                                <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">No hay recolecciones registradas</td></tr>
                            ) : pickups.map(p => (
                                <tr key={p.id}>
                                    <td className="px-3 py-3 text-center text-sm">{p.id}</td>
                                    <td className="px-3 py-3 text-center text-sm">#{p.order_id}</td>
                                    <td className="px-3 py-3 text-center text-sm">{p.dispatch_confirmation_number || '—'}</td>
                                    <td className="px-3 py-3 text-center text-sm">
                                        {p.planned_pickup_at && p.close_time ? (
                                            <div className="text-gray-900 font-semibold text-lg">{p.close_time}</div>
                                        ) : '—'}
                                    </td>
                                    <td className="px-3 py-3 text-center text-sm">{p.pickup_date_display || '—'}</td>
                                    <td className="px-3 py-3 text-center text-sm">
                                        <div className="text-gray-900 font-medium">El Boom Tractopartes Tizoc</div>
                                    </td>
                                    <td className="px-3 py-3 text-center text-sm">
                                        {p.label_available ? (
                                            <a
                                                href={route('admin.orders.label-pdf', p.order_id)}
                                                target="_blank" rel="noopener noreferrer"
                                                className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded hover:bg-green-200"
                                            >
                                                Ver etiqueta
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-3 text-center text-sm">{new Date(p.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">Mostrando {pickups.length} de {pagination.total} resultados</div>
                            <div className="flex space-x-1">
                                {pagination.current_page > 1 && (
                                    <a href={route('admin.dhl-pickups.index', { page: pagination.current_page - 1, search, date })} className="px-3 py-1 rounded border border-gray-300 text-sm">Anterior</a>
                                )}
                                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <a key={i} href={route('admin.dhl-pickups.index', { page: pageNum, search, date })}
                                            className={`px-3 py-1 rounded border ${pageNum === pagination.current_page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700'}`}>
                                            {pageNum}
                                        </a>
                                    );
                                })}
                                {pagination.current_page < pagination.last_page && (
                                    <a href={route('admin.dhl-pickups.index', { page: pagination.current_page + 1, search, date })} className="px-3 py-1 rounded border border-gray-300 text-sm">Siguiente</a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DhlPickups;
