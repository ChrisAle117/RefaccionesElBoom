import React, { useMemo, useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Package, Save, X, Image as ImageIcon, Music, Ruler, Info, ArrowLeft, Plus } from 'lucide-react';

interface ProductFormProps {
    product?: {
        id_product: number;
        name: string;
        code: string;
        description: string;
        price: number;
        disponibility: number;
        reserved_stock: number;
        weight: number;
        length: number;
        width: number;
        height: number;
        type: string;
        image: string | null;
        audio_url?: string | null;
    };
    types: string[];
}

const ProductForm: React.FC<ProductFormProps> = ({ product, types }) => {
    const isEditing = !!product;
    const [imagePreview, setImagePreview] = useState<string>('');
    const [useCustomType, setUseCustomType] = useState<boolean>(false);

    const normalizeImagePath = (raw: string): string => {
        if (!raw) return '';
        let url = raw.trim();
        const multi = url.match(/https?:\/\/[^\s]+/g);
        if (multi && multi.length > 1) {
            url = multi[multi.length - 1];
        }
        const storageIdx = url.indexOf('/storage/');
        if (storageIdx !== -1) {
            url = url.substring(storageIdx + '/storage/'.length);
        }
        url = url.replace(/^\/+/, '');
        return url;
    };

    const buildPreview = (value: string): string => {
        if (!value) return '';
        if (value.startsWith('http://') || value.startsWith('https://')) return value;
        return `/storage/${value.replace(/^storage\//, '')}`;
    };

    React.useEffect(() => {
        if (product?.image) {
            const normalized = normalizeImagePath(product.image);
            setData('image', normalized);
            setImagePreview(buildPreview(normalized));
        }
    }, [product]);

    const selectTypes = useMemo(() => {
        const list = Array.isArray(types) ? [...types] : [];
        if (product?.type && product.type !== '' && !list.includes(product.type)) {
            list.unshift(product.type);
        }
        return list;
    }, [types, product?.type]);

    const { data, setData, errors, post, put, processing } = useForm({
        name: product?.name || '',
        code: product?.code || '',
        description: product?.description || '',
        price: product?.price || '',
        disponibility: product?.disponibility || '',
        reserved_stock: product?.reserved_stock || 0,
        weight: product?.weight || '',
        length: product?.length || '',
        width: product?.width || '',
        height: product?.height || '',
        type: product?.type || '',
        image: product?.image || ''
    });

    const audioInitialUrl = product?.audio_url ?? null;
    const [audioPreview, setAudioPreview] = useState<string | null>(audioInitialUrl);
    const audioForm = useForm<{ audio: File | null }>({ audio: null });

    React.useEffect(() => {
        if (data.type && !selectTypes.includes(data.type)) {
            setUseCustomType(true);
        }
    }, [data.type, selectTypes]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setData('price', value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.products.update', product.id_product));
        } else {
            post(route('admin.products.store'));
        }
    };

    return (
        <AdminLayout title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}>
            <Head title={isEditing ? `Editar: ${product.name}` : 'Nuevo Producto'} />

            <div className="container mx-auto p-2 sm:p-4 max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                            <Package className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black font-title text-gray-900 leading-none">
                                {isEditing ? 'Editar Ficha' : 'Nueva Ficha'}
                            </h1>
                            <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5">Módulo de Inventario</p>
                        </div>
                    </div>

                    <Link
                        href={route('admin.products')}
                        className="h-11 w-11 flex items-center justify-center bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-gray-900 hover:shadow-md transition-all"
                    >
                        <X className="w-6 h-6" />
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Columna Principal (2/3) */}
                        <div className="lg:col-span-2 space-y-6">
                            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <Info className="w-3 h-3" /> Información General
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">NOMBRE TÉCNICO DEL PRODUCTO</label>
                                        <input
                                            type="text"
                                            className={`w-full h-14 px-5 border-2 rounded-2xl bg-gray-50/50 hover:bg-white hover:border-blue-100 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-sm font-black shadow-inner ${errors.name ? 'border-red-200 bg-red-50' : 'border-gray-50'}`}
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Ej: Calavera Exterior Izquierda Freightliner Cascadia"
                                            required
                                        />
                                        {errors.name && <p className="text-red-500 text-[10px] font-black mt-2 uppercase px-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">DESCRIPCIÓN COMERCIAL</label>
                                        <textarea
                                            rows={6}
                                            className={`w-full p-5 border-2 rounded-2xl bg-gray-50/50 hover:bg-white hover:border-blue-100 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-sm font-medium shadow-inner leading-relaxed ${errors.description ? 'border-red-200 bg-red-50' : 'border-gray-50'}`}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Detalla las características, compatibilidad y beneficios..."
                                            required
                                        ></textarea>
                                        {errors.description && <p className="text-red-500 text-[10px] font-black mt-2 uppercase px-1">{errors.description}</p>}
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <Ruler className="w-3 h-3" /> Logística y Dimensiones
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">PESO (KG)</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            className="w-full h-12 px-4 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-sm font-black"
                                            value={data.weight}
                                            onChange={(e) => setData('weight', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">LARGO (CM)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full h-12 px-4 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-sm font-black"
                                            value={data.length}
                                            onChange={(e) => setData('length', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ANCHO (CM)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full h-12 px-4 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-sm font-black"
                                            value={data.width}
                                            onChange={(e) => setData('width', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ALTO (CM)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full h-12 px-4 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-sm font-black"
                                            value={data.height}
                                            onChange={(e) => setData('height', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Columna Lateral (1/3) */}
                        <div className="space-y-6">
                            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <Save className="w-3 h-3" /> Datos de Control
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">CÓDIGO ÚNICO (SKU)</label>
                                        <input
                                            type="text"
                                            className={`w-full h-12 px-4 border-2 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-sm font-mono font-black ${errors.code ? 'border-red-200 bg-red-50' : 'border-gray-50'}`}
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            placeholder="XXXX-0000"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">PRECIO DE VENTA ($)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">$</span>
                                            <input
                                                type="text"
                                                className="w-full h-12 pl-10 pr-4 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-sm font-black"
                                                value={data.price}
                                                onChange={handlePriceChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">STOCK DISPONIBLE</label>
                                        <input
                                            type="number"
                                            className="w-full h-12 px-4 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-sm font-black"
                                            value={data.disponibility}
                                            onChange={(e) => setData('disponibility', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CATEGORÍA</label>
                                            <button
                                                type="button"
                                                onClick={() => setUseCustomType(!useCustomType)}
                                                className="text-[9px] font-black text-blue-600 hover:underline uppercase tracking-tighter"
                                            >
                                                {useCustomType ? 'USAR EXISTENTES' : 'CREAR NUEVO TIPO'}
                                            </button>
                                        </div>

                                        {!useCustomType ? (
                                            <select
                                                className="w-full h-12 px-4 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-sm font-black"
                                                value={data.type}
                                                onChange={(e) => setData('type', e.target.value)}
                                                required
                                            >
                                                <option value="">Selecciona...</option>
                                                {selectTypes.map((type, idx) => (
                                                    <option key={idx} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                className="w-full h-12 px-4 border-2 border-blue-100 rounded-xl bg-blue-50/30 focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-sm font-black placeholder:text-blue-200"
                                                placeholder="Nombre del nuevo tipo"
                                                value={data.type}
                                                onChange={(e) => setData('type', e.target.value)}
                                                required
                                            />
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
                                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <ImageIcon className="w-3 h-3" /> Media & Imagen
                                </h3>

                                <div className="space-y-4">
                                    <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative shadow-inner">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" onError={() => setImagePreview('')} />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ImageIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-tight">Sin Imagen <br /> Detectada</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full h-10 px-4 border-2 border-gray-50 rounded-xl bg-gray-50 text-[10px] font-bold focus:bg-white transition-all uppercase tracking-tighter"
                                            placeholder="Enlace de la imagen (URL)..."
                                            value={data.image || ''}
                                            onChange={(e) => {
                                                const normalized = normalizeImagePath(e.target.value);
                                                setData('image', normalized);
                                                setImagePreview(buildPreview(normalized));
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-50 rounded-full opacity-30 group-hover:scale-125 transition-transform" />
                            </section>

                            {/* Audio Conditional Section */}
                            {data.type?.toLowerCase() === 'bocina' && (
                                <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom duration-300">
                                    <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                        <Music className="w-3 h-3" /> Muestra de Sonido
                                    </h3>

                                    <div className="space-y-4">
                                        {audioPreview ? (
                                            <audio controls className="w-full h-8" src={audioPreview} />
                                        ) : (
                                            <div className="text-[10px] font-bold text-gray-300 italic mb-2">Audio no disponible</div>
                                        )}

                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <input
                                                type="file"
                                                accept="audio/*"
                                                className="text-[10px] font-black text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer w-full"
                                                onChange={(e) => audioForm.setData('audio', e.target.files?.[0] || null)}
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                                disabled={audioForm.processing || !audioForm.data.audio || !product}
                                                onClick={() => audioForm.post(route('admin.products.audio.upload', product!.id_product), { forceFormData: true, onSuccess: () => window.location.reload() })}
                                            >SUBIR AUDIO</button>

                                            {product && audioPreview && (
                                                <button
                                                    type="button"
                                                    className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all"
                                                    disabled={audioForm.processing}
                                                    onClick={() => audioForm.delete(route('admin.products.audio.delete', product.id_product), { onSuccess: () => setAudioPreview(null) })}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-4 z-20 flex flex-col sm:flex-row items-center gap-3 mt-8">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:flex-1 h-16 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:bg-blue-400"
                        >
                            <Save className={`${processing ? 'animate-pulse' : ''} w-5 h-5`} />
                            {processing ? 'GUARDANDO...' : (isEditing ? 'ACTUALIZAR FICHA' : 'CREAR PRODUCTO')}
                        </button>

                        <Link
                            href={route('admin.products')}
                            className="w-full sm:w-auto h-16 px-8 bg-white text-gray-400 border border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> CANCELAR
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default ProductForm;
