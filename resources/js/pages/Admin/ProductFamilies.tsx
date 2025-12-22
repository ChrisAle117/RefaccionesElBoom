import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

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

    const assign = (product_id: number, family: string) => {
        router.post(route('admin.product-families.assign'), { product_id, family }, { preserveScroll: true });
    };
    const clear = (product_id: number) => {
        router.post(route('admin.product-families.clear'), { product_id }, { preserveScroll: true });
    };
    const toggleOpt = (product_id: number, current: boolean) => {
        router.post(route('admin.product-families.opt-out'), { product_id, opt_out: !current }, { preserveScroll: true });
    };

    return (
        <AdminLayout fullWidth title="Familias de productos">
            <Head title="Familias de productos" />
            <div className="py-6">
                <div className="w-full bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Familias de productos</h1>
                        <form onSubmit={(e) => { e.preventDefault(); router.get(route('admin.product-families.index'), { search, type }); }} className="flex w-full md:w-auto items-center gap-2">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full md:w-96 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-l-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                placeholder="Buscar por nombre, código o familia"
                            />
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                            >
                                <option value="">Todos los tipos</option>
                                {typeOptions.map((t) => (
                                    <option key={t} value={t}>{t || '(sin tipo)'}</option>
                                ))}
                            </select>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold cursor-pointer">Buscar</button>
                            <button type="button" onClick={() => router.get(route('admin.product-families.create'))} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold cursor-pointer ml-2">Crear familia</button>
                        </form>
                    </div>
                    <div className="space-y-3">
                        {families.map((f) => (
                            <div key={f.key} className="border rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="text-base md:text-lg text-gray-800 dark:text-gray-200 truncate">
                                    <span className="font-semibold">Tipo:</span> <span>{f.type || '-'}</span>
                                    <span className="mx-3">•</span>
                                    <span className="font-semibold">Base:</span> <span className="font-mono">{f.base || f.key}</span>
                                    <span className="mx-3">•</span>
                                    <span><span className="font-semibold">Productos:</span> {f.count}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => router.get(route('admin.product-families.view'), { key: f.key })}
                                        className="text-sm md:text-base px-4 py-2 bg-[#006CFA] text-white rounded-md font-semibold cursor-pointer"
                                    >
                                        Abrir
                                    </button>
                                    <button onClick={() => setToDelete(f)} className="text-sm md:text-base px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold cursor-pointer">Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Delete confirmation modal */}
            {toDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setToDelete(null)} />
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[92vw] max-w-md p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Eliminar familia</h2>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            ¿Seguro que deseas eliminar esta familia? Los productos quedarán fuera de agrupación.
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            <div><span className="font-semibold">Tipo:</span> {toDelete.type || '-'}</div>
                            <div><span className="font-semibold">Base:</span> <span className="font-mono">{toDelete.base || toDelete.key}</span></div>
                            <div><span className="font-semibold">Productos:</span> {toDelete.count}</div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setToDelete(null)}
                                className="px-4 py-2 rounded-md font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    const key = toDelete.key;
                                    setToDelete(null);
                                    router.post(route('admin.product-families.delete'), { key }, { preserveScroll: true });
                                }}
                                className="px-4 py-2 rounded-md font-semibold bg-red-600 hover:bg-red-700 text-white"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
