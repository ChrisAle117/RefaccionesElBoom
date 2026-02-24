import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import {
    TrendingUp,
    Users,
    MapPin,
    Package,
    ArrowLeft,
    DollarSign,
    ShoppingCart,
    Award
} from 'lucide-react';

interface Stats {
    total_revenue: number;
    total_orders: number;
    total_users: number;
    avg_order_value: number;
}

interface TopCustomer {
    id: number;
    name: string;
    orders_count: number;
    orders_sum_total_amount: number;
}

interface SaleByState {
    estado: string;
    total_sales: number;
    order_count: number;
}

interface TopProduct {
    product_name: string;
    total_quantity: number;
    total_revenue: number;
}

interface TopCartProduct {
    product_name: string;
    total_quantity: number;
}

interface MonthlySales {
    month: string;
    total: number;
}

interface ReportingAdminProps {
    stats: Stats;
    topCustomers: TopCustomer[];
    salesByState: SaleByState[];
    topProducts: TopProduct[];
    topCartProducts: TopCartProduct[];
    salesTrend: MonthlySales[];
    inventoryInsight: string;
}

const ReportingAdmin: React.FC<ReportingAdminProps> = ({ stats, topCustomers, salesByState, topProducts, topCartProducts, inventoryInsight }) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price || 0);
    };

    // Calculate max values for bar representations
    const maxSalesByState = Math.max(...salesByState.map(s => Number(s.total_sales)), 1);
    const maxProductRevenue = Math.max(...topProducts.map(p => Number(p.total_revenue)), 1);

    return (
        <AdminLayout title="Análisis Estratégico">
            <Head title="Reportes de Negocio - Admin" />

            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black font-title text-gray-900 uppercase tracking-tight">Centro de Inteligencia</h1>
                        </div>
                        <p className="text-gray-400 font-medium text-sm sm:text-base">Análisis de rendimiento, retención de clientes y geografía de ventas.</p>
                    </div>

                    <Link
                        href={route('admin.dashboard')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-400 hover:text-gray-900 transition-all uppercase"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
                    </Link>
                </div>

                {/* Top Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Ingresos Totales', value: formatPrice(stats.total_revenue), icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
                        { label: 'Pedidos Totales', value: stats.total_orders, icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-50' },
                        { label: 'Base de Usuarios', value: stats.total_users, icon: Users, color: 'text-violet-600', bgColor: 'bg-violet-50' },
                        { label: 'Ticket Promedio', value: formatPrice(stats.avg_order_value), icon: Award, color: 'text-amber-600', bgColor: 'bg-amber-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className={`${stat.bgColor} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Customers (CRM Focus) */}
                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                            <div className="flex items-center gap-3">
                                <Award className="w-5 h-5 text-amber-500" />
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Principales Clientes por Fidelidad</h3>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {topCustomers.map((customer, i) => (
                                <div key={customer.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-black text-gray-300 w-4">#{i + 1}</span>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 uppercase group-hover:text-amber-600 transition-colors">{customer.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{customer.orders_count} pedidos realizados</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-900">{formatPrice(customer.orders_sum_total_amount)}</p>
                                        {customer.id ? (
                                            <Link href={route('admin.users.show', { id: customer.id })} className="text-[9px] font-black text-blue-500 uppercase hover:underline">Ver Perfil</Link>
                                        ) : (
                                            <span className="text-[9px] font-black text-gray-400 uppercase">Invitado</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Sales by Geography (Geografía de Ventas) */}
                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                            <MapPin className="w-5 h-5 text-rose-500" />
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ventas por Estado (MX)</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {salesByState.map((state) => (
                                <div key={state.estado}>
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="text-xs font-black text-gray-900 uppercase">{state.estado}</p>
                                        <p className="text-xs font-black text-gray-900">{formatPrice(state.total_sales)} <span className="text-[10px] text-gray-400 font-bold ml-1">({state.order_count})</span></p>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-1000"
                                            style={{ width: `${(Number(state.total_sales) / maxSalesByState) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Top Selling Products */}
                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                            <Package className="w-5 h-5 text-blue-500" />
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rendimiento de Productos Estrella</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                {topProducts.map((product) => (
                                    <div key={product.product_name}>
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-[10px] font-black text-gray-900 uppercase truncate max-w-[200px]">{product.product_name}</p>
                                            <p className="text-xs font-black text-blue-600">{formatPrice(product.total_revenue)}</p>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-1000"
                                                style={{ width: `${(Number(product.total_revenue) / maxProductRevenue) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-blue-50/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-blue-100/50 relative overflow-hidden">
                                <TrendingUp className="w-8 h-8 text-blue-500 mb-4 opacity-30" />
                                <h4 className="text-[10px] font-black text-gray-400 uppercase mb-8 tracking-[0.2em] relative z-10">Distribución de Ingresos</h4>

                                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                        {/* Background Circle */}
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />

                                        {(() => {
                                            let cumulativePercent = 0;
                                            const colors = ['#3b82f6', '#60a5fa', '#93c5fd'];
                                            return (topProducts || []).slice(0, 3).map((product, idx) => {
                                                const share = stats.total_revenue > 0 ? (product.total_revenue / stats.total_revenue) : 0;
                                                const startPercent = cumulativePercent;
                                                cumulativePercent += share;

                                                // 2 * PI * R (approx 251.2 for R=40)
                                                const dashArray = `${share * 251.2} 251.2`;
                                                const dashOffset = `-${startPercent * 251.2}`;

                                                return (
                                                    <circle
                                                        key={idx}
                                                        cx="50" cy="50" r="40"
                                                        fill="transparent"
                                                        stroke={colors[idx]}
                                                        strokeWidth="20"
                                                        strokeDasharray={dashArray}
                                                        strokeDashoffset={dashOffset}
                                                        className="transition-all duration-1000 ease-out"
                                                    />
                                                );
                                            });
                                        })()}
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-full w-24 h-24 m-auto shadow-inner">
                                        <p className="text-xl font-black text-slate-900 leading-none">
                                            {stats.total_revenue > 0 && topProducts.length > 0 ? Math.round((topProducts[0].total_revenue / stats.total_revenue) * 100) : 0}%
                                        </p>
                                        <p className="text-[7px] font-black text-blue-500 uppercase mt-1">Líder</p>
                                    </div>
                                </div>

                                <div className="space-y-3 w-full max-w-[200px] z-10">
                                    {(topProducts || []).slice(0, 3).map((p, i) => {
                                        const colors = ['bg-blue-500', 'bg-blue-400', 'bg-blue-300'];
                                        return (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${colors[i]} flex-shrink-0`} />
                                                <p className="text-[9px] font-black text-gray-500 uppercase truncate flex-1 text-left">{p.product_name}</p>
                                                <p className="text-[9px] font-black text-slate-900">
                                                    {stats.total_revenue > 0 ? Math.round((p.total_revenue / stats.total_revenue) * 100) : 0}%
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 pt-6 border-t border-blue-100/50 w-full">
                                    <p className="text-[9px] text-gray-400 leading-relaxed font-bold uppercase tracking-tight">
                                        {inventoryInsight}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Final Row: Expanded Cart Insights */}
                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="w-5 h-5 text-purple-500" />
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interés y Tendencias en Carrito</h3>
                            </div>
                            <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase">Artículos</span>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {(topCartProducts || []).slice(0, 10).map((p, idx) => (
                                <div key={idx} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-300 group-hover:bg-purple-50 group-hover:text-purple-400 transition-colors">
                                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-gray-900 uppercase truncate group-hover:text-purple-700 transition-colors">{p.product_name}</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{p.total_quantity} unidades pendientes en carritos activos</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 min-w-[60px]">
                                        <span className="text-[10px] font-black text-purple-600">
                                            {Math.round((p.total_quantity / (topCartProducts[0]?.total_quantity || 1)) * 100)}%
                                        </span>
                                        <div className="h-1 w-full bg-purple-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${(p.total_quantity / (topCartProducts[0]?.total_quantity || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ReportingAdmin;
