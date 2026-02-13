import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import {
    User,
    MapPin,
    Mail,
    Phone,
    Package,
    MessageSquare,
    ArrowLeft,
    Clock,
    Send,
    ShieldCheck
} from 'lucide-react';

interface Note {
    id: number;
    content: string;
    created_at: string;
    admin: {
        name: string;
    };
}

interface Order {
    id_order: number;
    total_amount: number;
    status: string;
    created_at: string;
}

interface Address {
    calle: string;
    numero_exterior: string;
    colonia: string;
    ciudad: string;
    estado: string;
    codigo_postal: string;
}

interface UserDetailProps {
    client: {
        id: number;
        name: string;
        email: string;
        telefono: string;
        role: string;
        created_at: string;
        address: Address | null;
        orders: Order[];
        notes: Note[];
    };
}

const UserDetail: React.FC<UserDetailProps> = ({ client }) => {
    const { data, setData, post, processing, reset, errors } = useForm({
        content: ''
    });

    const submitNote = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.notes.store', { id: client.id }), {
            onSuccess: () => reset('content'),
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
    };

    return (
        <AdminLayout title={`Perfil: ${client.name}`}>
            <Head title={`Cliente ${client.name} - Admin`} />

            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                {/* Header Navigation */}
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href={route('admin.users.index')}
                        className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black font-title text-gray-900 tracking-tight uppercase">Expediente de Cliente</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: #{client.id}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Activo desde {new Date(client.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Basic Info & Address */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <User className="w-24 h-24" />
                            </div>

                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                                    <User className="w-10 h-10" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase mb-4 leading-tight">{client.name}</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold">{client.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold">{client.telefono || 'Sin teléfono'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase bg-gray-100 px-2 py-0.5 rounded-full">{client.role}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Address Card */}
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Dirección Registrada
                            </h3>

                            {client.address ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-black text-gray-900 uppercase">{client.address.calle} {client.address.numero_exterior}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase">{client.address.colonia}, CP {client.address.codigo_postal}</p>
                                    <p className="text-xs font-black text-gray-600 uppercase">{client.address.ciudad}, {client.address.estado}</p>
                                </div>
                            ) : (
                                <p className="text-xs font-bold text-gray-300 italic uppercase">El cliente aún no ha registrado una dirección.</p>
                            )}
                        </section>

                        {/* Order Stats */}
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -mr-16 -mt-16 blur-3xl" />
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 relative z-10">Métricas de Compra</h3>
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div>
                                    <p className="text-[10px] font-black text-blue-500 uppercase mb-1">Total Pedidos</p>
                                    <p className="text-2xl font-black text-gray-900">{client.orders.length}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Volumen Compra</p>
                                    <p className="text-2xl font-black text-gray-900">{formatPrice(client.orders.reduce((sum, o) => sum + Number(o.total_amount), 0))}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Notes & History */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Internal Notes CRM System */}
                        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Historial de Interacciones</h3>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                {client.notes.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                        <MessageSquare className="w-12 h-12 mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No hay notas de seguimiento</p>
                                    </div>
                                ) : (
                                    client.notes.map((note) => (
                                        <div key={note.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-white border border-gray-200 rounded-md flex items-center justify-center text-gray-400">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-900 uppercase">{note.admin?.name || 'Sistema'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(note.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-600 font-medium leading-relaxed">{note.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-50 bg-white">
                                <form onSubmit={submitNote} className="relative">
                                    <input
                                        type="text"
                                        value={data.content}
                                        onChange={e => setData('content', e.target.value)}
                                        placeholder="Escribe una actualización para el historial..."
                                        className="w-full pl-6 pr-14 py-3 bg-gray-50 border border-transparent rounded-2xl text-xs focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                                        disabled={processing}
                                    />
                                    <button
                                        type="submit"
                                        disabled={processing || data.content.length < 5}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 disabled:opacity-30 disabled:hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                                {errors.content && <p className="text-[9px] text-red-500 mt-1 ml-4 font-bold uppercase">{errors.content}</p>}
                            </div>
                        </section>

                        {/* Recent Activity / Order History */}
                        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                                <Package className="w-5 h-5 text-gray-400" />
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Historial de Pedidos Realizados</h3>
                            </div>

                            {client.orders.length === 0 ? (
                                <div className="p-12 text-center opacity-20">
                                    <p className="text-[10px] font-black uppercase tracking-widest">Sin historial de órdenes</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50">
                                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase">Orden</th>
                                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase">Fecha</th>
                                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase text-center">Estado</th>
                                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {client.orders.map((order) => (
                                                <tr key={order.id_order} className="hover:bg-gray-50/50 transition-all">
                                                    <td className="px-6 py-4 text-xs font-black text-gray-900 uppercase">#{order.id_order}</td>
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center">
                                                            <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase border border-emerald-100">
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-black text-gray-900 text-right">{formatPrice(order.total_amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default UserDetail;
