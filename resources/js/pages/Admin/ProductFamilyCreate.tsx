import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Layers, ArrowLeft, ChevronRight, Info, Filter, Hash } from 'lucide-react';

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
        <AdminLayout title="Crear Agrupación">
            <Head title="Nueva Familia de Productos" />

            <div className="container mx-auto p-2 sm:p-4 max-w-3xl">
                {/* Header Responsivo */}
                <div className="flex items-center gap-4 mb-10">
                    <Link
                        href={route('admin.product-families.index')}
                        className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <Layers className="w-5 h-5" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black font-title text-gray-900 leading-none">Nueva Agrupación</h1>
                        </div>
                        <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] mt-2 ml-1">Configuración de Familia</p>
                    </div>
                </div>

                <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8">
                            <Info className="w-4 h-4 text-indigo-500" />
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                                Define los criterios para agrupar productos con variantes (colores, tonos, etc).
                            </p>
                        </div>

                        <form onSubmit={go} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                                        <Filter className="w-3 h-3" /> Tipo de Producto
                                    </label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full h-14 px-6 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm font-black focus:bg-white focus:border-indigo-600 focus:outline-none transition-all shadow-inner"
                                    >
                                        <option value="">(SIN TIPO ASIGNADO)</option>
                                        {typeOptions.map((t: string) => (
                                            <option key={t} value={t}>{t || '(SIN TIPO)'}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                                        <Hash className="w-3 h-3" /> Base Identificadora (Prefijo)
                                    </label>
                                    <input
                                        value={base}
                                        onChange={(e) => setBase(e.target.value)}
                                        placeholder="Ej. ABC123"
                                        className="w-full h-14 px-6 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm font-mono font-black placeholder:font-sans placeholder:font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all shadow-inner"
                                    />
                                    <p className="mt-2 ml-1 text-[9px] font-bold text-gray-300 uppercase italic">
                                        * El prefijo común que comparten los códigos de la familia.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3">
                                    Configurar Miembros
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Elementos decorativos */}
                    <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-50 rounded-full opacity-20" />
                    <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-indigo-50 rounded-full opacity-30" />
                </div>
            </div>
        </AdminLayout>
    );
}
