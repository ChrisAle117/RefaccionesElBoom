import React, { useState, useEffect } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

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
                const errorMsg = (errors as Record<string, any>).message || 'Error desconocido al eliminar el producto';
                setDeleteError(errorMsg);
                // console.error('Error al eliminar producto:', errors);
            }
        });
    };

    /*
    const confirmDelete = (id: number) => {
        const p = products.find(x => x.id_product === id);
        if (p) openDeleteModal(p);
    };
    */

    const toggleProductStatus = (id: number) => {
        // Llamada directa al backend para alternar el estado
        setIsStatusChanging(id);
        router.put(route('admin.products.toggle-status', id), {}, {
            preserveScroll: true,
            onSuccess: () => setIsStatusChanging(null),
            onError: (_errors) => {
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
        <AdminLayout>
            <Head title="Gestión de productos" />

            <div className="container mx-auto p-4">
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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Catálogo de productos</h1>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => { setShowSyncModal(true); setSyncPassword(''); setSyncError(null); setSyncSuccess(null); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center cursor-pointer shadow"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M9 4h6M9 20h6M5.5 9a7.5 7.5 0 0013 0" />
                            </svg>
                            Actualizar existencias
                        </button>
                        <Link href={route('admin.products.create')}>
                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center cursor-pointer">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Nuevo producto
                            </button>
                        </Link>
                        <Link href={route('admin.products.incidences')} className="flex">
                            <button
                                type="button"
                                className="relative bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center cursor-pointer shadow disabled:opacity-60"
                                disabled={incidenceLoading}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
                                </svg>
                                Incidencias
                                {incidenceCount !== null && (
                                    <span className={`ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold ${incidenceCount > 0 ? 'bg-white text-red-600' : 'bg-white/70 text-red-500'}`}>
                                        {incidenceLoading ? '…' : incidenceCount}
                                    </span>
                                )}
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* Búsqueda y tipo */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar por nombre o código</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="search"
                                        placeholder="Buscar por nombre o código de producto"
                                        className="w-full h-10 rounded-sm border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Ingresa el nombre o el código del producto para buscarlo</p>
                            </div>
                            <div className="w-full md:w-64">
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select
                                    id="type"
                                    className="w-full h-10 cursor-pointer rounded-sm border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    value={typeFilter}
                                    onChange={(e) => handleTypeFilter(e.target.value)}
                                >
                                    <option value="">Todos los tipos</option>
                                    {types.map((type, index) => (
                                        <option key={index} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>


                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-1/3">
                                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">Existencia</label>
                                <select
                                    id="availability"
                                    className="w-full h-10 cursor-pointer rounded-sm border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    value={availabilityFilter}
                                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                                >
                                    <option value="all">Todos los productos</option>
                                    <option value="in_stock">En existencia</option>
                                    <option value="low_stock">Baja existencia (Menor que 10)</option>
                                    <option value="out_of_stock">Sin existencia</option>
                                    <option value="high_stock">Alta existencia (≥ 20)</option>
                                </select>
                            </div>
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rango de precio</label>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        placeholder="Mínimo"
                                        className="w-full h-10 rounded-sm border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={priceRangeFilter.min}
                                        onChange={(e) => setPriceRangeFilter(prev => ({ ...prev, min: e.target.value }))}
                                        min="0"
                                    />
                                    <span className="mx-2">-</span>
                                    <input
                                        type="number"
                                        placeholder="Máximo"
                                        className="w-full h-10 rounded-sm border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={priceRangeFilter.max}
                                        onChange={(e) => setPriceRangeFilter(prev => ({ ...prev, max: e.target.value }))}
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-1/3">
                                <label htmlFor="active_status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    id="active_status"
                                    className="w-full h-10 cursor-pointer rounded-sm border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    value={activeStatusFilter}
                                    onChange={(e) => setActiveStatusFilter(e.target.value)}
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="active">Activos</option>
                                    <option value="inactive">Inactivos</option>
                                </select>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex justify-between space-x-2">
                            <div className="flex items-center">
                                <a
                                    href="/admin/products/out-of-stock-report"
                                    target="_blank"
                                    className="h-10 px-4 bg-[#006CFA] text-white rounded-md hover:bg-[#FBCC13] hover:text-black cursor-pointer flex items-center"
                                    rel="noopener noreferrer"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Reportes de artículos sin stock
                                </a>
                                <span className="text-red-600 font-medium ml-2">
                                    Artículos sin stock: {totalOutOfStock}
                                </span>
                            </div>

                            <div className="flex justify-end space-x-2">
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
                                    className="h-10 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer"
                                >
                                    Limpiar filtros
                                </button>
                                <button
                                    type="submit"
                                    className="h-10 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Aplicar filtros
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Lista */}
                {products.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <p className="text-gray-500 text-lg">No se encontraron productos con los filtros seleccionados.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="w-full">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="w-15 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                                        <th className="w-15 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th className="w-15 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                        <th className="w-15 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                        <th className="w-15 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible</th>
                                        <th className="w-15 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reservado</th>
                                        <th className="w-15 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                        <th className="w-15 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.id_product} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="w-15 h-15 flex items-center justify-center overflow-hidden rounded-md border border-gray-200">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name ?? 'Producto'} className="object-contain w-full h-full" />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-xs text-center">
                                                            Sin imagen
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-900 truncate">{product.name ?? ''}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1">{product.description ?? ''}</div>
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <span className="text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis block">{product.code ?? ''}</span>
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <span className="text-sm text-gray-900">{formatPrice(product.price)}</span>
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-sm ${product.disponibility > 10 ? 'text-green-600' : (product.disponibility > 0 ? 'text-amber-600' : 'text-red-600')}`}>
                                                    {product.disponibility}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <span className="text-sm text-gray-600">{product.reserved_stock}</span>
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <span className="px-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 truncate max-w-full">
                                                    {product.type ?? ''}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center space-x-1 items-center">
                                                    <Link href={route('admin.products.edit', product.id_product)}>
                                                        <button className="p-1 cursor-pointer border border-blue-200 rounded-md hover:bg-blue-50 w-7 h-7 flex items-center justify-center">
                                                            <svg className="w-15 h-15 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                    </Link>

                                                    <button
                                                        className="p-1 cursor-pointer border border-red-200 rounded-md hover:bg-red-50 w-7 h-7 flex items-center justify-center"
                                                        disabled={isDeleting === product.id_product}
                                                        onClick={() => openDeleteModal(product)}
                                                    >
                                                        <svg className="w-15 h-15 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>

                                                    <div className="flex flex-col items-center justify-center">
                                                        <label htmlFor={`toggle-${product.id_product}`} className="flex flex-col items-center cursor-pointer">
                                                            <div className="relative">
                                                                <input
                                                                    id={`toggle-${product.id_product}`}
                                                                    type="checkbox"
                                                                    className="sr-only"
                                                                    checked={product.active}
                                                                    disabled={isStatusChanging === product.id_product}
                                                                    onChange={() => toggleProductStatus(product.id_product)}
                                                                />
                                                                <div className={`block w-9 h-5 rounded-full transition ${product.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                                <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 ${product.active ? 'transform translate-x-4' : ''}`}></div>
                                                            </div>
                                                            <span className="mt-1 text-xs text-gray-600 text-center">
                                                                {product.active ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Mostrando {products.length} de {pagination.total} resultados
                                    <span className="sm:ml-3 text-gray-500 font-light">Página {pagination.current_page} de {pagination.last_page}</span>
                                </div>
                                <div className="flex space-x-1">
                                    {pagination.current_page > 1 && (
                                        <button
                                            onClick={() => router.get(route('admin.products'), {
                                                page: 1, search: searchTerm, type: typeFilter, availability: availabilityFilter,
                                                min_price: priceRangeFilter.min, max_price: priceRangeFilter.max, active_status: activeStatusFilter
                                            }, { preserveState: true, preserveScroll: true })}
                                            className="px-2 py-1 rounded border border-gray-300 text-sm cursor-pointer flex items-center justify-center"
                                            title="Primera página"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                            </svg>
                                        </button>
                                    )}

                                    {pagination.current_page > 1 && (
                                        <button
                                            onClick={() => router.get(route('admin.products'), {
                                                page: pagination.current_page - 1, search: searchTerm, type: typeFilter, availability: availabilityFilter,
                                                min_price: priceRangeFilter.min, max_price: priceRangeFilter.max, active_status: activeStatusFilter
                                            }, { preserveState: true, preserveScroll: true })}
                                            className="px-3 py-1 rounded border border-gray-300 text-sm cursor-pointer"
                                        >
                                            Anterior
                                        </button>
                                    )}

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
                                                    className={`px-3 py-1 rounded border cursor-pointer ${pageNum === pagination.current_page
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'border-gray-300 text-gray-700'}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        });
                                    })()}

                                    {pagination.current_page < pagination.last_page && (
                                        <button
                                            onClick={() => router.get(route('admin.products'), {
                                                page: pagination.current_page + 1, search: searchTerm, type: typeFilter, availability: availabilityFilter,
                                                min_price: priceRangeFilter.min, max_price: priceRangeFilter.max, active_status: activeStatusFilter
                                            }, { preserveState: true, preserveScroll: true })}
                                            className="px-3 py-1 rounded border border-gray-300 text-sm cursor-pointer"
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
                                            className="px-2 py-1 rounded border border-gray-300 text-sm cursor-pointer flex items-center justify-center"
                                            title="Última página"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-200">
                        <h2 className="text-xl font-semibold mb-2">Eliminar producto</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            ¿Seguro que deseas eliminar el producto
                            {productToDelete ? (
                                <>
                                    {' '}<strong>{productToDelete.name || productToDelete.code}</strong>{' '}
                                </>
                            ) : null}
                            ? Esta acción no se puede deshacer.
                        </p>
                        {deleteError && (
                            <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{deleteError}</div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 cursor-pointer"
                                onClick={closeDeleteModal}
                                disabled={isDeleting !== null}
                            >Cancelar</button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className={`px-4 py-2 rounded text-white flex items-center font-medium cursor-pointer shadow ${isDeleting !== null ? 'bg-red-600/60' : 'bg-red-600 hover:bg-red-700'}`}
                                disabled={isDeleting !== null}
                            >
                                {isDeleting !== null && (
                                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                                )}
                                Eliminar
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                            aria-label="Cerrar"
                            disabled={isDeleting !== null}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
            {showSyncModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-200">
                        <h2 className="text-xl font-semibold mb-2">Confirmar actualización de existencias</h2>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">Esta acción sincronizará las existencias desde el almacén para <strong>todos los productos activos</strong>. Ingresa tu contraseña para continuar.</p>
                        {syncError && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{syncError}</div>}
                        {syncSuccess && <div className="mb-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2">{syncSuccess}</div>}
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sync-password">Contraseña</label>
                        <input
                            id="sync-password"
                            type="password"
                            className="w-full h-10 px-3 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                            placeholder="Ingresa tu contraseña"
                            value={syncPassword}
                            onChange={(e) => setSyncPassword(e.target.value)}
                            disabled={syncLoading}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 cursor-pointer"
                                onClick={() => { if (!syncLoading) setShowSyncModal(false); }}
                                disabled={syncLoading}
                            >Cancelar</button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!syncPassword) { setSyncError('Ingresa tu contraseña'); return; }
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
                                                setSyncError(String(data?.error || 'Error al sincronizar'));
                                            } else {
                                                setSyncError(null);
                                                setSyncSuccess(String(data.message || 'Existencias sincronizadas correctamente'));
                                                router.reload({ only: ['products', 'pagination', 'totalOutOfStock'] });
                                            }
                                        })
                                        .catch(() => {
                                            setSyncSuccess(null);
                                            setSyncError('Error de red');
                                        })
                                        .finally(() => setSyncLoading(false));
                                }}
                                className={`px-4 py-2 rounded text-white flex items-center font-medium cursor-pointer shadow ${syncLoading ? 'bg-blue-600/60' : 'bg-blue-600 hover:bg-blue-700'}`}
                                disabled={syncLoading}
                            >
                                {syncLoading && <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                                Confirmar
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => { if (!syncLoading) setShowSyncModal(false); }}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                            aria-label="Cerrar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ProductsAdmin;

