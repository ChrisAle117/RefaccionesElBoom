import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle, ExternalLink } from 'lucide-react';

export default function Support() {
    // Información de contacto y soporte
    const supportInfo = {
        phone: '+52 (777)-180-7312',
        email: 'soporte-ecom@refaccioneselboom.com',
        hours: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
        whatsapp: '+52 (777)-180-7312',
    };

    const contactMethods = [
        {
            title: 'Llámanos',
            value: supportInfo.phone,
            icon: Phone,
            color: 'bg-blue-600',
            href: `tel:${supportInfo.phone.replace(/[^0-9+]/g, '')}`,
            label: 'Marcar ahora'
        },
        {
            title: 'WhatsApp',
            value: supportInfo.whatsapp,
            icon: MessageCircle,
            color: 'bg-[#25D366]',
            href: `https://wa.me/527771807312`,
            label: 'Enviar mensaje'
        },
        {
            title: 'Correo',
            value: supportInfo.email,
            icon: Mail,
            color: 'bg-red-500',
            href: `mailto:${supportInfo.email}`,
            label: 'Escribir email'
        },
        {
            title: 'Horario',
            value: supportInfo.hours,
            icon: Clock,
            color: 'bg-purple-600',
            href: '#',
            label: 'Atención Clientes'
        }
    ];

    /*
    const faqs = [
        {
            question: '¿Cómo puedo realizar un seguimiento de mi pedido?',
            answer: 'Para realizar un seguimiento de tu pedido, ingresa a tu cuenta y ve a la sección "Mis Pedidos". Allí encontrarás toda la información sobre el estado y ubicación de tu pedido.'
        },
        {
            question: '¿Cuál es el tiempo de entrega estándar?',
            answer: 'El tiempo de entrega estándar es de 3 a 5 días hábiles, dependiendo de tu ubicación. Para zonas metropolitanas puede ser de 1 a 2 días.'
        },
        {
            question: '¿Cómo puedo solicitar una devolución?',
            answer: 'Para solicitar una devolución, contacta a nuestro equipo de soporte por teléfono o correo electrónico con tu número de pedido. Tienes hasta 14 días después de recibir tu producto para iniciar este proceso.'
        },
        {
            question: '¿Ofrecen garantía en los productos?',
            answer: 'Sí, todos nuestros productos cuentan con garantía. El período varía según el tipo de producto, desde 30 días hasta 1 año.'
        },
    ];
    */

    // Animaciones para los elementos que aparecen
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-yellow-500 uppercase bg-yellow-500/10 rounded-full border border-yellow-500/20"
                >
                    ESTAMOS PARA AYUDARTE
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter"
                >
                    CENTRO DE <span
                        className="text-yellow-500"
                        style={{ textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}
                    >SOPORTE</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 dark:text-gray-400 mt-6 text-xl max-w-2xl mx-auto leading-relaxed"
                >
                    Nuestro equipo está listo para brindarte <span className="font-bold text-gray-900 dark:text-white">asistencia técnica y personalizada</span> en cada paso.
                </motion.p>
            </div>

            {/* Redesigned Contact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {contactMethods.map((method, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -10 }}
                        className="group bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 relative overflow-hidden flex flex-col items-center text-center"
                    >
                        <div className={`w-16 h-16 ${method.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            <method.icon size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">{method.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 font-medium break-all px-2">
                            {method.value}
                        </p>
                        <a
                            href={method.href}
                            target={method.href.startsWith('http') ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            className="mt-auto inline-flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold text-sm hover:bg-yellow-500 hover:text-black dark:hover:bg-yellow-500 dark:hover:text-black transition-all duration-300"
                        >
                            {method.label}
                            <ExternalLink size={14} />
                        </a>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full opacity-50 group-hover:bg-yellow-500/10 transition-colors" />
                    </motion.div>
                ))}
            </div>

            {/* Address Card */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row"
            >
                <div className="lg:w-1/2 p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-yellow-500 p-3 rounded-xl text-black shadow-lg">
                            <MapPin size={28} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Ubica nuestras oficinas</h2>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                        Visítanos en nuestra sucursal matriz y recibe <span className="font-bold text-gray-900 dark:text-white">asesoría directa</span> sobre cualquier refacción o servicio técnico.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl mb-8">
                        <p className="font-bold text-gray-900 dark:text-white mb-1">Dirección:</p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Carretera federal México - Acapulco Km. 29, Puente de Ixtla, Mor. 62660
                        </p>
                    </div>
                    <a
                        href="https://maps.google.com/?q=Refaccionaria+El+Boom+Puente+de+Ixtla"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500 text-black font-black rounded-2xl hover:bg-gray-900 hover:text-white transition-all duration-300 transform active:scale-95 shadow-xl shadow-yellow-500/20"
                    >
                        ABRIR EN GOOGLE MAPS
                        <ExternalLink size={20} />
                    </a>
                </div>
                <div className="lg:w-1/2 bg-gray-200 dark:bg-gray-800 min-h-[350px] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent pointer-events-none z-10" />
                    <img
                        src="/images/dondeComprar.webp"
                        alt="Location Preview"
                        className="w-full h-full object-cover grayscale opacity-50 transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative z-20">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-full shadow-2xl animate-pulse">
                                <MapPin size={48} className="text-yellow-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Formulario de contacto*/}
            {/* <motion.div
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Envíanos un mensaje</h2>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre completo</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="tu@ejemplo.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Asunto</label>
                                <input
                                    type="text"
                                    id="subject"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="¿En qué podemos ayudarte?"
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensaje</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Describe tu consulta o problema"
                                ></textarea>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#006CFA] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 w-full"
                                >
                                    Enviar mensaje
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div> */}

            {/* Sección de FAQs */}
            <motion.div
                className="mt-16"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                {/* <h2 className="text-2xl font-bold text-[#006CFA] mb-8 text-center">Preguntas frecuentes</h2>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                className="p-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 * index }}
                            >
                                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                                <p className="mt-2 text-gray-600">{faq.answer}</p>
                            </motion.div>
                        ))}
                    </div>
                </div> */}
            </motion.div>

            <motion.div
                className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                {/* <div className="p-8 md:flex md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">¿Necesitas ayuda inmediata?</h2>
                        <p className="mt-2 text-blue-100">Nuestro equipo de soporte está disponible para asistencia en tiempo real</p>
                    </div>
                    <div className="mt-6 md:mt-0 md:ml-8">
                        <button
                            type="button"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-blue-700 transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                            Iniciar chat
                        </button>
                    </div>
                </div> */}
            </motion.div>
        </div>
    );
}
