import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Truck, Search, Calendar, Tag, ChevronLeft, ChevronRight, XCircle, ExternalLink, Clock } from 'lucide-react';

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

    return (
        <AdminLayout title="Recolecciones DHL">
            <Head title="Recolecciones DHL" />

            <div className="container mx-auto p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-red-700 shadow-lg shadow-amber-100">
                            <Truck className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black font-title">Recolecciones DHL</h1>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-slate-800 transition-all">
                    <form onSubmit={submitFilters} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 relative">
                            <label htmlFor="search" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Búsqueda rápida</label>
                            <div className="relative">
                                <input
                                    id="search"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="No. despacho, orden, CP, ciudad..."
                                    className="w-full h-11 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 pl-10 text-sm"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="date" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fecha programada</label>
                            <div className="relative">
                                <input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full h-11 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 pl-10 text-sm"
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            </div>
                        </div>

                        <div className="md:col-span-3 flex flex-col sm:flex-row gap-2 pt-2">
                            <button type="submit" className="flex-1 h-11 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-black transition-all text-sm uppercase tracking-widest flex items-center justify-center">
                                Aplicar Filtros
                            </button>
                            {(search || date) && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); setDate(''); router.get(route('admin.dhl-pickups.index')); }}
                                    className="flex-1 sm:flex-none h-11 px-6 bg-gray-50 text-gray-400 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Limpiar
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700">
                            <Clock className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                            <span className="font-black uppercase tracking-tighter block mb-0.5">Nota de Horario:</span>
                            El horario es aproximado (ventana de recolección). DHL puede presentarse en cualquier momento previo a la hora de cierre indicada.
                        </p>
                    </div>
                </div>

                {/* Lista */}
                {pickups.length === 0 ? (
                    <div className="bg-white p-16 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-100">
                        <Truck className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 text-lg font-medium">No hay recolecciones programadas con estos criterios</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-[1000px] w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-20">ID</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">Orden #</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirmación de Despacho</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-40">Hora Objetivo</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-40">Día Programado</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">Documento</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-36">Registro</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {pickups.map(p => (
                                        <tr key={p.id} className="hover:bg-amber-50/10 transition-all group">
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-black text-gray-400">#{p.id}</span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <Link href={route('admin.orders.show', p.order_id)} className="text-sm font-black text-blue-600 hover:underline">
                                                    #{p.order_id}
                                                </Link>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 inline-block font-mono">
                                                    {p.dispatch_confirmation_number || <span className="text-gray-300 italic font-sans font-normal">Pendiente</span>}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {p.close_time ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xl font-black text-slate-800">{p.close_time}</span>
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">CIERRE VENTANA</span>
                                                    </div>
                                                ) : <span className="text-gray-300">–</span>}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="text-xs font-black text-gray-700 uppercase tracking-tight">{p.pickup_date_display || '—'}</div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {p.label_available ? (
                                                    <a
                                                        href={route('admin.orders.label-pdf', p.order_id)}
                                                        target="_blank" rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all uppercase tracking-widest"
                                                    >
                                                        <Tag className="w-3 h-3" /> ETIQUETA
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">NO DISP.</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="text-[11px] font-bold text-gray-400">{new Date(p.created_at).toLocaleDateString()}</div>
                                                <div className="text-[10px] font-medium text-gray-300 lowercase">{new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-5">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center sm:text-left">
                                MOSTRANDO <span className="text-gray-900">{pickups.length}</span> DE <span className="text-gray-900">{pagination.total}</span>
                                <span className="block sm:inline sm:ml-4 font-black">PÁGINA <span className="text-blue-600">{pagination.current_page}</span> / {pagination.last_page}</span>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {pagination.current_page > 1 && (
                                    <button
                                        onClick={() => router.get(route('admin.dhl-pickups.index'), { page: pagination.current_page - 1, search, date }, { preserveState: true })}
                                        className="h-10 px-4 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm uppercase tracking-tighter"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                                    </button>
                                )}

                                {pagination.current_page < pagination.last_page && (
                                    <button
                                        onClick={() => router.get(route('admin.dhl-pickups.index'), { page: pagination.current_page + 1, search, date }, { preserveState: true })}
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
        </AdminLayout>
    );
};

export default DhlPickups;
