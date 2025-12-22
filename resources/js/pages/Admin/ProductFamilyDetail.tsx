import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

interface Item { id_product: number; name: string; code: string; disponibility: number; image?: string | null; variant_color_hex?: string | null; variant_color_label?: string | null; }

export default function ProductFamilyDetail({ familyKey, type, base, members, pool, filters }: { familyKey: string; type?: string; base?: string; members: Item[]; pool: Item[]; filters?: { search?: string } }) {
    const famKey = familyKey;
    const [search, setSearch] = useState(filters?.search ?? '');

    const assign = (product_id: number, family: string) => {
        const pipe = family.indexOf('|');
        const payloadFamily = pipe >= 0 ? family.slice(pipe + 1) : family;
        router.post(route('admin.product-families.assign'), { product_id, family: payloadFamily }, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['members', 'pool'] })
        });
    };

    const clear = (product_id: number) => {
        router.post(route('admin.product-families.clear'), { product_id }, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['members', 'pool'] })
        });
    };

    const img = (p: Item) => p.image || '/images/logotipo.png';

    return (
        <AdminLayout fullWidth title={`Familia ${famKey}`}>
            <Head title={`Familia ${famKey}`} />
            <div className="py-6">
                <div className="w-full bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                    
                    <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-white dark:bg-gray-800 border-b mb-6">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div className="leading-tight">
                                <a href={route('admin.product-families.index')} className="block text-base md:text-lg text-blue-600 hover:underline font-semibold">Volver al listado de familias</a>
                                <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Detalle de familia</h1>
                                <div className="mt-1 text-sm md:text-base text-gray-700 dark:text-gray-300"><span className="font-semibold">Tipo:</span> {type || '-'}</div>
                                <div className="text-sm md:text-base text-gray-700 dark:text-gray-300"><span className="font-semibold">Base:</span> <span className="font-mono">{base || famKey}</span></div>
                            </div>
                            <form
                            onSubmit={(e) => { e.preventDefault(); router.get(route('admin.product-families.view'), { key: famKey, search }); }}
                            className="flex w-full md:w-auto"
                        >
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full md:w-[32rem] border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-l-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                placeholder="Buscar productos para agregar"
                            />
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-r-md font-semibold cursor-pointer">Buscar</button>
                            </form>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="border rounded-lg">
                            <div className="px-4 py-3 text-lg bg-gray-50 dark:bg-gray-700 font-semibold">Miembros de la familia</div>
                            <div className="divide-y max-h-[72vh] overflow-auto">
                                {members.length === 0 && (
                                    <div className="p-5 text-base text-gray-500">No hay productos en esta familia.</div>
                                )}
                                {members.map((p) => (
                                    <MemberRow key={p.id_product} item={p} onClear={() => clear(p.id_product)} />
                                ))}
                            </div>
                        </div>
                        <div className="border rounded-lg">
                            <div className="px-4 py-3 text-lg bg-gray-50 dark:bg-gray-700 font-semibold">Agregar productos</div>
                            <div className="divide-y max-h-[72vh] overflow-auto">
                                {pool.length === 0 && (
                                    <div className="p-5 text-base text-gray-500">No hay resultados. Ajusta tu búsqueda.</div>
                                )}
                                {pool.map((p) => (
                                    <div key={p.id_product} className="flex items-center gap-4 p-4">
                                        <img src={img(p)} alt={p.name} className="w-16 h-16 object-contain bg-gray-50 rounded" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold truncate text-base">{p.name}</div>
                                            <div className="text-xs md:text-sm text-gray-500">{p.code}</div>
                                        </div>
                                        <button onClick={() => assign(p.id_product, famKey)} className="text-sm md:text-base px-3 py-2 bg-[#006CFA] text-white rounded-md font-semibold cursor-pointer">Agregar</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function MemberRow({ item, onClear }: { item: Item; onClear: () => void }) {
    const [label, setLabel] = useState<string>(item.variant_color_label || '');
    const initialHex = item.variant_color_hex || '';
    const initialParts = initialHex.includes('|') ? initialHex.split('|') : [initialHex];
    const [hex1, setHex1] = useState<string>(initialParts[0] || '');
    const [hex2, setHex2] = useState<string>(initialParts[1] || '');
    const [bicolor, setBicolor] = useState<boolean>(initialParts.length >= 2);
    const [saving, setSaving] = useState(false);

    const combinedHex = bicolor && hex1 && hex2 ? `${hex1}|${hex2}` : (hex1 || '');
    const preview = (bicolor && hex1 && hex2)
        ? { background: `linear-gradient(90deg, ${hex1} 0%, ${hex1} 50%, ${hex2} 50%, ${hex2} 100%)` }
        : { background: hex1 || '#eee' } as React.CSSProperties;

    const save = () => {
        setSaving(true);
        router.post(route('admin.product-families.set-color'), { product_id: item.id_product, color_hex: combinedHex, color_label: label }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
            onSuccess: () => router.reload({ only: ['members'] })
        });
    };

    return (
        <div className="flex items-center gap-4 p-4">
            <img src={item.image || '/images/logotipo.png'} alt={item.name} className="w-16 h-16 object-contain bg-gray-50 rounded" />
            <div className="flex-1 min-w-0">
                <div className="font-semibold truncate text-base">{item.name}</div>
                <div className="text-xs md:text-sm text-gray-500">{item.code}</div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                    <div className="w-6 h-6 rounded-full border border-black" style={preview} title={combinedHex || '(auto)'} />
                    <input
                        className="w-32 border border-gray-300 dark:border-gray-600 px-2 py-1 rounded text-sm"
                        type="text"
                        placeholder="#RRGGBB o c1|c2"
                        value={combinedHex}
                        onChange={(e) => {
                            const val = e.target.value.trim();
                            if (val.includes('|')) {
                                const parts = val.split('|');
                                setHex1(parts[0] || '');
                                setHex2(parts[1] || '');
                                setBicolor(true);
                            } else {
                                setHex1(val);
                                setHex2('');
                                setBicolor(false);
                            }
                        }}
                    />
                    <label className="flex items-center gap-1 text-sm select-none">
                        <input type="checkbox" className="mr-1" checked={bicolor} onChange={(e) => { const on = e.target.checked; setBicolor(on); if (on && !hex2) setHex2('#000000'); if (!on) setHex2(''); }} />
                        Bicolor
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-xs">C1</span>
                        <input
                            className="w-10 h-8 p-0 border border-gray-300 rounded"
                            type="color"
                            value={/^#([0-9a-f]{6})$/i.test(hex1) ? hex1 : '#000000'}
                            onChange={(e) => setHex1(e.target.value)}
                            title="Color primario"
                        />
                        {bicolor && (
                            <>
                                <span className="text-xs">C2</span>
                                <input
                                    className="w-10 h-8 p-0 border border-gray-300 rounded"
                                    type="color"
                                    value={/^#([0-9a-f]{6})$/i.test(hex2) ? hex2 : '#ffffff'}
                                    onChange={(e) => setHex2(e.target.value)}
                                    title="Color secundario"
                                />
                            </>
                        )}
                    </div>
                    <input
                        className="w-44 border border-gray-300 dark:border-gray-600 px-2 py-1 rounded text-sm"
                        type="text"
                        placeholder="Etiqueta de color (opcional)"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                    />
                    <button onClick={save} disabled={saving} className={`text-sm px-3 py-1 rounded font-semibold ${saving ? 'bg-gray-400 text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                        {saving ? 'Guardando…' : 'Guardar'}
                    </button>
                </div>
            </div>
            <button onClick={onClear} className="text-sm md:text-base px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold cursor-pointer">Quitar</button>
        </div>
    );
}
