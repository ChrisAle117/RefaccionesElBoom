import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Phone } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    // Limitar input de teléfono a solo números
    const handlePhoneChange = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 15);
        setData('phone', digits);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Crear una cuenta" description="Ingresa tus datos para crear una cuenta">
            <Head title="Registrarse | Refaccionaria El Boom" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">

                    {/* Nombre */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Juan Pérez"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="correo@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Teléfono */}
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Teléfono (10 dígitos)</Label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                <Phone className="w-4 h-4" />
                            </span>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                tabIndex={3}
                                autoComplete="tel"
                                value={data.phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                disabled={processing}
                                placeholder="7771234567"
                                className="pl-9"
                                inputMode="numeric"
                                maxLength={15}
                            />
                        </div>
                        <InputError message={errors.phone} />
                    </div>

                    {/* Contraseña */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Contraseña"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirmar contraseña */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={5}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirmar contraseña"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    {/* Botón de registro */}
                    <Button
                        type="submit"
                        className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg transition-all duration-200"
                        tabIndex={6}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        Crear cuenta
                    </Button>

                    {/* División */}
                    <div className="relative flex items-center gap-3">
                        <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                        <span className="text-xs text-gray-400 uppercase tracking-wider">o continúa con</span>
                        <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                    </div>

                    {/* Botón Google */}
                    <a
                        href="/auth/google"
                        className="flex items-center justify-center gap-3 w-full border border-gray-300 dark:border-gray-600 rounded-md py-2.5 px-4 font-semibold text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        tabIndex={7}
                    >
                        {/* SVG oficial de Google */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continuar con Google
                    </a>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Ya cuentas con una?{' '}
                    <TextLink href={route('login')} tabIndex={8}>
                        Inicia sesión
                    </TextLink>
                </div>
                <div>
                    <Label htmlFor="remember" className='ml-2 justify-text:center'>Al registrarme <strong>Acepto</strong> <span className='font-bold underline text-[#006CFA] cursor-pointer'> Terminos y condiciones</span> y también el <span className='font-bold underline text-[#006CFA] cursor-pointer '>Aviso legal</span></Label>
                </div>
            </form>
        </AuthLayout>
    );
}
