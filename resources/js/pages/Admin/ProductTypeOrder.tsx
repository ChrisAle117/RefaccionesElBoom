import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import {
    SortAsc, Save, RotateCcw, ArrowLeft,
    GripVertical, ListOrdered, Info, Layers
} from 'lucide-react';

interface Props {
    types: string[];
}

const ProductTypeOrder: React.FC<Props> = ({ types }) => {
    const [items, setItems] = useState<string[]>(types);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const onDragStart = (index: number) => setDragIndex(index);
    const onDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;
        const newItems = [...items];
        const [moved] = newItems.splice(dragIndex, 1);
        newItems.splice(index, 0, moved);
        setItems(newItems);
        setDragIndex(index);
    };

    const save = () => {
        setSaving(true);
        router.post(route('admin.product-types.order.save'), { order: items }, {
            preserveScroll: true,
            onFinish: () => setSaving(false)
        });
    };

    return (
        <AdminLayout title="Prioridad de Categorías">
            <Head title="Orden de Tipos de Producto" />

            <div className="container mx-auto p-2 sm:p-4 max-w-4xl">
                {/* Header Responsivo */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.products')}
                            className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <ListOrdered className="w-5 h-5" />
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black font-title text-gray-900 tracking-tight">Arquitectura de Categorías</h1>
                            </div>
                            <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] mt-2 ml-1">Prioridad de Visualización</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lista de Ordenamiento */}
                    <div className="lg:col-span-2">
                        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
                            <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <SortAsc className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orden de Aparición</h3>
                                </div>
                                <span className="text-[10px] font-black text-gray-400">{items.length} TIPOS</span>
                            </div>

                            <ol className="divide-y divide-gray-50 p-4 sm:p-6 bg-white overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-100">
                                {items.map((t, i) => (
                                    <li
                                        key={`${t}-${i}`}
                                        className="group flex items-center bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl px-5 py-4 cursor-move transition-all active:scale-[0.98] active:shadow-inner mb-2 last:mb-0"
                                        draggable
                                        onDragStart={() => onDragStart(i)}
                                        onDragOver={(e) => onDragOver(e, i)}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg text-xs font-black border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                {i + 1}
                                            </div>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Layers className="w-4 h-4 text-slate-300 flex-shrink-0" />
                                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight truncate">
                                                    {t || 'SIN CLASIFICAR'}
                                                </span>
                                            </div>
                                        </div>
                                        <GripVertical className="text-slate-200 group-hover:text-slate-400 transition-colors w-5 h-5 flex-shrink-0" />
                                    </li>
                                ))}
                            </ol>
                        </section>
                    </div>

                    {/* Lateral Informativo y Acciones */}
                    <div className="space-y-6">
                        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full opacity-50 -mr-16 -mt-16 group-hover:scale-110 transition-transform" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <Info className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Instrucciones</h3>
                                </div>

                                <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase mb-8">
                                    Arrastra y suelta las categorías para definir su jerarquía en el catálogo público y filtros de búsqueda.
                                </p>

                                <div className="space-y-4">
                                    <button
                                        onClick={save}
                                        disabled={saving}
                                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        {saving ? 'GUARDANDO...' : 'GUARDAR ORDEN'}
                                    </button>

                                    <button
                                        onClick={() => setItems(types)}
                                        disabled={saving}
                                        className="w-full h-14 bg-white text-slate-400 hover:text-slate-900 border-2 border-slate-50 hover:border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                                    >
                                        <RotateCcw className="w-4 h-4" /> RESTABLECER
                                    </button>
                                </div>
                            </div>
                        </section>


                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProductTypeOrder;
