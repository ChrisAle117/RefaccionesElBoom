import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

interface CatalogFormProps {
    catalog?: {
        id_catalog: number;
        title: string;
        image: string;
        alt: string;
        url: string | null;
        active: boolean;
        order: number;
    };
    isEdit?: boolean;
}

const CatalogForm: React.FC<CatalogFormProps> = ({ catalog, isEdit = false }) => {
    const { data, setData, post, errors, processing } = useForm({
        _method: isEdit ? 'PUT' : 'POST',
        title: catalog?.title || '',
        alt: catalog?.alt || '',
        url: catalog?.url || '',
        image: catalog?.image || '', 
        active: catalog?.active ?? true,
        order: catalog?.order || 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEdit && catalog) {
            post(route('admin.catalogs.update', catalog.id_catalog));
        } else {
            post(route('admin.catalogs.store'));
        }
    };

    return (
        <AdminLayout>
            <Head title={isEdit ? "Editar Catálogo" : "Crear Catálogo"} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    {isEdit ? `Editar Catálogo: ${catalog?.title}` : 'Crear Nuevo Catálogo'}
                                </h1>
                                <Link
                                    href={route('admin.catalogs.index')}
                                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                                >
                                    Volver al listado
                                </Link>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                            Título
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="alt" className="block text-sm font-medium text-gray-700">
                                            Texto alternativo (ALT)
                                        </label>
                                        <input
                                            type="text"
                                            id="alt"
                                            value={data.alt}
                                            onChange={(e) => setData('alt', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                        {errors.alt && <p className="mt-1 text-sm text-red-600">{errors.alt}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                                            URL del catálogo (opcional)
                                        </label>
                                        <input
                                            type="url"
                                            id="url"
                                            value={data.url}
                                            onChange={(e) => setData('url', e.target.value)}
                                            placeholder="https://drive.google.com/file/..."
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="active" className="block text-sm font-medium text-gray-700">
                                            Estado
                                        </label>
                                        <select
                                            id="active"
                                            value={data.active ? "1" : "0"}
                                            onChange={(e) => setData('active', e.target.value === "1")}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="1">Activo</option>
                                            <option value="0">Inactivo</option>
                                        </select>
                                        {errors.active && <p className="mt-1 text-sm text-red-600">{errors.active}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                            <strong>Carátula</strong>
                                            <span className="ml-1">URL de la imagen del catálogo {isEdit ? '(o deja la actual)' : '(requerido)'} </span>
                                        </label>
                                        <input
                                            type="url"
                                            id="image"
                                            value={data.image}
                                            onChange={(e) => setData('image', e.target.value)}
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required={!isEdit}
                                        />
                                        {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                                    </div>

                                    {isEdit && (
                                        <div>
                                            <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                                                Orden
                                            </label>
                                            <input
                                                type="number"
                                                id="order"
                                                value={data.order}
                                                min="0"
                                                onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                            {errors.order && <p className="mt-1 text-sm text-red-600">{errors.order}</p>}
                                        </div>
                                    )}
                                </div>

                                {data.image && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700">
                                            Vista previa de la imagen:
                                        </p>
                                        <img
                                            src={data.image}
                                            alt="Vista previa"
                                            className="mt-2 h-40 w-auto"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Imagen+no+disponible';
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {processing 
                                            ? isEdit ? 'Guardando...' : 'Creando...' 
                                            : isEdit ? 'Guardar cambios' : 'Crear catálogo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CatalogForm;