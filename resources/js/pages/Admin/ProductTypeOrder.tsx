import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

interface Props {
    types: string[];
    savedOrder: string[];
}

const ProductTypeOrder: React.FC<Props> = ({ types, savedOrder }) => {
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
        <AdminLayout fullWidth title="Orden de tipos de producto">
            <Head title="Orden de tipos de producto" />
            <div className="py-6">
                <div className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-sm rounded-md p-6 sm:p-8">
                    <h1 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Ordenar tipos de producto</h1>
                    <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
                        Arrastra los elementos para definir el orden en que se mostrarán los productos por tipo.
                    </p>

                    <ol className="space-y-3">
                        {items.map((t, i) => (
                            <li
                                key={`${t}-${i}`}
                                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-4 py-3 cursor-move border border-gray-200 dark:border-gray-600"
                                draggable
                                onDragStart={() => onDragStart(i)}
                                onDragOver={(e) => onDragOver(e, i)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm w-7 text-center bg-gray-200 dark:bg-gray-600 rounded py-0.5">{i + 1}</span>
                                    <span className="text-base text-gray-800 dark:text-gray-100">{t || 'Sin clasificar'}</span>
                                </div>
                                <span className="text-gray-400 text-lg select-none">⇅</span>
                            </li>
                        ))}
                    </ol>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={save}
                            disabled={saving}
                            className="px-5 py-2.5 bg-[#006CFA] text-white rounded-md disabled:opacity-70"
                        >
                            {saving ? 'Guardando…' : 'Guardar orden'}
                        </button>
                        <button
                            onClick={() => setItems(types)}
                            disabled={saving}
                            className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md"
                        >
                            Restablecer
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProductTypeOrder;
