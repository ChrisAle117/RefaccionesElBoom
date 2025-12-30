import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Users, Search, Plus, Trash2, Edit, Copy, XCircle, Briefcase, MapPin, Building2 } from 'lucide-react';

interface Vacancy {
    id: number;
    title: string;
    department: string;
    location: string;
    description: string;
    requirements: string[];
    benefits: string[];
    contact_email: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

interface VacanciesProps {
    vacancies: Vacancy[];
    filters: {
        search?: string;
        department?: string;
    };
    departments: string[];
}

const VacanciesAdmin: React.FC<VacanciesProps> = ({ vacancies, filters, departments }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [departmentFilter, setDepartmentFilter] = useState(filters.department || '');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [vacancyToDelete, setVacancyToDelete] = useState<Vacancy | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.vacancies.index'), {
            search: searchTerm,
            department: departmentFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleDepartmentFilter = (department: string) => {
        setDepartmentFilter(department);
        router.get(route('admin.vacancies.index'), {
            search: searchTerm,
            department
        }, {
            preserveState: true,
            replace: true
        });
    };

    const openDeleteModal = (vacancy: Vacancy) => {
        setVacancyToDelete(vacancy);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setVacancyToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (!vacancyToDelete) return;

        const id = vacancyToDelete.id;
        setIsDeleting(id);

        router.delete(route('admin.vacancies.destroy', id), {
            onSuccess: () => {
                setIsDeleting(null);
                closeDeleteModal();
            },
            onError: () => {
                setIsDeleting(null);
            }
        });
    };

    const toggleVacancyStatus = (id: number, currentStatus: boolean) => {
        router.put(route('admin.vacancies.toggle-status', id), {
            active: !currentStatus
        }, {
            preserveState: true
        });
    };

    const duplicateVacancy = (id: number) => {
        router.post(route('admin.vacancies.duplicate', id), {}, {
            preserveScroll: true
        });
    };

    return (
        <AdminLayout title="Bolsa de Trabajo">
            <Head title="Gestión de Vacantes" />

            <div className="container mx-auto p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-100">
                            <Users className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black font-title">Gestión de Vacantes</h1>
                    </div>

                    <Link
                        href={route('admin.vacancies.create')}
                        className="w-full sm:w-auto h-11 px-6 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-black shadow-md shadow-amber-100 transition-all text-sm flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Nueva Vacante</span>
                    </Link>
                </div>

                {/* Filtros */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-slate-800 transition-all">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 relative">
                            <label htmlFor="search" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Buscar vacante</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Título de la vacante, puesto o ubicación..."
                                    className="w-full h-11 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 pl-10 text-sm placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="department" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Por Departamento</label>
                            <div className="relative">
                                <select
                                    id="department"
                                    className="w-full h-11 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 pl-10 text-sm appearance-none flex items-center"
                                    value={departmentFilter}
                                    onChange={(e) => handleDepartmentFilter(e.target.value)}
                                >
                                    <option value="">Todos los departamentos</option>
                                    {departments.map((dept, idx) => (
                                        <option key={idx} value={dept}>{dept}</option>
                                    ))}
                                </select>
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        <div className="md:col-span-3 flex flex-col sm:flex-row gap-2 pt-2">
                            <button type="submit" className="flex-1 h-11 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-black transition-all text-sm uppercase tracking-widest">
                                Aplicar Filtros
                            </button>
                            {(searchTerm || departmentFilter) && (
                                <button
                                    type="button"
                                    onClick={() => { setSearchTerm(''); setDepartmentFilter(''); router.get(route('admin.vacancies.index')); }}
                                    className="flex-1 sm:flex-none h-11 px-6 bg-gray-50 text-gray-400 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Limpiar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tabla */}
                {vacancies.length === 0 ? (
                    <div className="bg-white p-16 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-100">
                        <Briefcase className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 text-lg font-medium">No se encontraron vacantes registradas</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-[900px] w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Información de la Vacante</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-48">Ubicación</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">Estado</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-56">Operaciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {vacancies.map((vacancy) => (
                                        <tr key={vacancy.id} className="hover:bg-amber-50/10 transition-all group">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-gray-900 leading-tight uppercase mb-1">{vacancy.title}</div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-tight">{vacancy.department}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">PUBLICADO EL {new Date(vacancy.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    {vacancy.location}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-2 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider border ${vacancy.active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                    {vacancy.active ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Link
                                                        href={route('admin.vacancies.edit', vacancy.id)}
                                                        className="h-9 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all border border-blue-100 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" /> Editar
                                                    </Link>

                                                    <button
                                                        onClick={() => duplicateVacancy(vacancy.id)}
                                                        className="h-9 px-3 bg-gray-50 text-gray-600 hover:bg-gray-200 rounded-lg transition-all border border-gray-200 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5"
                                                        title="Duplicar"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => openDeleteModal(vacancy)}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
                                                        title="Eliminar"
                                                        disabled={isDeleting === vacancy.id}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>

                                                    <div className="h-5 w-px bg-gray-100 mx-1"></div>

                                                    <button
                                                        onClick={() => toggleVacancyStatus(vacancy.id, vacancy.active)}
                                                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-all ease-in-out duration-200 outline-none ${vacancy.active ? 'bg-emerald-500 shadow-emerald-100' : 'bg-gray-200'}`}
                                                        role="switch"
                                                        aria-checked={vacancy.active}
                                                        title={vacancy.active ? 'Desactivar' : 'Activar'}
                                                    >
                                                        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform ring-0 transition ease-in-out duration-200 ${vacancy.active ? 'translate-x-5' : 'translate-x-0'}`} />
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
            {showDeleteModal && vacancyToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/40 p-4 transition-all animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-6 mx-auto shadow-inner">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">¿Eliminar Vacante?</h2>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed text-center font-medium">
                            Estás a punto de borrar la vacante
                            <span className="text-gray-900 font-black"> "{vacancyToDelete.title}"</span>.
                            Esta operación es irreversible.
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
                                ) : 'SÍ, BORRAR DEFINITIVAMENTE'}
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

export default VacanciesAdmin;
