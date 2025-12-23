import React from 'react';
import { motion } from 'framer-motion';

export default function Support() {
    // Información de contacto y soporte
    const supportInfo = {
        phone: '+52 (777)-180-7312',
        email: 'soporte-ecom@refaccioneselboom.com',
        hours: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
        whatsapp: '+52 (777)-180-7312',
    };

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
            <motion.h1
                className="text-3xl font-bold text-black dark:text-white mb-8 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Contacto a soporte
            </motion.h1>

            <div className="grid grid-cols-1 gap-12">
                {/* Sección de contacto */}
                <motion.div
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="bg-gradient-to-r from-[#006CFA] to-blue-600 p-6">
                        <h2 className="text-2xl font-semibold text-white">Contacta con nosotros</h2>
                        <p className="text-blue-100 mt-2">
                            Nuestro equipo de soporte está listo para ayudarte con cualquier duda o problema.
                        </p>
                    </div>
                    <div className="p-6 space-y-6">
                        <motion.div variants={itemVariants} className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#006CFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">Teléfono</h3>
                                <p className="mt-1 text-gray-600">{supportInfo.phone}</p>
                            </div>
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                {/* Icono de oficina/casa */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-[#006CFA]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11l9-7 9 7" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M5 10.5V20a2 2 0 002 2h3a1 1 0 001-1v-5h2v5a1 1 0 001 1h3a2 2 0 002-2v-9.5" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21v-4h4v4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">Úbica nuestras oficinas en: </h3>
                                <p className="mt-1 text-gray-600">
                                    Carretera federal México - Acapulco Km. 29, Puente de Ixtla, Mor. 62660
                                </p>
                            </div>
                        </motion.div>


                        <motion.div variants={itemVariants} className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#006CFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4 flex flex-col">
                                <h3 className="text-lg font-medium text-gray-900">Correo electrónico</h3>
                                <div className="mt-1 text-black dark:text-white p-3 rounded-md">
                                    <span className="block">¿Te interesa contactar con soporte? Envía tu mensaje a:</span>
                                    <a href={`mailto:${supportInfo.email}`} className="text-black dark:text-white font-medium hover:text-blue-200 transition-colors duration-200 flex items-center mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {supportInfo.email}
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#006CFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">Horario de atención</h3>
                                <p className="mt-1 text-gray-600">{supportInfo.hours}</p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#006CFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">WhatsApp</h3>
                                <p className="mt-1 text-gray-600">{supportInfo.whatsapp}</p>
                            </div>
                        </motion.div>
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
            </div>

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
