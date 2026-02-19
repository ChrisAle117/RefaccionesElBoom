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

    const HowToBuyModal = () => (
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center text-blue-900 dark:text-blue-100 mb-2">¿Cómo comprar en Refaccionaria El Boom?</DialogTitle>
                <DialogDescription className="text-center text-gray-600 dark:text-gray-300">
                    Sigue estos 4 sencillos pasos para adquirir tus refacciones.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8">
                {[
                    { icon: <Search className="w-10 h-10 text-white" />, title: "1. Encuentra", desc: "Explora y agrega productos sin registrarte.", color: "bg-blue-500" },
                    { icon: <ShoppingCart className="w-10 h-10 text-white" />, title: "2. Revisa", desc: "Verifica tu carrito de compras.", color: "bg-blue-600" },
                    { icon: <CreditCard className="w-10 h-10 text-white" />, title: "3. Paga", desc: "Ingresa tus datos de envío y pago seguro.", color: "bg-blue-700" },
                    { icon: <Package className="w-10 h-10 text-white" />, title: "4. Recibe", desc: "¡Listo! Enviamos a tu domicilio.", color: "bg-blue-800" }
                ].map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center relative group">
                        {/* Connector Line (Desktop only) */}
                        {idx < 3 && (
                            <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10" />
                        )}
                        <div className={`${step.color} p-4 rounded-full shadow-lg mb-4 transform transition-transform group-hover:scale-110`}>
                            {step.icon}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{step.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 px-2">{step.desc}</p>
                    </div>
                ))}
            </div>
        </DialogContent>
    );

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
