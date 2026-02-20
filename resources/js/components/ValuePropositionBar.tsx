import { Truck, ShieldCheck, Lock, Settings, PhoneCall, CircleHelp, Search, ShoppingCart, CreditCard, Package } from 'lucide-react';
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
            icon: <Truck className="w-8 h-8 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />,
            title: "Envíos a Todo México",
            description: "Rápidos y seguros"
        },
        {
            icon: <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />,
            title: "Garantía de Calidad",
            description: "En partes nuevas y usadas"
        },
        {
            icon: <Lock className="w-8 h-8 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />,
            title: "Compra 100% Segura",
            description: "Pagos encriptados"
        },
        {
            icon: <Settings className="w-8 h-8 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />,
            title: "Especialistas en Tractopartes",
            description: "Gran inventario disponible"
        },
        {
            icon: <CircleHelp className="w-8 h-8 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />,
            title: "¿Cómo Comprar?",
            description: "Guía paso a paso",
            action: "modal"
        },
        {
            icon: <PhoneCall className="w-8 h-8 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />,
            title: "¿Necesitas Ayuda?",
            description: "Contáctanos hoy mismo",
            href: "https://wa.me/527771810370?text=Hola%2C%20necesito%20ayuda%20con%20Refacciones%20El%20Boom"
        }
    ];

    // State for mobile carousel
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Auto-advance carousel
    useEffect(() => {
        if (!isModalOpen) {
            const timer = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length);
            }, 3000); // Change every 3 seconds

            return () => clearInterval(timer);
        }
    }, [features.length, isModalOpen]);

    interface Feature {
        icon: React.ReactNode;
        title: string;
        description: string;
        action?: string;
        href?: string;
    }

    const FeatureContent = ({ feature, isMobile = false }: { feature: Feature, isMobile?: boolean }) => (
        <div className={`flex items-center gap-4 group ${!feature.href && !feature.action ? 'cursor-default' : 'cursor-pointer'} ${isMobile ? 'justify-center w-full' : ''}`}>
            <div className={`p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                {feature.icon}
            </div>
            <div className={`text-left ${isMobile ? 'text-center text-left' : ''}`}>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
                    {feature.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-tight">
                    {feature.description}
                </p>
            </div>
        </div>
    );

    const HowToBuyModal = () => {
        const [activeTab, setActiveTab] = useState<'guest' | 'account'>('guest');

        const guestSteps = [
            { icon: <Search className="w-10 h-10 text-white" />, title: "1. Encuentra", desc: "Busca tus piezas y agrégalas al carrito.", color: "bg-blue-500" },
            { icon: <ShoppingCart className="w-10 h-10 text-white" />, title: "2. Checkout", desc: "Ve al carrito y da clic en continuar.", color: "bg-blue-600" },
            { icon: <ShieldCheck className="w-10 h-10 text-white" />, title: "3. Datos", desc: "Ingresa tu correo y dirección (Sin cuenta).", color: "bg-blue-700" },
            { icon: <CreditCard className="w-10 h-10 text-white" />, title: "4. Paga", desc: "Elige tu método de pago y ¡Listo!", color: "bg-blue-800" }
        ];

        const accountSteps = [
            { icon: <Lock className="w-10 h-10 text-white" />, title: "1. Regístrate", desc: "Crea tu cuenta en segundos.", color: "bg-indigo-500" },
            { icon: <Settings className="w-10 h-10 text-white" />, title: "2. Perfil", desc: "Guarda tus direcciones favoritas.", color: "bg-indigo-600" },
            { icon: <ShoppingCart className="w-10 h-10 text-white" />, title: "3. Express", desc: "Compra recurrente en un clic.", color: "bg-indigo-800" }
        ];

        const steps = activeTab === 'guest' ? guestSteps : accountSteps;

        return (
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-center text-blue-900 dark:text-blue-100 mb-2 uppercase tracking-tighter">
                        ¿Cómo comprar en Refaccionaria El Boom?
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600 dark:text-gray-300 font-medium">
                        Elige tu modalidad preferida y adquiere tus refacciones hoy mismo.
                    </DialogDescription>
                </DialogHeader>

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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-4">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center relative group">
                            {/* Connector Line (Desktop only) */}
                            {idx < 3 && (
                                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-10" />
                            )}
                            <div className={`${step.color} p-4 rounded-[1.25rem] shadow-xl mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                {step.icon}
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-2">{step.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed px-2">{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-900/50">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center font-bold">
                        {activeTab === 'guest'
                            ? "¡No necesitas registrarte! Al finalizar te pediremos correo y nombre para tu pedido."
                            : "Guarda tus datos para compras más rápidas."}
                    </p>
                </div>
            </DialogContent>
        );
    };

    const renderFeatureItem = (feature: Feature, isMobile = false) => {
        if (feature.action === 'modal') {
            return (
                <Dialog onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <div className="w-full">
                            <FeatureContent feature={feature} isMobile={isMobile} />
                        </div>
                    </DialogTrigger>
                    <HowToBuyModal />
                </Dialog>
            );
        }

        if (feature.href) {
            return (
                <a
                    href={feature.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity w-full"
                >
                    <FeatureContent feature={feature} isMobile={isMobile} />
                </a>
            );
        }

        return (
            <div className="w-full">
                <FeatureContent feature={feature} isMobile={isMobile} />
            </div>
        );
    };

    return (
        <section className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="container mx-auto px-4 py-6 lg:py-8">

                {/* Mobile View: Animated Carousel with Dots */}
                <div className="block lg:hidden">
                    <div className="relative h-16 flex items-center justify-center overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="absolute w-full flex justify-center"
                            >
                                {renderFeatureItem(features[currentIndex], true)}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Dots Indicators */}
                    <div className="flex justify-center gap-2 mt-4">
                        {features.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'bg-blue-600 w-4'
                                    : 'bg-gray-300 dark:bg-gray-700'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop View: Grid Layout 6 Columns */}
                <div className="hidden lg:grid lg:grid-cols-6 gap-0">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`
                                flex items-center justify-start px-4 
                                ${index !== features.length - 1 ? 'border-r border-gray-200 dark:border-gray-700' : ''}
                            `}
                        >
                            {renderFeatureItem(feature)}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
