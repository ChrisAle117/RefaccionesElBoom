import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import {
    Users,
    Search,
    ChevronRight,
    Mail,
    Phone,
    Calendar,
    Filter
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    telefono: string;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface UsersAdminProps {
    users: {
        data: User[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
}

const UsersAdmin: React.FC<UsersAdminProps> = ({ users }) => {
    return (
        <AdminLayout title="Clientes">
            <Head title="Gestión de Clientes - Admin" />

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                <Users className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black font-title text-gray-900 uppercase tracking-tight">Directorio de Clientes</h1>
                        </div>
                        <p className="text-gray-400 font-medium text-sm sm:text-base">Gestiona la base central de usuarios y consulta sus perfiles.</p>
                    </div>

                    <div className="flex w-full sm:w-auto gap-2">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                            />
                        </div>
                        <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>



                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contacto</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registro</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <Users className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No se encontraron clientes</p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-emerald-50/30 transition-all group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-black text-xs">
                                                        {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 leading-none mb-1 group-hover:text-emerald-700 transition-colors uppercase">{user.name}</p>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">ID: #{user.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-medium">{user.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-medium">{user.telefono || 'No registrado'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={route('admin.users.show', { id: user.id })}
                                                    className="inline-flex items-center justify-center p-2 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Simple Pagination */}
                {users.last_page > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        {users.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${link.active
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                                    : 'bg-white border border-gray-100 text-gray-400 hover:border-emerald-200 hover:text-emerald-600'
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default UsersAdmin;
