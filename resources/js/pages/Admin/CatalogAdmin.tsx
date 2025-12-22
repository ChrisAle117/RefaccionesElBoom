import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

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

    const handleDelete = (id: number) => {
        const catalog = items.find(item => item.id_catalog === id);
        if (catalog) {
            openDeleteModal(catalog);
        }
    }
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
        <AdminLayout>
            <Head title="Gestión de Catálogos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between mb-6">
                                <h1 className="text-2xl font-semibold text-gray-900">Gestión de Catálogos</h1>
                                <div className="flex space-x-2">
                                    <Link
                                        href={route('admin.catalogs.create')}
                                        className="px-4 py-2 bg-[#006CFA] text-white rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        Nuevo Catálogo
                                    </Link>
                                </div>
                            </div>

            
                            <form onSubmit={handleSearch} className="mb-6">
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar por título..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#006CFA] text-white rounded-md hover:bg-indigo-700"
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
                                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>
                            </form>

                            <div className="flex flex-col">
                                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                                                        <th scope="col" className="relative px-6 py-3">
                                                            <span className="sr-only">Actions</span>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {items.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                                                No se encontraron catálogos
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        items.map((catalog) => (
                                                            <tr key={catalog.id_catalog} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{catalog.id_catalog}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{catalog.title}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    <img src={catalog.image} alt={catalog.alt} className="h-16 w-auto" />
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${catalog.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                        {catalog.active ? 'Activo' : 'Inactivo'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {catalog.url ? (
                                                                        <a href={catalog.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                                                            Ver catálogo
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-gray-400">Sin URL</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {catalog.order}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    <div className="flex justify-center space-x-1 items-center">
                                                                        {/* Botón de editar */}
                                                                        <Link href={route('admin.catalogs.edit', catalog.id_catalog)}>
                                                                            <button className="p-1 cursor-pointer border border-blue-200 rounded-md hover:bg-blue-50 w-7 h-7 flex items-center justify-center">
                                                                                <svg className="w-15 h-15 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                </svg>
                                                                            </button>
                                                                        </Link>

                                                                        <button
                                                                            className="p-1 cursor-pointer border border-red-200 rounded-md hover:bg-red-50 w-7 h-7 flex items-center justify-center"
                                                                            disabled={isDeleting === catalog.id_catalog}
                                                                            onClick={() => handleDelete(catalog.id_catalog)}
                                                                        >
                                                                            <svg className="w-15 h-15 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                        </button>

                                                                        <div className="flex flex-col items-center justify-center">
                                                                            <label htmlFor={`toggle-${catalog.id_catalog}`} className="flex flex-col items-center cursor-pointer">
                                                                                <div className="relative">
                                                                                    <input
                                                                                        id={`toggle-${catalog.id_catalog}`}
                                                                                        type="checkbox"
                                                                                        className="sr-only"
                                                                                        checked={catalog.active}
                                                                                        onChange={() => handleToggleStatus(catalog.id_catalog)}
                                                                                    />
                                                                                    <div className={`block w-9 h-5 rounded-full transition ${catalog.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                                                    <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 ${catalog.active ? 'transform translate-x-4' : ''}`}></div>
                                                                                </div>
                                                                                <span className="mt-1 text-xs text-gray-600 text-center">
                                                                                    {catalog.active ? 'Activo' : 'Inactivo'}
                                                                                </span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Eliminar catálogo
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                ¿Estás seguro de que deseas eliminar el catálogo "{catalogToDelete?.title}"? Esta acción no se puede deshacer.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting !== null}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    {isDeleting !== null ? 'Eliminando...' : 'Eliminar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    disabled={isDeleting !== null}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default CatalogAdmin;