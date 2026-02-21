import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardList, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GuestOrderLookup() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        order_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('orders.guest.process'));
    };

    return (
        <AppLayout>
            <Head title="Rastrear Pedido | Refaccionaria El Boom" />

            <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                    <div className="bg-[#FBCC13] dark:bg-yellow-500 py-6 px-8 text-center">
                        <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                            <ClipboardList className="w-6 h-6 text-slate-900" />
                        </div>
                        <h1 className="text-xl font-black text-slate-900 uppercase">Rastrear mi pedido</h1>
                        <p className="text-sm text-slate-800 font-medium">Consulta el estado de tu compra como invitado</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Correo electrónico
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="rounded-xl border-gray-200 dark:border-gray-600 focus:ring-[#FBCC13] focus:border-[#FBCC13]"
                                required
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="order_id" className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4" /> Número de orden
                            </Label>
                            <Input
                                id="order_id"
                                type="text"
                                placeholder="Ej: 1234"
                                value={data.order_id}
                                onChange={e => setData('order_id', e.target.value)}
                                className="rounded-xl border-gray-200 dark:border-gray-600 focus:ring-[#FBCC13] focus:border-[#FBCC13]"
                                required
                            />
                            {errors.order_id && <p className="text-red-500 text-xs mt-1">{errors.order_id}</p>}
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-[#FBCC13] hover:bg-yellow-500 text-slate-900 font-black rounded-xl py-6 text-lg transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-3"
                        >
                            {processing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Buscar pedido
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>

                        <div className="text-center pt-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                ¿No tienes cuenta?{' '}
                                <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                    Regístrate aquí
                                </Link>
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AppLayout>
    );
}
