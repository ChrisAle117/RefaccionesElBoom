import React from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle, MapPin, Clock, Globe } from "lucide-react";

export default function Ubication() {
    const branches = [
        {
            id: 1,
            name: "Sucursal Matriz Alpuyeca",
            address: "REFACCIONES EL BOOM, Carr. Federal Mexico-Acapulco Km. 29, 62660 Puente de Ixtla, MORELOS",
            phones: ["777-181-0370", "734-344-5155"],
            whatsapp: "527771810370",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d968614.9847190331!2d-100.136292!3d18.499403!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cddf88156feb99%3A0x52215aad906626e5!2sRefaccionaria%20EL%20BOOM%20Tractopartes%20Alpuyeca!5e0!3m2!1ses-419!2smx!4v1743438339844!5m2!1ses-419!2smx",
        },
        {
            id: 2,
            name: "Sucursal Acapulco",
            address: "Refaccionaria EL BOOM, Avenida Lázaro Cárdenas, No. 2, Manzana 18. Colonia La Popular, Acapulco, Guerrero",
            phones: ["744-383-5814", "777-274-0249"],
            whatsapp: "527443835814",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15271.232386979467!2d-99.832457!3d16.885385000000003!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ca574050c25b93%3A0x3faf11878a9b5e6!2sRefaccionaria%20EL%20BOOM%20Tractopartes%20Acapulco!5e0!3m2!1ses-419!2smx!4v1743438369847!5m2!1ses-419!2smx",
        },
        {
            id: 3,
            name: "Sucursal Chilpancingo",
            address: "Refaccionaria EL BOOM, Boulevard Vicente Guerrero, Km 269, Chilpancingo, Guerrero",
            phones: ["755-130-8536", "777-327-1852"],
            whatsapp: "527551308536",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3803.4320282240833!2d-99.514731!3d17.582208!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cbedffee6368f3%3A0xda0f508041fb8cf3!2sRefaccionaria%20EL%20BOOM%20Tractopartes%20Chilpancingo!5e0!3m2!1ses-419!2smx!4v1743438397054!5m2!1ses-419!2smx",
        },
        {
            id: 4,
            name: "Sucursal Tizoc",
            address: "Refaccionaria EL BOOM, Boulevard Cuauhnáhuac Km 3.5, No. 25. Colonia Buganbilias, Jiutepec, Morelos",
            phones: ["777-288-2005", "777-321-1950"],
            whatsapp: "527772882005",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15097.35773851505!2d-99.185934!3d18.916364!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce757ee8ff1be1%3A0x62d09f4369d36965!2sRefaccionaria%20EL%20BOOM%20Tractopartes%20Tizoc%2C%20Jiutepec!5e0!3m2!1ses-419!2smx!4v1743438424259!5m2!1ses-419!2smx",
        }
    ];

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
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 min-h-screen">
            {/* Premium Header */}
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-yellow-500 uppercase bg-yellow-500/10 rounded-full border border-yellow-500/20"
                >
                    RED DE DISTRIBUCIÓN
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter"
                >
                    NUESTRAS <span
                        className="text-yellow-500"
                        style={{ textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}
                    >SUCURSALES</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 dark:text-gray-400 mt-6 text-lg max-w-2xl mx-auto leading-relaxed"
                >
                    Encuentra la refacción que necesitas en cualquiera de nuestros puntos de venta estratégicos. <span className="text-black dark:text-white font-bold">Cobertura total</span> para tu tractocamión.
                </motion.p>
            </div>

            <motion.div
                className="grid grid-cols-1 xl:grid-cols-2 gap-10 max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                {branches.map((branch) => (
                    <motion.div
                        key={branch.id}
                        variants={itemVariants}
                        className="group relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-500 hover:shadow-yellow-500/10 hover:border-yellow-500/30"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Map Container */}
                            <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden">
                                <iframe
                                    className="absolute inset-0 w-full h-full grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                                    src={branch.mapUrl}
                                    allowFullScreen
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-transparent to-white dark:to-gray-900 hidden md:block" />
                            </div>

                            {/* Content Container */}
                            <div className="p-8 flex flex-col justify-between bg-white dark:bg-gray-900">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                                            <MapPin className="w-5 h-5 text-yellow-500" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors">
                                            {branch.name}
                                        </h2>
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                                        {branch.address}
                                    </p>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Teléfonos</p>
                                                {branch.phones.map((phone, i) => (
                                                    <a key={i} href={`tel:${phone}`} className="block text-sm font-semibold text-gray-900 dark:text-white hover:text-yellow-500 transition-colors">
                                                        {phone}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Horario</p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    Lun - Vie: 9:00 - 18:30 <br />
                                                    Sáb: 9:00 - 14:00
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <a
                                        href={`https://wa.me/${branch.whatsapp}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-green-500/20 active:scale-95 w-full"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Support section integration */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="mt-20 max-w-4xl mx-auto p-10 rounded-[2.5rem] bg-gradient-to-br from-yellow-500 to-yellow-600 text-black relative overflow-hidden shadow-2xl"
            >
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-3xl font-black mb-2 tracking-tight">¿NO ENCUENTRAS TU SUCURSAL?</h3>
                        <p className="text-black/80 font-medium">Contáctanos directamente y te ayudaremos a localizar tu pieza.</p>
                    </div>
                    <div className="flex gap-4">
                        <a
                            href="https://wa.me/527771810370?text=Hola,%20necesito%20ayuda%20para%20localizar%20una%20sucursal%20o%20pieza"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-black hover:text-white transition-all duration-500 shadow-xl active:scale-95 flex items-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            AYUDA EN LÍNEA
                        </a>
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-black/5 rounded-full blur-3xl" />
                <div className="absolute -left-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            </motion.div>
        </div>
    );
}