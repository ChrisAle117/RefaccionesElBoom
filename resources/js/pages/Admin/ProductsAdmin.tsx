import React, { useState, useEffect } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Package } from 'lucide-react';

const formatPrice = (price: number | null | undefined) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 })
        .format(typeof price === 'number' ? price : 0);

interface Product {
    id_product: number;
    name: string | null;
    code: string | null;
    price: number | null;
    description: string | null;
    disponibility: number;
    reserved_stock: number;
    type: string | null;
    image: string | null;
    active: boolean;
}

interface ProductsProps {
    products: Product[];
    filters: { search: string; type: string; availability?: string; min_price?: number | string | null; max_price?: number | string | null; active_status?: string };
    types: string[];
    pagination: { total: number; per_page: number; current_page: number; last_page: number };
    totalOutOfStock: number;
}

const ProductsAdmin: React.FC<ProductsProps> = ({ products, filters, types, pagination, totalOutOfStock }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const [availabilityFilter, setAvailabilityFilter] = useState(filters?.availability ? filters.availability : 'all');
    const [priceRangeFilter, setPriceRangeFilter] = useState({
        min: (filters?.min_price != null ? String(filters.min_price) : ''),
        max: (filters?.max_price != null ? String(filters.max_price) : ''),
    });
    const [activeStatusFilter, setActiveStatusFilter] = useState(filters?.active_status ? filters.active_status : 'all');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Estado sincronización stock
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncPassword, setSyncPassword] = useState('');
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

    // Estado para manejar cambio de estatus en curso 
    const [isStatusChanging, setIsStatusChanging] = useState<number | null>(null);

    // Conteo de incidencias (sobreventa)
    const [incidenceCount, setIncidenceCount] = useState<number | null>(null);
    const [incidenceLoading, setIncidenceLoading] = useState(false);


    useEffect(() => {
        let aborted = false;
        const fetchCount = () => {
            setIncidenceLoading(true);
            fetch(route('admin.products.incidences-count'), { credentials: 'include' })
                .then(r => r.ok ? r.json() : null)
                .then(data => { if (!aborted && data && data.success) setIncidenceCount(data.count); })
                .catch(() => { })
                .finally(() => { if (!aborted) setIncidenceLoading(false); });
        };
        fetchCount();
        const id = setInterval(fetchCount, (import.meta.env.VITE_INCIDENCES_POLL_INTERVAL_MS ? parseInt(import.meta.env.VITE_INCIDENCES_POLL_INTERVAL_MS) : 60000) || 60000);
        return () => { aborted = true; clearInterval(id); };
    }, []);


    // console.log('ProductsAdmin props example:', products?.[0]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.products'), {
            search: searchTerm,
            type: typeFilter,
            availability: availabilityFilter,
            min_price: priceRangeFilter.min,
            max_price: priceRangeFilter.max,
            active_status: activeStatusFilter
        }, { preserveState: true, replace: true });
    };

    const handleTypeFilter = (type: string) => {
        setTypeFilter(type);
        router.get(route('admin.products'), {
            search: searchTerm,
            type,
            availability: availabilityFilter,
            min_price: priceRangeFilter.min,
            max_price: priceRangeFilter.max,
            active_status: activeStatusFilter
        }, { preserveState: true, replace: true });
    };

    const openDeleteModal = (product: Product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
        setDeleteError(null);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setProductToDelete(null);
        setDeleteError(null);
    };

    const handleConfirmDelete = () => {
        if (!productToDelete) return;
        const id = productToDelete.id_product;
        setIsDeleting(id);

        router.delete(route('admin.products.destroy', id), {
            onSuccess: (page) => {
                setIsDeleting(null);
                closeDeleteModal();
                const flash = page.props.flash as Record<string, string | null>;
                if (flash && flash.error) {
                    setDeleteError(flash.error || null);
                    setShowDeleteModal(true);
                }
            },
            onError: (errors) => {
                setIsDeleting(null);
                const errorMsg = (typeof errors === 'object' && errors && 'message' in errors)
                    ? String((errors as { message?: unknown }).message ?? 'Error desconocido al eliminar el producto')
                    : 'Error desconocido al eliminar el producto';
                setDeleteError(errorMsg);
                // console.error('Error al eliminar producto:', errors);
            }
        });
    };

    const toggleProductStatus = (id: number) => {
        // Llamada directa al backend para alternar el estado
        setIsStatusChanging(id);
        router.put(route('admin.products.toggle-status', id), {}, {
            preserveScroll: true,
            onSuccess: () => setIsStatusChanging(null),
            onError: () => {
                setIsStatusChanging(null);
                // console.error('Error al cambiar estado del producto:', _errors);
            },
            onFinish: () => {
                setIsStatusChanging(null);
            }
        });
    };

    const { flash } = usePage().props as unknown as { flash: Record<string, string | null> };

    return (
        <AdminLayout title="Gestión de productos">
            <Head title="Gestión de productos" />

            <div className="container mx-auto p-2 sm:p-4">
                {flash?.error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                        {flash.error}
                    </div>
                )}
                {flash?.success && (
                    <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2">
                        {flash.success}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold font-title">Gestión de Productos</h1>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => { setShowSyncModal(true); setSyncPassword(''); setSyncError(null); setSyncSuccess(null); }}
                            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer shadow-sm text-sm transition-all"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M9 4h6M9 20h6M5.5 9a7.5 7.5 0 0013 0" />
                            </svg>
                            <span className="truncate">Sincronizar Stock</span>
                        </button>
                        <Link href={route('admin.products.create')} className="flex-1 sm:flex-none">
                            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer text-sm transition-all shadow-sm">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Nuevo Producto</span>
                            </button>
                        </Link>
                        <Link href={route('admin.products.incidences')} className="flex-1 sm:flex-none">
                            <button
                                type="button"
                                className="relative w-full bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer shadow-sm disabled:opacity-60 text-sm transition-all"
                                disabled={incidenceLoading}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
                                </svg>
                                <span>Incidencias</span>
                                {incidenceCount !== null && (
                                    <span className={`ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${incidenceCount > 0 ? 'bg-white text-rose-600' : 'bg-white/70 text-rose-500'}`}>
                                        {incidenceLoading ? '…' : incidenceCount}
                                    </span>
                                )}
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-slate-800 transition-colors">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-2">
                                <label htmlFor="search" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Búsqueda</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="search"
                                        placeholder="Buscar por nombre o código..."
                                        className="w-full h-11 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10 text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Categoría</label>
                                <select
                                    id="type"
                                    className="w-full h-11 cursor-pointer rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    value={typeFilter}
                                    onChange={(e) => handleTypeFilter(e.target.value)}
                                >
                                    <option value="">Todas las categorías</option>
                                    {types.map((type, index) => (
                                        <option key={index} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="availability" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Filtro de Stock</label>
                                <select
                                    id="availability"
                                    className="w-full h-11 cursor-pointer rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    value={availabilityFilter}
                                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                                >
                                    <option value="all">Todo el stock</option>
                                    <option value="in_stock">En existencia</option>
                                    <option value="low_stock">Existencia baja (&lt;10)</option>
                                    <option value="out_of_stock">Agotado</option>
                                    <option value="high_stock">Sobre existencia (≥20)</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="active_status" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Estado</label>
                                <select
                                    id="active_status"
                                    className="w-full h-11 cursor-pointer rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    value={activeStatusFilter}
                                    onChange={(e) => setActiveStatusFilter(e.target.value)}
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="active">Solo Activos</option>
                                    <option value="inactive">Solo Inactivos</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 lg:col-span-1">
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Rango de Precio</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full h-11 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3"
                                        value={priceRangeFilter.min}
                                        onChange={(e) => setPriceRangeFilter(prev => ({ ...prev, min: e.target.value }))}
                                        min="0"
                                    />
                                    <span className="text-gray-300">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full h-11 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3"
                                        value={priceRangeFilter.max}
                                        onChange={(e) => setPriceRangeFilter(prev => ({ ...prev, max: e.target.value }))}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-4">
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                <a
                                    href="/admin/products/out-of-stock-report"
                                    target="_blank"
                                    className="w-full sm:w-auto px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-all text-sm flex items-center justify-center font-semibold shadow-sm"
                                    rel="noopener noreferrer"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Reporte de Agotados
                                </a>
                                <span className="text-rose-600 dark:text-rose-400 font-bold text-xs bg-rose-50 dark:bg-rose-950/30 px-4 py-2 rounded-full border border-rose-100 dark:border-rose-900/50 flex items-center justify-center">
                                    Agotados: {totalOutOfStock}
                                </span>
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setTypeFilter('');
                                        setAvailabilityFilter('all');
                                        setPriceRangeFilter({ min: '', max: '' });
                                        setActiveStatusFilter('all');
                                        router.get(route('admin.products'));
                                    }}
                                    className="flex-1 sm:flex-none h-11 px-6 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-all border border-gray-100 font-bold text-sm"
                                >
                                    Limpiar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 sm:flex-none h-11 px-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all text-sm flex items-center justify-center"
                                >
                                    Filtrar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Lista */}
                {products.length === 0 ? (
                    <div className="bg-white p-16 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-100">
                        <Package className="w-20 h-20 mx-auto text-gray-200 mb-4" strokeWidth={1} />
                        <p className="text-gray-400 text-lg font-medium">No hay productos que coincidan con tu búsqueda</p>
                        <button
                            onClick={() => { setSearchTerm(''); router.get(route('admin.products')); }}
                            className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-bold transition-all"
                        >
                            Limpiar búsqueda y ver todo
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-[1000px] w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">Imagen</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalles del Producto</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">Código</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-28">Precio</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">Disponible</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">Resv</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">Categoría</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-36">Operaciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {products.map((product) => (
                                        <tr key={product.id_product} className="hover:bg-blue-50/20 transition-all group">
                                            <td className="px-6 py-4">
                                                <div className="w-16 h-16 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 border border-gray-100 transition-transform group-hover:scale-105">
                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt={product.name ?? 'Producto'}
                                                            className="object-contain w-full h-full p-1"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-gray-200" />
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{product.name ?? ''}</div>
                                                <div className="text-[11px] text-gray-400 line-clamp-1 italic">{product.description ?? 'Sin descripción'}</div>
                                            </td>

                                            <td className="px-6 py-4 text-center font-mono text-[11px]">
                                                <span className="bg-gray-50 px-2 py-1 rounded-md text-gray-500 border border-gray-100">
                                                    {product.code ?? '-'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-black text-gray-900">{formatPrice(product.price)}</span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-sm font-black px-2 py-1 rounded-md ${product.disponibility > 10 ? 'text-emerald-600 bg-emerald-50' : (product.disponibility > 0 ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50')}`}>
                                                    {product.disponibility}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm text-gray-400 font-bold">{product.reserved_stock}</span>
                                            </td>

                                            <td className="px-6 py-4 text-center uppercase tracking-tighter">
                                                <span className="inline-flex text-[10px] font-black rounded-lg bg-slate-100 text-slate-500 px-2 py-0.5 border border-slate-200 truncate max-w-full">
                                                    {product.type ?? 'General'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Link
                                                        href={route('admin.products.edit', product.id_product)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
                                                        title="Editar datos"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>

                                                    <button
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
                                                        disabled={isDeleting === product.id_product}
                                                        onClick={() => openDeleteModal(product)}
                                                        title="Eliminar de base de datos"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>

                                                    <div className="h-5 w-px bg-gray-100 mx-1"></div>

                                                    <button
                                                        onClick={() => toggleProductStatus(product.id_product)}
                                                        disabled={isStatusChanging === product.id_product}
                                                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-all ease-in-out duration-200 outline-none ${product.active ? 'bg-emerald-500 shadow-emerald-100' : 'bg-gray-200'}`}
                                                        role="switch"
                                                        aria-checked={product.active}
                                                        title={product.active ? 'Marcar como Inactivo' : 'Marcar como Activo'}
                                                    >
                                                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform ring-0 transition ease-in-out duration-200 ${product.active ? 'translate-x-5' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-5">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center sm:text-left">
                                RESULTADOS: <span className="text-gray-900">{products.length} de {pagination.total}</span>
                                <span className="block sm:inline sm:ml-4 font-black">PÁGINA: <span className="text-blue-600">{pagination.current_page}</span> / {pagination.last_page}</span>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {pagination.current_page > 1 && (
                                    <button
                                        onClick={() => router.get(route('admin.products'), {
                                            page: 1, search: searchTerm, type: typeFilter, availability: availabilityFilter,
                                            min_price: priceRangeFilter.min, max_price: priceRangeFilter.max, active_status: activeStatusFilter
                                        }, { preserveState: true, preserveScroll: true })}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                        title="Primera Página"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}

                                {pagination.current_page > 1 && (
                                    <button
                                        onClick={() => router.get(route('admin.products'), {
                                            page: pagination.current_page - 1, search: searchTerm, type: typeFilter, availability: availabilityFilter,
                                            min_price: priceRangeFilter.min, max_price: priceRangeFilter.max, active_status: activeStatusFilter
                                        }, { preserveState: true, preserveScroll: true })}
                                        className="h-10 px-4 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm uppercase tracking-tighter"
                                    >
                                        Anterior
                                    </button>
                                )}

                                <div className="hidden lg:flex items-center gap-2">
                                    {(() => {
                                        const totalPages = pagination.last_page;
                                        const currentPage = pagination.current_page;
                                        const maxButtons = 5;
                                        let startPage = 1;
                                        let endPage = Math.min(maxButtons, totalPages);

                                        if (currentPage > totalPages - Math.floor(maxButtons / 2)) {
                                            startPage = Math.max(1, totalPages - maxButtons + 1);
                                            endPage = totalPages;
                                        } else if (currentPage > Math.floor(maxButtons / 2)) {
                                            startPage = currentPage - Math.floor(maxButtons / 2);
                                            endPage = startPage + maxButtons - 1;
                                            if (endPage > totalPages) {
                                                endPage = totalPages;
                                                startPage = Math.max(1, endPage - maxButtons + 1);
                                            }
                                        }

                                        return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                                            const pageNum = startPage + i;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => router.get(route('admin.products'), {
                                                        page: pageNum, search: searchTerm, type: typeFilter, availability: availabilityFilter,
                                                        min_price: priceRangeFilter.min, max_price: priceRangeFilter.max, active_status: activeStatusFilter
                                                    }, { preserveState: true, preserveScroll: true })}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-xl border font-black text-xs transition-all shadow-sm ${pageNum === pagination.current_page
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-blue-100'
                                                        : 'border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-100'}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        });
                                    })()}
                                </div>

                                {pagination.current_page < pagination.last_page && (
                                    <button
                                        onClick={() => router.get(route('admin.products'), {
                                            page: pagination.current_page + 1, search: searchTerm, type: typeFilter, availability: availabilityFilter,
                                            min_price: priceRangeFilter.min, max_price: priceRangeFilter.max, active_status: activeStatusFilter
                                        }, { preserveState: true, preserveScroll: true })}
                                        className="h-10 px-4 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm uppercase tracking-tighter"
                                    >
                                        Siguiente
                                    </button>
                                )}

                                {pagination.current_page < pagination.last_page && (
                                    <button
                                        onClick={() => router.get(route('admin.products'), {
                                            page: pagination.last_page, search: searchTerm, type: typeFilter, availability: availabilityFilter,
                                            min_price: priceRangeFilter.min, max_price: priceRangeFilter.max, active_status: activeStatusFilter
                                        }, { preserveState: true, preserveScroll: true })}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                        title="Última Página"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/40 p-4 sm:p-6 transition-all animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-6 mx-auto">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">¿Confirmar Eliminación?</h2>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed text-center">
                            Estás a punto de borrar permanentemente el producto
                            <span className="text-gray-900 font-black"> {productToDelete?.name || productToDelete?.code}</span>.
                            Esta acción <span className="text-rose-600 underline">no se puede revertir</span>.
                        </p>
                        {deleteError && (
                            <div className="mb-6 text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3 font-bold text-center uppercase tracking-wider">{deleteError}</div>
                        )}
                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className={`w-full py-4 rounded-xl text-white flex items-center justify-center font-black shadow-lg shadow-rose-100 transition-all text-xs uppercase tracking-widest cursor-pointer ${isDeleting !== null ? 'bg-rose-400' : 'bg-rose-600 hover:bg-rose-700 active:scale-95'}`}
                                disabled={isDeleting !== null}
                            >
                                {isDeleting !== null ? (
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : 'SÍ, ELIMINAR AHORA'}
                            </button>
                            <button
                                type="button"
                                className="w-full py-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 font-black transition-all text-xs uppercase tracking-widest cursor-pointer"
                                onClick={closeDeleteModal}
                                disabled={isDeleting !== null}
                            >CANCELAR OPERACIÓN</button>
                        </div>
                    </div>
                </div>
            )}

            {showSyncModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/40 p-4 sm:p-6 transition-all animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582M20 20v-5h-.581M9 4h6M9 20h6M5.5 9a7.5 7.5 0 0013 0" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-none mb-1">Stock Reset</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronización Masiva</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium">
                            Esta operación reajustará el stock de todos los productos basándose en el inventario físico actual. Por seguridad, confirma tu identidad.
                        </p>

                        {syncError && <div className="mb-6 text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3 font-black text-center uppercase tracking-widest">{syncError}</div>}
                        {syncSuccess && <div className="mb-6 text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg p-3 font-black text-center uppercase tracking-widest">{syncSuccess}</div>}

                        <div className="mb-8">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1" htmlFor="sync-password">🔐 Contraseña Maestra</label>
                            <input
                                id="sync-password"
                                type="password"
                                className="w-full h-14 px-5 border-2 rounded-2xl border-gray-50 bg-gray-50/50 hover:bg-white hover:border-blue-100 focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-xl tracking-widest placeholder:tracking-normal placeholder:text-gray-200 font-black shadow-inner"
                                placeholder="••••••••"
                                value={syncPassword}
                                onChange={(e) => setSyncPassword(e.target.value)}
                                disabled={syncLoading}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!syncPassword) { setSyncError('🔐 PASSWORD REQUERIDO'); return; }
                                    setSyncError(null); setSyncSuccess(null); setSyncLoading(true);
                                    fetch(route('admin.products.sync-stock'), {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Accept': 'application/json',
                                            'X-Requested-With': 'XMLHttpRequest',
                                            'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                                        },
                                        credentials: 'include',
                                        body: JSON.stringify({ password: syncPassword, json: true })
                                    })
                                        .then(async r => {
                                            let data: Record<string, unknown> | null = null;
                                            try { data = await r.json(); } catch { /* ignore */ }
                                            if (!r.ok || !data?.success) {
                                                setSyncSuccess(null);
                                                setSyncError(String(data?.error || 'SINC FALLIDA'));
                                            } else {
                                                setSyncError(null);
                                                setSyncSuccess(String(data.message || 'ÉXITO TOTAL'));
                                                router.reload({ only: ['products', 'pagination', 'totalOutOfStock'] });
                                            }
                                        })
                                        .catch(() => {
                                            setSyncSuccess(null);
                                            setSyncError('ERROR DE RED');
                                        })
                                        .finally(() => setSyncLoading(false));
                                }}
                                className={`w-full py-4 rounded-2xl text-white flex items-center justify-center font-black shadow-xl shadow-blue-100 transition-all text-xs uppercase tracking-[0.2em] cursor-pointer ${syncLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                                disabled={syncLoading}
                            >
                                {syncLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : 'EJECUTAR SINCRONIZACIÓN'}
                            </button>
                            <button
                                type="button"
                                className="w-full py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-400 font-black transition-all text-xs uppercase tracking-widest cursor-pointer"
                                onClick={() => { if (!syncLoading) setShowSyncModal(false); }}
                                disabled={syncLoading}
                            >ABORTAR</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ProductsAdmin;
