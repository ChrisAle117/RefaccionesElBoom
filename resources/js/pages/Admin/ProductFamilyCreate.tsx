import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

export default function ProductFamilyCreate({ typeOptions = [], defaults }: { typeOptions?: string[]; defaults?: { type?: string; base?: string } }) {
    const [type, setType] = useState(defaults?.type ?? '');
    const [base, setBase] = useState(defaults?.base ?? '');

    const go = (e: React.FormEvent) => {
        e.preventDefault();
        if (!base.trim()) return;
        const key = `${type || ''}|${base.trim()}`;
        router.get(route('admin.product-families.view'), { key });
    };

    return (
        <AdminLayout fullWidth title="Crear familia">
            <Head title="Crear familia" />
            <div className="py-6">
                <div className="w-full bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                    <div className="mb-6">
                        <a href={route('admin.product-families.index')} className="text-blue-600 hover:underline font-semibold">Volver al listado</a>
                        <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Nueva familia</h1>
                        <p className="text-gray-600 dark:text-gray-300">Elige el tipo y escribe la base (prefijo común del código). Abriremos el detalle para que agregues miembros.</p>
                    </div>
                    <form onSubmit={go} className="flex flex-col md:flex-row gap-3 md:items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Tipo</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                                <option value="">(sin tipo)</option>
                                {typeOptions.map((t: string) => (
                                    <option key={t} value={t}>{t || '(sin tipo)'}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Base</label>
                            <input value={base} onChange={(e) => setBase(e.target.value)} placeholder="Ej. ABC123" className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
                        </div>
                        <div>
                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold">Abrir familia</button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
