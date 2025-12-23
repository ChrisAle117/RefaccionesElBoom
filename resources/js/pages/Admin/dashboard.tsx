import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

const Dashboard: React.FC = () => {
    return (
        <AdminLayout title="Panel de Administrador">
            <Head title="Panel de administrador" />

            {/* Fondo general suave en claro y oscuro */}
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
                {/* Contenedor central con fondo blanco / gris oscuro */}
                <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                    <div className="p-6 text-gray-900 dark:text-gray-100">
                        <h1 className="text-2xl font-bold mb-6">Gestión de datos</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Comprobantes */}
                            <div className="bg-blue-100 dark:bg-blue-800 p-6 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-2">Comprobantes pendientes</h2>
                                <p className="mb-4">
                                    Revisa y aprueba los comprobantes de pago subidos por los clientes.
                                </p>
                                <a
                                    href={route('admin.payment-proofs.pending')}
                                    className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-medium"
                                >
                                    Ver comprobantes →
                                </a>
                            </div>

                            {/* Órdenes */}
                            <div className="bg-green-100 dark:bg-green-800 p-6 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-2">Órdenes</h2>
                                <p className="mb-4">
                                    Gestiona las órdenes de los clientes y su estado de procesamiento.
                                </p>
                                <a
                                    href={route('admin.orders')}
                                    className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 font-medium"
                                >
                                    Ver órdenes →
                                </a>
                            </div>

                            {/* Productos */}
                            <div className="bg-purple-100 dark:bg-purple-800 p-6 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-2">Productos</h2>
                                <p className="mb-4">
                                    Administra el catálogo de productos de la tienda.
                                </p>
                                <a
                                    href={route('admin.products')}
                                    className="text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 font-medium"
                                >
                                    Gestionar productos →
                                </a>
                            </div>

                            {/* Orden de tipos */}
                            <div className="bg-indigo-100 dark:bg-indigo-800 p-6 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-2">Orden de tipos</h2>
                                <p className="mb-4">
                                    Define el orden en que se muestran los productos por tipo.
                                </p>
                                <a
                                    href={route('admin.product-types.order')}
                                    className="text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 font-medium"
                                >
                                    Configurar orden →
                                </a>
                            </div>

                            {/* Familias */}
                            <div className="bg-cyan-100 dark:bg-cyan-800 p-6 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-2">Familias</h2>
                                <p className="mb-4">
                                    Administra las agrupaciones de variantes del mismo producto (colores) por tipo y base.
                                </p>
                                <a
                                    href={route('admin.product-families.index')}
                                    className="text-cyan-700 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-cyan-100 font-medium"
                                >
                                    Gestionar familias →
                                </a>
                            </div>

                            {/* Incidencias */}
                            <div className="bg-rose-100 dark:bg-rose-800 p-6 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-2">Incidencias</h2>
                                <p className="mb-4">
                                    Revisa diferencias de existencias (sobreventas) detectadas.
                                </p>
                                <a
                                    href={route('admin.products.incidences')}
                                    className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 font-medium"
                                >
                                    Ver incidencias →
                                </a>
                            </div>

                            {/* Vacantes */}
                            <div className="bg-yellow-100 dark:bg-yellow-800 p-6 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-2">Vacantes</h2>
                                <p className="mb-4">
                                    Administra las vacantes disponibles en la sección de Bolsa de trabajo.
                                </p>
                                <a
                                    href={route('admin.vacancies.index')}
                                    className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 font-medium"
                                >
                                    Gestionar vacantes →
                                </a>
                            </div>

                            {/* Catálogos */}
                            <div className="bg-red-100 dark:bg-red-800 p-6 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-2">Catálogos</h2>
                                <p className="mb-4">
                                    Administra los catálogos mostrados en la página principal.
                                </p>
                                <a
                                    href={route('admin.catalogs.index')}
                                    className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 font-medium"
                                >
                                    Gestionar catálogos →
                                </a>
                            </div>

                            {/* Recolecciones DHL */}
                            <div className="bg-yellow-100 dark:bg-sky-800 p-6 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-2">Recolecciones DHL</h2>
                                <p className="mb-4">
                                    Consulta recolecciones programadas y datos clave de la recolección.
                                </p>
                                <a
                                    href={route('admin.dhl-pickups.index')}
                                    className="text-yellow-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100 font-medium"
                                >
                                    Ver recolecciones →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
