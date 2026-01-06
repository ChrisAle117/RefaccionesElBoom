import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

interface Catalog {
    id_catalog: number;
    title: string;
    image: string;
    alt: string;
    url: string | null;
    active: boolean;
    order: number;
}

export const Catalog = React.memo(function Catalog() {
    const [catalogs, setCatalogs] = useState<Catalog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const response = await axios.get('/api/catalogs');
                setCatalogs(response.data);
            } catch {
                /* ignore */
            } finally {
                setLoading(false);
            }
        };

        fetchCatalogs();
    }, []);

    const activeCatalogs = useMemo(() =>
        catalogs
            .filter(catalog => catalog.active)
            .sort((a, b) => a.order - b.order)
        , [catalogs]);

    const handleCatalogClick = (catalog: Catalog) => {
        if (catalog.url && catalog.url !== "#") {
            window.open(catalog.url, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 py-12 px-4 sm:px-6">
            {/* Header Mini Hero */}
            <div className="max-w-7xl mx-auto text-center mb-16">

                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter"
                >
                    NUESTROS <span
                        className="text-yellow-500"
                        style={{ textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}
                    >CATÁLOGOS</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg"
                >
                    Explora nuestra colección de catálogos digitales con fotos reales y detalles técnicos de nuestras refacciones.
                </motion.p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 animate-pulse font-medium">Cargando biblioteca...</p>
                </div>
            ) : activeCatalogs.length > 0 ? (
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {activeCatalogs.map((catalog, index) => (
                        <motion.div
                            key={catalog.id_catalog}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -10 }}
                            className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 cursor-pointer"
                            onClick={() => handleCatalogClick(catalog)}
                        >
                            {/* Imagen del Catálogo (Foto Real) */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={catalog.image}
                                    alt={catalog.alt}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Overlay Gradiente Sutil */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                                    <div className="bg-yellow-500 text-black font-bold px-6 py-2 rounded-full flex items-center gap-2 shadow-lg">
                                        <ExternalLink size={16} />
                                        Abrir Catálogo
                                    </div>
                                </div>
                            </div>

                            {/* Título */}
                            <div className="p-6 text-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors line-clamp-2 leading-tight">
                                    {catalog.title}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-gray-500 font-medium">No hay catálogos disponibles actualmente.</p>
                </div>
            )}

            {/* Pie de página */}
            <div className="mt-20 max-w-4xl mx-auto text-center">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent mb-8"></div>
                <p className="text-gray-400 text-sm">
                    Refacciones El Boom © Todos los derechos reservados. Nuestros catálogos son de consulta gratuita.
                </p>
            </div>
        </div>
    );
});
