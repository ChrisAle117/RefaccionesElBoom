import React, { useState, useEffect } from "react";
import axios from 'axios';

interface Catalog {
    id_catalog: number;
    title: string;
    image: string;
    alt: string;
    url: string | null;
    active: boolean;
    order: number;
}

export function Catalog() {
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

    const activeCatalogs = catalogs
        .filter(catalog => catalog.active)
        .sort((a, b) => a.order - b.order);

    const handleCatalogClick = (catalog: Catalog) => {
        if (catalog.url && catalog.url !== "#") {
            window.open(catalog.url, '_blank');
        }
    };

    const halfwayIndex = Math.ceil(activeCatalogs.length / 2);
    const topRowCatalogs = activeCatalogs.slice(0, halfwayIndex);
    const bottomRowCatalogs = activeCatalogs.slice(halfwayIndex);

    const renderCatalog = (catalog: Catalog) => (
        <div
            key={catalog.id_catalog}
            className="flex flex-col items-center"
            onClick={() => handleCatalogClick(catalog)}
        >
            <img
                src={catalog.image}
                alt={catalog.alt}
                className="h-[200px] w-auto cursor-pointer hover:scale-110 transition-transform duration-300"
            />
            <span className="mt-2 font-medium">{catalog.title}</span>
        </div>
    );

    return (
        <div className="p-4 border-b-2 border-[#FBCC13]">
            <h1 className="text-xl font-bold text-center mb-6">Revisa nuestros catálogos</h1>

            {loading ? (
                <p className="text-center">Cargando catálogos...</p>
            ) : activeCatalogs.length > 0 ? (
                <>
                    {/* Fila superior */}
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                        {topRowCatalogs.map(renderCatalog)}
                    </div>

                    {/* Fila inferior */}
                    {bottomRowCatalogs.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-4">
                            {bottomRowCatalogs.map(renderCatalog)}
                        </div>
                    )}
                </>
            ) : (
                <p className="text-center text-gray-500">No hay catálogos disponibles actualmente.</p>
            )}
        </div>
    );
}
