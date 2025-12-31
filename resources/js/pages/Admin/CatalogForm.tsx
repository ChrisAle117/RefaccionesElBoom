import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { BookOpen, Save, X, Image as ImageIcon, Link as LinkIcon, Hash, ArrowLeft } from 'lucide-react';

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
        <AdminLayout title={isEdit ? "Editar Catálogo" : "Nuevo Catálogo"}>
            <Head title={isEdit ? "Editar Catálogo" : "Nuevo Catálogo"} />

            <div className="container mx-auto p-2 sm:p-4 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                            <BookOpen className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black font-title text-gray-900 leading-none">
                                {isEdit ? 'Editar Catálogo' : 'Nuevo Catálogo'}
                            </h1>
                            <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5">Módulo de Publicaciones</p>
                        </div>
                    </div>

                    <Link
                        href={route('admin.catalogs.index')}
                        className="h-11 w-11 flex items-center justify-center bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-gray-900 hover:shadow-md transition-all"
                    >
                        <X className="w-6 h-6" />
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Información Principal */}
                        <div className="lg:col-span-2 space-y-6">
                            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">TÍTULO DEL CATÁLOGO</label>
                                        <input
                                            type="text"
                                            className={`w-full h-14 px-5 border-2 rounded-2xl bg-gray-50/50 hover:bg-white hover:border-indigo-100 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all text-sm font-black shadow-inner ${errors.title ? 'border-red-200 bg-red-50' : 'border-gray-50'}`}
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Ej: Catálogo Tractores"
                                            required
                                        />
                                        {errors.title && <p className="text-red-500 text-[10px] font-black mt-2 uppercase px-1">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">TEXTO ALTERNATIVO</label>
                                        <input
                                            type="text"
                                            className={`w-full h-12 px-5 border-2 rounded-xl bg-gray-50/50 hover:bg-white hover:border-indigo-100 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all text-sm font-medium ${errors.alt ? 'border-red-200 bg-red-50' : 'border-gray-50'}`}
                                            value={data.alt}
                                            onChange={(e) => setData('alt', e.target.value)}
                                            placeholder="Ej: Portada de catálogo de faros led para tractocamión"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ENLACE DE IMAGEN</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="url"
                                                className="w-full h-12 pl-12 pr-5 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all text-sm font-medium"
                                                value={data.url}
                                                onChange={(e) => setData('url', e.target.value)}
                                                placeholder="https://www.refaccioneselboom.com/images/..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Configuración Lateral */}
                        <div className="space-y-6">
                            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 relative group overflow-hidden">
                                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <ImageIcon className="w-3 h-3" /> CARÁTULA
                                </h3>

                                <div className="space-y-4">
                                    <div className="aspect-[3/4] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative shadow-inner">
                                        {data.image ? (
                                            <img
                                                src={data.image}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = 'https://via.placeholder.com/400x600?text=Imagen+No+Válida';
                                                }}
                                            />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ImageIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Sin Portada</p>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        type="url"
                                        className="w-full h-10 px-4 border-2 border-gray-50 rounded-xl bg-gray-50 text-[10px] font-bold focus:bg-white transition-all uppercase tracking-tighter"
                                        placeholder="URL de la imagen de portada..."
                                        value={data.image}
                                        onChange={(e) => setData('image', e.target.value)}
                                        required={!isEdit}
                                    />
                                </div>
                                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-50 rounded-full opacity-30 group-hover:scale-125 transition-transform" />
                            </section>

                            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <Hash className="w-3 h-3" /> CONFIGURACIÓN
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ORDEN DE APARICIÓN</label>
                                        <input
                                            type="number"
                                            className="w-full h-12 px-4 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all text-sm font-black"
                                            value={data.order}
                                            min="0"
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ESTADO VISIBLE</label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setData('active', !data.active)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${data.active ? 'bg-indigo-600 shadow-indigo-100 shadow-lg' : 'bg-gray-200'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {data.active ? 'CATÁLOGO PUBLICADO' : 'BORRADOR / OCULTO'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:flex-1 h-16 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:bg-indigo-400"
                        >
                            <Save className={`${processing ? 'animate-pulse' : ''} w-5 h-5`} />
                            {processing ? 'PROCESANDO...' : (isEdit ? 'GUARDAR CAMBIOS' : 'PUBLICAR CATÁLOGO')}
                        </button>

                        <Link
                            href={route('admin.catalogs.index')}
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

export default CatalogForm;