import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { BookOpen, Search, Plus, Trash2, Edit, ExternalLink, XCircle } from 'lucide-react';

interface Catalog {
    id_catalog: number;
    title: string;
    image: string;
    alt: string;
    url: string | null;
    active: boolean;
    order: number;
}

interface Props {
    catalogs: Catalog[];
    filters?: {
        search?: string;
    };
}

const CatalogAdmin: React.FC<Props> = ({ catalogs: initialCatalogs, filters = {} }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [items, setItems] = useState(initialCatalogs);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [catalogToDelete, setCatalogToDelete] = useState<Catalog | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.catalogs.index'), {
            search: searchTerm
        }, {
            preserveState: true,
            replace: true
        });
    }

    const openDeleteModal = (catalog: Catalog) => {
        setCatalogToDelete(catalog);
        setShowDeleteModal(true);
    }

    const closeDeleteModal = () => {
        setCatalogToDelete(null);
        setShowDeleteModal(false);
    }

    const handleConfirmDelete = () => {
        if (catalogToDelete) {
            setIsDeleting(catalogToDelete.id_catalog);
            router.delete(route('admin.catalogs.destroy', catalogToDelete.id_catalog), {
                onSuccess: () => {
                    closeDeleteModal();
                    setIsDeleting(null);
                },
                onError: () => {
                    setIsDeleting(null);
                },
            });
        }
    };

    const handleToggleStatus = (id: number) => {
        setItems(currentItems =>
            currentItems.map(item =>
                item.id_catalog === id
                    ? { ...item, active: !item.active }
                    : item
            )
        );

        router.put(route('admin.catalogs.toggle-active', id), {}, {
            preserveState: true,
            onError: () => {
                setItems(currentItems =>
                    currentItems.map(item =>
                        item.id_catalog === id
                            ? { ...item, active: !item.active }
                            : item
                    )
                );
            }
        });
    };

    return (
        <AdminLayout title="Gestión de Catálogos">
            <Head title="Gestión de Catálogos" />

            <div className="container mx-auto p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-100">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black font-title">Gestión de Catálogos</h1>
                    </div>

                    <Link
                        href={route('admin.catalogs.create')}
                        className="w-full sm:w-auto h-11 px-6 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-black shadow-md shadow-sky-100 transition-all text-sm flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Nuevo Catálogo</span>
                    </Link>
                </div>

                {/* Filtro */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-slate-800">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <label htmlFor="search" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Búsqueda de Catálogos</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por título del catálogo..."
                                    className="w-full h-11 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-sky-500 focus:ring-sky-500 pl-10 text-sm placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 sm:flex-none h-11 px-8 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-black transition-all text-sm uppercase tracking-widest"
                            >
                                Buscar
                            </button>
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        router.get(route('admin.catalogs.index'));
                                    }}
                                    className="h-11 w-11 flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tabla */}
                {items.length === 0 ? (
                    <div className="bg-white p-16 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-100">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 text-lg font-medium">No se encontraron catálogos registrados</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-[800px] w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-20">ID</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Información</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">Vista Previa</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-28">Estado</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">Orden</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-36">Operaciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {items.map((catalog) => (
                                        <tr key={catalog.id_catalog} className="hover:bg-sky-50/20 transition-all group">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-gray-900">#{catalog.id_catalog}</span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-gray-900 leading-tight uppercase mb-1">{catalog.title}</div>
                                                {catalog.url ? (
                                                    <a href={catalog.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 hover:text-sky-800 transition-colors">
                                                        <ExternalLink className="w-3 h-3" /> VER PDF DEL CATÁLOGO
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-gray-300">SIN ENLACE ADJUNTO</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <div className="w-24 h-14 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden group-hover:scale-105 transition-transform">
                                                        <img src={catalog.image} alt={catalog.alt} className="w-full h-full object-cover" />
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-2 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider border ${catalog.active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                    {catalog.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-black text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-100">{catalog.order}</span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Link
                                                        href={route('admin.catalogs.edit', catalog.id_catalog)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>

                                                    <button
                                                        onClick={() => openDeleteModal(catalog)}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
                                                        title="Eliminar"
                                                        disabled={isDeleting === catalog.id_catalog}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>

                                                    <div className="h-5 w-px bg-gray-100 mx-1"></div>

                                                    <button
                                                        onClick={() => handleToggleStatus(catalog.id_catalog)}
                                                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-all ease-in-out duration-200 outline-none ${catalog.active ? 'bg-emerald-500 shadow-emerald-100' : 'bg-gray-200'}`}
                                                        role="switch"
                                                        aria-checked={catalog.active}
                                                        title={catalog.active ? 'Desactivar' : 'Activar'}
                                                    >
                                                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform ring-0 transition ease-in-out duration-200 ${catalog.active ? 'translate-x-5' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Eliminación */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/40 p-4 transition-all animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-6 mx-auto">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">¿Eliminar Catálogo?</h2>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed text-center font-medium">
                            Estás a punto de borrar permanentemente el catálogo
                            <span className="text-gray-900 font-black"> "{catalogToDelete?.title}"</span>.
                            Esta acción no se puede deshacer.
                        </p>

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
                            >CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default CatalogAdmin;