import React from "react";
import { motion } from "framer-motion";
import { Compass, Eye } from 'lucide-react';

export default function AboutUs() {
    return (
        <div className="pb-12 dark:bg-gray-900 dark:text-gray-100">
            {/* Premium Header */}
            <div className="text-center mb-16">

                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter uppercase"
                >
                    NUESTRA <span
                        className="text-yellow-500"
                        style={{ textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}
                    >HISTORIA</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 dark:text-gray-400 mt-6 text-xl max-w-2xl mx-auto leading-relaxed"
                >
                    Más de un siglo de compromiso con la <span className="font-bold text-gray-900 dark:text-white">excelencia en el transporte pesado</span> y la satisfacción de nuestros clientes.
                </motion.p>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                {/* Intro Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                            <span className="font-bold text-gray-900 dark:text-white border-b-2 border-yellow-500">Refaccionaria El Boom</span> es su destino integral para todo lo relacionado con refacciones para camiones. Somos una empresa 100% mexicana, comprometida con la comercialización y distribución de refacciones para camiones de carga y pasaje.
                        </p>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                            Nuestra empresa fomenta la responsabilidad personal, la comunicación interna y la mejora continua en todos nuestros procesos. Creemos que estos valores son esenciales para ofrecer un servicio de excelencia.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="bg-gray-50 dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700"
                    >
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-justify italic">
                            "Entendemos la importancia de cada pieza en el funcionamiento de su vehículo. Por ello, nos especializamos en ofrecer una amplia variedad de tractopartes, piezas usadas y accesorios con un estándar de calidad insuperable."
                        </p>
                        <div className="mt-6 flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-black font-black">EB</div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Equipo El Boom</p>
                                <p className="text-sm text-gray-500">Pasión por el servicio</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Mission & Vision Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Misión */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -10 }}
                        className="group bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden"
                    >
                        <div className="mb-6 bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Compass size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Misión</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed text-justify">
                            Somos una empresa líder en la comercialización de refacciones para camiones, competitiva y vanguardista, satisfaciendo las necesidades de nuestros clientes mediante un servicio de calidad y mejora continua.
                        </p>
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-600/5 rounded-full" />
                    </motion.div>

                    {/* Visión */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -10 }}
                        transition={{ delay: 0.1 }}
                        className="group bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden"
                    >
                        <div className="mb-6 bg-yellow-500 w-16 h-16 rounded-2xl flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-transform">
                            <Eye size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Visión</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed text-justify">
                            Posicionarnos dentro de los primeros 10 proveedores de refacciones en México, siendo innovadores en mercadeo y logrando una alta rentabilidad para nosotros y nuestros socios comerciales.
                        </p>
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-yellow-500/5 rounded-full" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
