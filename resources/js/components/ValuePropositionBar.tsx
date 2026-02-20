import { Truck, ShieldCheck, Lock, Settings, PhoneCall, CircleHelp, Search, ShoppingCart, CreditCard, DollarSign } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function ValuePropositionBar() {
    const features = [
        {
            icon: <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />,
            iconLg: <Truck className="w-8 h-8 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />,
            title: "Envíos a Todo México",
            description: "Rápidos y seguros"
        },
        {
            icon: <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />,
            iconLg: <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />,
            title: "Garantía de Calidad",
            description: "En partes nuevas y usadas"
        },
        {
            icon: <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />,
            iconLg: <Lock className="w-8 h-8 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />,
            title: "Compra 100% Segura",
            description: "Pagos encriptados"
        },
        {
            icon: <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />,
            iconLg: <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />,
            title: "Envío Gratis",
            description: "A partir de $1,000"
        },
        {
            icon: <CircleHelp className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />,
            iconLg: <CircleHelp className="w-8 h-8 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />,
            title: "¿Cómo Comprar?",
            description: "Guía paso a paso",
            action: "modal"
        },
        {
            icon: <PhoneCall className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />,
            iconLg: <PhoneCall className="w-8 h-8 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />,
            title: "¿Necesitas Ayuda?",
            description: "Contáctanos hoy mismo",
            href: "https://wa.me/527771810370?text=Hola%2C%20necesito%20ayuda%20con%20alguna%20compra%20en%20Refacciones%20El%20Boom"
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!isModalOpen) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % features.length);
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [features.length, isModalOpen]);

    interface Feature {
        icon: React.ReactNode;
        iconLg: React.ReactNode;
        title: string;
        description: string;
        action?: string;
        href?: string;
    }

    // ── Mobile pill card ──────────────────────────────────────────────────────
    const MobileCard = ({ feature }: { feature: Feature }) => (
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl px-5 py-3 shadow-sm mx-auto max-w-xs w-full">
            <div className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
                {feature.icon}
            </div>
            <div className="text-left min-w-0">
                <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight truncate">
                    {feature.title}
                </p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold leading-tight truncate">
                    {feature.description}
                </p>
            </div>
        </div>
    );

    // ── Desktop item ──────────────────────────────────────────────────────────
    const DesktopItem = ({ feature }: { feature: Feature }) => (
        <div className={`flex items-center gap-3 group ${!feature.href && !feature.action ? 'cursor-default' : 'cursor-pointer'}`}>
            <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                {feature.iconLg}
            </div>
            <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
                    {feature.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-tight">
                    {feature.description}
                </p>
            </div>
        </div>
    );

    // ── How-to-buy Modal ──────────────────────────────────────────────────────
    const HowToBuyModal = () => {
        const [activeTab, setActiveTab] = useState<'guest' | 'account'>('guest');

        const guestSteps = [
            { icon: <Search className="w-10 h-10 text-white" />, title: "1. Encuentra", desc: "Busca tus piezas y agrégalas al carrito.", color: "bg-blue-500" },
            { icon: <ShoppingCart className="w-10 h-10 text-white" />, title: "2. Checkout", desc: "Ve al carrito y da clic en continuar.", color: "bg-blue-600" },
            { icon: <ShieldCheck className="w-10 h-10 text-white" />, title: "3. Datos", desc: "Ingresa tu correo y dirección (sin cuenta).", color: "bg-blue-700" },
            { icon: <CreditCard className="w-10 h-10 text-white" />, title: "4. Paga", desc: "Elige tu método de pago y ¡listo!", color: "bg-blue-800" }
        ];

        const accountSteps = [
            { icon: <Lock className="w-10 h-10 text-white" />, title: "1. Regístrate", desc: "Crea tu cuenta en segundos.", color: "bg-indigo-500" },
            { icon: <Settings className="w-10 h-10 text-white" />, title: "2. Perfil", desc: "Guarda tus direcciones favoritas.", color: "bg-indigo-600" },
            { icon: <ShoppingCart className="w-10 h-10 text-white" />, title: "3. Express", desc: "Compra recurrente en un clic.", color: "bg-indigo-800" }
        ];

        const steps = activeTab === 'guest' ? guestSteps : accountSteps;
        // Columnas dinámicas: 4 para invitado, 3 para cuenta
        const gridCols = steps.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';

        return (
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-center text-blue-900 dark:text-blue-100 mb-2 uppercase tracking-tighter">
                        ¿Cómo comprar en Refaccionaria El Boom?
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600 dark:text-gray-300 font-medium">
                        Elige tu modalidad preferida y adquiere tus refacciones hoy mismo.
                    </DialogDescription>
                </DialogHeader>

                {/* Tab switcher */}
                <div className="flex justify-center mt-4 mb-8">
                    <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <button
                            onClick={() => setActiveTab('guest')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'guest' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Comprar como Invitado
                        </button>
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'account' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Comprar con Cuenta
                        </button>
                    </div>
                </div>

                {/* Steps grid — centered for any count */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`grid grid-cols-1 ${gridCols} gap-6 py-4 justify-items-center`}
                    >
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center relative group w-full max-w-[160px]">
                                {/* Connector line between items (desktop only, not after last) */}
                                {idx < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-10" />
                                )}
                                <div className={`${step.color} p-4 rounded-[1.25rem] shadow-xl mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                    {step.icon}
                                </div>
                                <h3 className="font-black text-sm uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-2">{step.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed px-2">{step.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-900/50">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center font-bold">
                        {activeTab === 'guest'
                            ? "¡No necesitas registrarte! Al finalizar te pediremos correo y nombre para tu pedido."
                            : "Guarda tus datos para compras más rápidas."}
                    </p>
                </div>
            </DialogContent>
        );
    };

    // ── Render wrapper for each feature item ──────────────────────────────────
    const renderMobile = (feature: Feature) => {
        if (feature.action === 'modal') {
            return (
                <Dialog onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <button className="w-full flex justify-center">
                            <MobileCard feature={feature} />
                        </button>
                    </DialogTrigger>
                    <HowToBuyModal />
                </Dialog>
            );
        }
        if (feature.href) {
            return (
                <a href={feature.href} target="_blank" rel="noopener noreferrer" className="flex justify-center w-full">
                    <MobileCard feature={feature} />
                </a>
            );
        }
        return <div className="flex justify-center w-full"><MobileCard feature={feature} /></div>;
    };

    const renderDesktop = (feature: Feature) => {
        if (feature.action === 'modal') {
            return (
                <Dialog onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <div className="w-full cursor-pointer">
                            <DesktopItem feature={feature} />
                        </div>
                    </DialogTrigger>
                    <HowToBuyModal />
                </Dialog>
            );
        }
        if (feature.href) {
            return (
                <a href={feature.href} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity w-full">
                    <DesktopItem feature={feature} />
                </a>
            );
        }
        return <div className="w-full"><DesktopItem feature={feature} /></div>;
    };

    return (
        <section className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="container mx-auto px-4 py-4 lg:py-6">

                {/* ── Mobile: animated pill carousel ── */}
                <div className="block lg:hidden">
                    <div className="relative h-[60px] flex items-center justify-center overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.25 }}
                                className="absolute w-full flex justify-center px-4"
                            >
                                {renderMobile(features[currentIndex])}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Dot indicators */}
                    <div className="flex justify-center gap-2 mt-3">
                        {features.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'bg-blue-600 w-5'
                                    : 'bg-gray-300 dark:bg-gray-600 w-1.5'
                                    }`}
                                aria-label={`Slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* ── Desktop: 6-column grid ── */}
                <div className="hidden lg:grid lg:grid-cols-6 gap-0">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-start px-4 py-1 ${index !== features.length - 1
                                ? 'border-r border-gray-200 dark:border-gray-700'
                                : ''
                                }`}
                        >
                            {renderDesktop(feature)}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
