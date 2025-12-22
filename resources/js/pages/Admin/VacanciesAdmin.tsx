import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

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

    // Función para manejar la búsqueda
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

    // Función para manejar el filtro de departamento
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

    // Abrir modal de confirmación para eliminar
    const openDeleteModal = (vacancy: Vacancy) => {
        setVacancyToDelete(vacancy);
        setShowDeleteModal(true);
    };

    // Cerrar modal de confirmación
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setVacancyToDelete(null);
    };

    // Función para confirmar y ejecutar la eliminación
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

    // Función para cambiar el estado activo/inactivo de una vacante
    const toggleVacancyStatus = (id: number, currentStatus: boolean) => {
        router.put(route('admin.vacancies.toggle-status', id), {
            active: !currentStatus
        }, {
            preserveState: true
        });
    };

    // Duplicar una vacante
    const duplicateVacancy = (id: number) => {
        router.post(route('admin.vacancies.duplicate', id), {}, {
            preserveScroll: true
        });
    };

    return (
        <AdminLayout>
            <Head title="Gestión de Vacantes" />

            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Gestión de vacantes</h1>
                    <Link href={route('admin.vacancies.create')}>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center cursor-pointer">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Nueva vacante
                        </button>
                    </Link>
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                            <input
                                type="text"
                                id="search"
                                placeholder="Buscar por título o ubicación"
                                className="w-full h-10 ml-5 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                            <select
                                id="department"
                                className="w-full h-10 cursor-pointer rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                value={departmentFilter}
                                onChange={(e) => handleDepartmentFilter(e.target.value)}
                            >
                                <option value="">Todos los departamentos</option>
                                {departments.map((department, index) => (
                                    <option key={index} value={department}>{department}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="h-10 px-4 bg-[#006CFA] cursor-pointer text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Filtrar
                            </button>
                        </div>
                    </form>
                </div>

                {/* Lista de vacantes */}
                {vacancies.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <p className="text-gray-500 text-lg">No se encontraron vacantes con los filtros seleccionados.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {vacancies.map((vacancy) => (
                                        <tr key={vacancy.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{vacancy.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{vacancy.department}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{vacancy.location}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {/* Toggle de estado activo/inactivo */}
                                                <div className="flex justify-center">
                                                    <label className="flex items-center cursor-pointer">
                                                        <div className="relative">
                                                            <input
                                                                id={`toggle-${vacancy.id}`}
                                                                type="checkbox"
                                                                className="sr-only"
                                                                checked={vacancy.active}
                                                                onChange={() => toggleVacancyStatus(vacancy.id, vacancy.active)}
                                                            />
                                                            <div className={`block w-10 h-6 rounded-full ${vacancy.active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                                                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${vacancy.active ? 'transform translate-x-4' : ''}`}></div>
                                                        </div>
                                                        <span className="ml-3 text-sm text-gray-700">{vacancy.active ? 'Activa' : 'Inactiva'}</span>
                                                    </label>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                            <div className="flex justify-center space-x-2">
                                                <Link href={route('admin.vacancies.edit', vacancy.id)}>
                                                    <button className="text-indigo-600 hover:text-indigo-900 mr-2 cursor-pointer">
                                                        Editar
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => duplicateVacancy(vacancy.id)}
                                                    className="text-blue-600 hover:text-blue-900 mr-2 cursor-pointer"
                                                >
                                                    Duplicar
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(vacancy)}
                                                    className="text-red-600 hover:text-red-900 cursor-pointer"
                                                >
                                                    Eliminar
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

                {/* Modal de confirmación de eliminación */}
                {showDeleteModal && vacancyToDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
                            <div className="bg-red-50 p-4 border-b border-red-100">
                                <h3 className="text-lg font-bold text-red-700 flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Confirmar eliminación
                                </h3>
                            </div>

                            <div className="p-6">
                                <p className="mb-4 text-gray-700">
                                    ¿Estás seguro de que deseas eliminar la vacante <span className="font-semibold">{vacancyToDelete.title}</span>?
                                </p>
                                <p className="mb-6 text-gray-700">
                                    Esta acción no se puede deshacer.
                                </p>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={closeDeleteModal}
                                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center cursor-pointer"
                                        disabled={isDeleting !== null}
                                    >
                                        {isDeleting === vacancyToDelete.id ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Eliminando...
                                            </>
                                        ) : (
                                            'Eliminar vacante'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default VacanciesAdmin;
