import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import {
    Layers, Search, ArrowLeft, Plus, X,
    Palette, Check, Trash2, ShieldQuestion,
    ChevronRight, Save, Info
} from 'lucide-react';

interface Item {
    id_product: number;
    name: string;
    code: string;
    disponibility: number;
    image?: string | null;
    variant_color_hex?: string | null;
    variant_color_label?: string | null;
}

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

    return (
        <AdminLayout title={`Familia ${famKey}`}>
            <Head title={`Familia ${famKey}`} />

            <div className="container mx-auto p-2 sm:p-4">
                {/* Header Responsivo */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.product-families.index')}
                            className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl sm:text-3xl font-black font-title text-gray-900 tracking-tight">Gestión de Agrupación</h1>
                                <span className="px-2.5 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg text-[10px] font-black uppercase tracking-widest leading-none">
                                    {type || 'S/T'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">
                                <span>BASE IDENTIFICADORA:</span>
                                <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{base || famKey}</span>
                            </div>
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => { e.preventDefault(); router.get(route('admin.product-families.view'), { key: famKey, search }); }}
                        className="w-full lg:w-auto flex gap-2"
                    >
                        <div className="relative flex-1 lg:w-80">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm"
                                placeholder="Buscar productos para añadir..."
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>
                        <button className="h-11 px-6 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                            Buscar
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Panel Izquierdo: Miembros Actuales */}
                    <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden flex flex-col max-h-[1000px]">
                        <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Layers className="w-5 h-5 text-gray-400" />
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Miembros de la Familia</h3>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">{members.length} ITEMS</span>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 scrollbar-thin scrollbar-thumb-gray-100">
                            {members.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShieldQuestion className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Esta familia está vacía</p>
                                </div>
                            ) : (
                                members.map((p) => (
                                    <MemberRow key={p.id_product} item={p} onClear={() => clear(p.id_product)} />
                                ))
                            )}
                        </div>
                    </section>

                    {/* Panel Derecho: Buscador / Pool */}
                    <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden flex flex-col max-h-[1000px]">
                        <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <Plus className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Candidatos Disponibles</h3>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                            {pool.length === 0 ? (
                                <div className="p-16 text-center">
                                    <Search className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
                                        No hay coincidencias fuera <br /> de la agrupación
                                    </p>
                                </div>
                            ) : (
                                pool.map((p) => (
                                    <div key={p.id_product} className="p-6 hover:bg-emerald-50/30 transition-all group flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                                            <img src={p.image || '/images/logotipo.png'} alt={p.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-black text-gray-900 uppercase leading-tight mb-1 truncate">{p.name}</div>
                                            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-tighter">SKU: {p.code}</div>
                                        </div>
                                        <button
                                            onClick={() => assign(p.id_product, famKey)}
                                            className="h-9 w-9 flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                                            title="Agregar a familia"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        {pool.length > 0 && (
                            <div className="p-6 bg-gray-50/30 border-t border-gray-100 text-center">
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic leading-relaxed">
                                    Si no encuentras el producto <br /> intenta una búsqueda por SKU exacto
                                </p>
                            </div>
                        )}
                    </section>
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
        router.post(route('admin.product-families.set-color'), {
            product_id: item.id_product,
            color_hex: combinedHex,
            color_label: label
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
            onSuccess: () => router.reload({ only: ['members'] })
        });
    };

    return (
        <div className="p-6 transition-all border-l-4 border-transparent hover:border-orange-500 hover:bg-orange-50/30 group">
            <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm">
                    <img src={item.image || '/images/logotipo.png'} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                    <div className="text-[11px] font-black text-gray-900 uppercase leading-tight mb-0.5 truncate">{item.name}</div>
                    <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-tighter mb-2">SKU: {item.code}</div>

                    <button
                        onClick={onClear}
                        className="text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest flex items-center gap-1 transition-all"
                    >
                        <Trash2 className="w-3 h-3" /> Quitar de la familia
                    </button>
                </div>
            </div>

            <div className="bg-white/50 border border-gray-100 p-4 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative group/pal">
                            <div className="w-10 h-10 rounded-xl border-2 border-white shadow-md cursor-pointer group-hover/pal:scale-105 transition-transform" style={preview} />
                            <input
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                type="color"
                                value={/^#([0-9a-f]{6})$/i.test(hex1) ? hex1 : '#000000'}
                                onChange={(e) => {
                                    setHex1(e.target.value);
                                    if (!bicolor) setHex2('');
                                }}
                            />
                        </div>
                        <div>
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">SELECTOR DE VARIANTE</div>
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={bicolor}
                                            onChange={(e) => {
                                                const on = e.target.checked;
                                                setBicolor(on);
                                                if (on && !hex2) setHex2('#000000');
                                                if (!on) setHex2('');
                                            }}
                                        />
                                        <div className="w-8 h-4 bg-gray-200 rounded-full peer-checked:bg-orange-500 transition-colors" />
                                        <div className="absolute left-1 w-2 h-2 bg-white rounded-full peer-checked:translate-x-4 transition-transform shadow-sm" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Doble Tono</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[120px]">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ELEGIR COLORES</label>
                        <div className="flex gap-1.5">
                            <input
                                className="flex-1 h-9 px-2 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-black uppercase shadow-inner"
                                type="text"
                                placeholder="#HEX1"
                                value={hex1}
                                onChange={(e) => setHex1(e.target.value.toUpperCase())}
                            />
                            {bicolor && (
                                <input
                                    className="flex-1 h-9 px-2 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-black uppercase shadow-inner animate-in zoom-in-95"
                                    type="text"
                                    placeholder="#HEX2"
                                    value={hex2}
                                    onChange={(e) => setHex2(e.target.value.toUpperCase())}
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-[160px]">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ETIQUETA COMERCIAL</label>
                        <input
                            className="w-full h-9 px-3 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold"
                            type="text"
                            placeholder="Ej: Ámbar Cristal, Blanco Puro..."
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={save}
                        disabled={saving}
                        className={`h-9 px-4 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg ${saving ? 'bg-gray-100 text-gray-400 shadow-none' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-50 active:scale-95'}`}
                    >
                        {saving ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent animate-spin rounded-full" /> : <Save className="w-3 h-3" />}
                        {saving ? '...' : 'ACTUALIZAR'}
                    </button>
                </div>
            </div>
        </div>
    );
}
