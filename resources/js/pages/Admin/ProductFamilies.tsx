import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Layers, Search, Plus, Trash2, ExternalLink, Filter, XCircle, Info } from 'lucide-react';

type Family = {
    key: string;
    type?: string;
    base?: string;
    count: number;
    products: Array<{
        id_product: number;
        name: string;
        code: string;
        disponibility: number;
        variant_group?: string | null;
        opt_out: boolean;
        color_hex?: string | null;
        color_label?: string | null;
    }>;
};

export default function ProductFamilies({ families, typeOptions = [], filters }: { families: Family[]; typeOptions?: string[]; filters?: { search?: string; type?: string } }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [type, setType] = useState(filters?.type ?? '');
    const [toDelete, setToDelete] = useState<Family | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.product-families.index'), { search, type });
    };

    return (
        <AdminLayout title="Familias de productos">
            <Head title="Familias de productos" />

            <div className="container mx-auto p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black font-title">Familias de Productos</h1>
                    </div>

                    <button
                        onClick={() => router.get(route('admin.product-families.create'))}
                        className="w-full sm:w-auto h-11 px-6 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-black shadow-md shadow-orange-100 transition-all text-sm flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Crear Familia</span>
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-slate-800 transition-all">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 relative">
                            <label htmlFor="search" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Buscar producto o base</label>
                            <div className="relative">
                                <input
                                    id="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Nombre, código o familia..."
                                    className="w-full h-11 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 pl-10 text-sm"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Por Tipo de Producto</label>
                            <div className="relative">
                                <select
                                    id="type"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full h-11 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 pl-10 text-sm appearance-none flex items-center"
                                >
                                    <option value="">Todos los tipos</option>
                                    {typeOptions.map((t) => (
                                        <option key={t} value={t}>{t || '(sin tipo)'}</option>
                                    ))}
                                </select>
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        <div className="md:col-span-3 flex flex-col sm:flex-row gap-2 pt-2">
                            <button type="submit" className="flex-1 h-11 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-black transition-all text-sm uppercase tracking-widest">
                                Filtrar Familias
                            </button>
                            {(search || type) && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); setType(''); router.get(route('admin.product-families.index')); }}
                                    className="flex-1 sm:flex-none h-11 px-6 bg-gray-50 text-gray-400 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Limpiar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Grid de Familias */}
                {families.length === 0 ? (
                    <div className="bg-white p-16 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-100">
                        <Layers className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 text-lg font-medium">No se encontraron familias registradas</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {families.map((f) => (
                            <div key={f.key} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg border border-orange-100 uppercase tracking-widest">
                                                {f.type || 'S/T'}
                                            </span>
                                            <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                                                BASE: <span className="font-mono text-slate-500">{f.base || f.key}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                                            <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {f.count} PRODUCTOS AGRUPADOS</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-start md:self-center">
                                        <button
                                            onClick={() => router.get(route('admin.product-families.view'), { key: f.key })}
                                            className="h-10 px-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-black transition-all text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100"
                                        >
                                            <ExternalLink className="w-3 h-3" /> Abrir Familia
                                        </button>
                                        <button
                                            onClick={() => setToDelete(f)}
                                            className="h-10 w-10 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute -left-2 -bottom-2 w-16 h-16 bg-orange-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Eliminación */}
            {toDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/40 p-4 transition-all animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-6 mx-auto shadow-inner">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">¿Eliminar Agrupación?</h2>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed text-center font-medium">
                            Los <span className="text-gray-900 font-black">{toDelete.count} productos</span> de esta familia
                            quedarán desagrupados. Esta acción no afecta las existencias.
                        </p>

                        <div className="bg-gray-50 p-4 rounded-xl mb-8 flex items-start gap-3 border border-gray-100">
                            <Info className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumen de familia</div>
                                <div className="text-xs font-bold text-gray-700 mt-1">
                                    {toDelete.type || 'Sin tipo'} • {toDelete.base || toDelete.key}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    const key = toDelete.key;
                                    setToDelete(null);
                                    router.post(route('admin.product-families.delete'), { key }, { preserveScroll: true });
                                }}
                                className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center font-black shadow-lg shadow-rose-100 transition-all text-xs uppercase tracking-widest cursor-pointer"
                            >SÍ, DESAGRUPAR PRODUCTOS</button>
                            <button
                                type="button"
                                className="w-full py-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 font-black transition-all text-xs uppercase tracking-widest cursor-pointer"
                                onClick={() => setToDelete(null)}
                            >CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
