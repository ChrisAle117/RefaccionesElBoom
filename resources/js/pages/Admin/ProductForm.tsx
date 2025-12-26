import React, { useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product]);

    // Lista de tipos que provienen SOLO de base de datos.
    // Si estamos editando y el tipo actual no está, lo incluimos temporalmente para no perderlo en la UI.
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

    // Audio upload form and preview
    const audioInitialUrl = product?.audio_url ?? null;
    const [audioPreview, setAudioPreview] = useState<string | null>(audioInitialUrl);
    const audioForm = useForm<{ audio: File | null }>({ audio: null });

    // Si el tipo actual no existe en la lista de BD, habilitar por defecto el modo "nuevo tipo"
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
        <AdminLayout>
            <Head title={isEditing ? `Editar Producto: ${product.name}` : 'Nuevo Producto'} />

            <div className="container mx-auto p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {/* Nombre */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del producto *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className={`w-full h-10 px-3 border rounded-sm ${errors.name ? 'border-red-500' : 'border-black'}`}
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Código */}
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                                    Código de producto *
                                </label>
                                <input
                                    type="text"
                                    id="code"
                                    className={`w-full h-10 px-3 border rounded-sm ${errors.code ? 'border-red-500' : 'border-black'}`}
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    required
                                />
                                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                            </div>

                            {/* Precio */}
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio *
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                                    <input
                                        type="text"
                                        id="price"
                                        className={`w-full h-10 pl-6 pr-3 border rounded-sm ${errors.price ? 'border-red-500' : 'border-black'}`}
                                        value={data.price}
                                        onChange={handlePriceChange}
                                        required
                                    />
                                </div>
                                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                            </div>

                            {/* Stock Disponible */}
                            <div>
                                <label htmlFor="disponibility" className="block text-sm font-medium text-gray-700 mb-1">
                                    Existencias disponibles *
                                </label>
                                <input
                                    type="number"
                                    id="disponibility"
                                    step="1"
                                    min="0"
                                    className={`w-full h-10 px-3 border rounded-sm ${errors.disponibility ? 'border-red-500' : 'border-black'}`}
                                    value={data.disponibility}
                                    onChange={(e) => setData('disponibility', e.target.value === '' ? '' : parseInt(e.target.value))}
                                    required
                                />
                                {errors.disponibility && <p className="text-red-500 text-xs mt-1">{errors.disponibility}</p>}
                            </div>
                            
                            {/* Peso */}
                            <div>
                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                                    Peso (kg)
                                </label>
                                <input
                                    type="number"
                                    id="weight"
                                    step="0.001"
                                    min="0"
                                    className={`w-full h-10 px-3 border rounded-sm ${errors.weight ? 'border-red-500' : 'border-black'}`}
                                    value={data.weight}
                                    onChange={(e) => setData('weight', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                />
                                {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
                            </div>
                            
                            {/* Dimensiones: Largo, Ancho y Alto*/}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dimensiones (cm)
                                </label>
                                <div className="flex space-x-2">
                                    {/* Largo */}
                                    <div className="flex-1">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id="length"
                                                step="0.001"
                                                min="0"
                                                placeholder="Largo"
                                                className={`w-full h-10 px-3 border rounded-sm ${errors.length ? 'border-red-500' : 'border-black'}`}
                                                value={data.length}
                                                onChange={(e) => setData('length', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                            />
                                        </div>
                                        {errors.length && <p className="text-red-500 text-xs mt-1">{errors.length}</p>}
                                    </div>
                                    
                                    {/* Ancho */}
                                    <div className="flex-1">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id="width"
                                                step="0.001"
                                                min="0"
                                                placeholder="Ancho"
                                                className={`w-full h-10 px-3 border rounded-sm ${errors.width ? 'border-red-500' : 'border-black'}`}
                                                value={data.width}
                                                onChange={(e) => setData('width', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                            />
                                        </div>
                                        {errors.width && <p className="text-red-500 text-xs mt-1">{errors.width}</p>}
                                    </div>
                                    
                                    {/* Alto */}
                                    <div className="flex-1">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id="height"
                                                step="0.001"
                                                min="0"
                                                placeholder="Alto"
                                                className={`w-full h-10 px-3 border rounded-sm ${errors.height ? 'border-red-500' : 'border-black'}`}
                                                value={data.height}
                                                onChange={(e) => setData('height', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                            />
                                        </div>
                                        {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Tipo */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de producto *
                                    </label>
                                    <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={useCustomType}
                                            onChange={(e) => setUseCustomType(e.target.checked)}
                                        />
                                        Es un tipo nuevo
                                    </label>
                                </div>

                                {!useCustomType ? (
                                    <select
                                        id="type"
                                        className={`w-full h-10 px-3 border rounded-sm ${errors.type ? 'border-red-500' : 'border-black'}`}
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccionar tipo</option>
                                        {selectTypes.map((type, index) => (
                                            <option key={index} value={type}>{type}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        id="type"
                                        className={`w-full h-10 px-3 border rounded-sm ${errors.type ? 'border-red-500' : 'border-black'}`}
                                        placeholder="Escribe el nuevo tipo (ej. Plafón, Faro Led, etc.)"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        required
                                    />
                                )}
                                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                                <p className="text-[11px] text-gray-500 mt-1">Los tipos existentes provienen de la base de datos. Marca "Es un tipo nuevo" para agregar uno sin salir del formulario.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Descripción */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción *
                                </label>
                                <textarea
                                    id="description"
                                    rows={5}
                                    className={`w-full h-50 px-3 border rounded-sm ${errors.description ? 'border-red-500' : 'border-black'}`}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    required
                                ></textarea>
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>

                            {/* Imagen (URL) */}
                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                                    URL de la imagen
                                </label>
                                <input
                                    type="text"
                                    id="image"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    className={`w-full h-10 px-3 border rounded-sm ${errors.image ? 'border-red-500' : 'border-gray-300'}`}
                                    value={data.image || ''}
                                    onChange={(e) => {
                                        // Obtener la URL ingresada
                                        const url = e.target.value;
                                        
                                        const normalized = normalizeImagePath(url);
                                        setData('image', normalized);
                                        setImagePreview(buildPreview(normalized));
                                    }}
                                />
                                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}

                                {/* Vista previa de la imagen */}
                                {imagePreview && (
                                    <div className="mt-2 relative">
                                        <img 
                                            src={imagePreview} 
                                            alt="Vista previa" 
                                            className="max-h-40 rounded-md"
                                            onError={() => setImagePreview('')} 
                                        />
                                    </div>
                                )}
                            </div>
                            {/* Audio (solo para tipo Bocina) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Audio de la bocina (mp3/ogg/wav, hasta 10MB)
                                </label>
                                {data.type && data.type.toLowerCase() === 'bocina' ? (
                                    <div className="space-y-2">
                                        {audioPreview ? (
                                            <div className="mb-2">
                                                <audio controls preload="none" src={audioPreview} className="w-full" />
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500">No hay audio cargado.</p>
                                        )}
                                        <input
                                            type="file"
                                            accept="audio/mp3,audio/mpeg,audio/ogg,audio/wav"
                                            onChange={(e) => {
                                                const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                                                audioForm.setData('audio', f || null);
                                            }}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="px-3 py-1 text-sm rounded-sm bg-blue-600 text-white cursor-pointer disabled:opacity-60"
                                                disabled={audioForm.processing || !audioForm.data.audio || !product}
                                                onClick={() => {
                                                    if (!product) return;
                                                    audioForm.post(route('admin.products.audio.upload', product.id_product), {
                                                        forceFormData: true,
                                                        preserveScroll: true,
                                                        onSuccess: () => {
                                                            window.location.reload();
                                                        },
                                                    });
                                                }}
                                            >
                                                Subir audio
                                            </button>
                                            {product && audioPreview && (
                                                <button
                                                    type="button"
                                                    className="px-3 py-1 text-sm rounded-sm bg-red-600 text-white cursor-pointer disabled:opacity-60"
                                                    disabled={audioForm.processing}
                                                    onClick={() => {
                                                        if (!product) return;
                                                        audioForm.delete(route('admin.products.audio.delete', product.id_product), {
                                                            preserveScroll: true,
                                                            onSuccess: () => {
                                                                setAudioPreview(null);
                                                            },
                                                        });
                                                    }}
                                                >
                                                    Eliminar audio
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500">Solo disponible para productos de tipo "bocina".</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500">Este campo aparecerá cuando el tipo sea "bocina".</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end mt-6 space-x-3">
                        <a
                            href={route('admin.products')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancelar
                        </a>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                        >
                            {processing ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Crear Producto')}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default ProductForm;
