import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

type Vacancy = {
    id: number;
    title: string;
    department: string;
    location: string;
    description: string;
    requirements: any[]; 
    benefits: any[];     
    contact_email: string;
    active: boolean;
};

export function Vacancies() {
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedVacancy, setExpandedVacancy] = useState<number | null>(null);
    const [filterDepartment, setFilterDepartment] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const contentRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
    const [highlightedVacancy, setHighlightedVacancy] = useState<number | null>(null);

    // Número de WhatsApp para contacto de RH
    const WHATSAPP_NUMBER = '527775005017';
    const buildWhatsAppUrl = (title: string) =>
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, me interesa la vacante: ${title}`)}`;

    const setContentRef = useCallback((element: HTMLDivElement | null, id: number) => {
        if (contentRefs.current) {
            if (element) contentRefs.current.set(id, element);
            else contentRefs.current.delete(id);
        }
    }, []);

    useEffect(() => {
        const fetchVacancies = async () => {
            try {
                const response = await axios.get('/api/vacancies');
                setVacancies(response.data);
                setLoading(false);
            } catch (err) {
                setError('No se pudieron cargar las vacantes. Por favor, inténtalo más tarde.');
                setLoading(false);
            }
        };
        fetchVacancies();
    }, []);

    const departments = Array.from(new Set(vacancies.map(v => v.department)));

    // Helpers para validar contenido real
    const isNonEmptyText = (val: any) => typeof val === 'string' && val.trim() !== '';
    const hasListContent = (list: any[]) =>
        Array.isArray(list) &&
        list.some((item: any) => {
            if (isNonEmptyText(item)) return true;
            if (item && typeof item === 'object') {
                const titleOk = isNonEmptyText(item.title);
                const itemsOk =
                    Array.isArray(item.items) &&
                    item.items.map((s: any) => String(s).trim()).filter(Boolean).length > 0;
                return titleOk || itemsOk;
            }
            return false;
        });
    const joinMeta = (...parts: (string | undefined)[]) =>
        parts.filter(p => isNonEmptyText(p || '')).join(' | ');

    // Filtrar vacantes
    const filteredVacancies = vacancies.filter(vacancy => {
        const matchesSearch =
            searchQuery === '' ||
            vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vacancy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vacancy.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDepartment = filterDepartment === '' || vacancy.department === filterDepartment;

        return matchesSearch && matchesDepartment;
    });

    const toggleExpand = (id: number) => {
        setHighlightedVacancy(id);
        setTimeout(() => setHighlightedVacancy(null), 300);
        setExpandedVacancy(prev => (prev === id ? null : id));
    };

    if (loading) {
        return (
            <div className="pt-10 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006CFA] mb-2"></div>
                <span className="text-[#006CFA] text-lg font-medium">Cargando vacantes...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-10">
                <h2 className="text-2xl font-bold mb-6 text-[#006CFA]">Vacantes disponibles</h2>
                <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
            </div>
        );
    }

    if (vacancies.length === 0) {
        return (
            <div className="pt-10">
                <h2 className="text-2xl font-bold mb-6 text-[#006CFA]">Vacantes disponibles</h2>
                <p className="text-gray-600 mb-8">Actualmente no hay vacantes disponibles. Por favor revisa más tarde.</p>
            </div>
        );
    }

    return (
        <div className="pt-10 dark:bg-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold mb-4 text-[#006CFA] dark:text-[#FBCC13]">Vacantes disponibles</h2>
            <p className="text-gray-600 mb-6 dark:text-white">
                En El Boom Tractopartes estamos en búsqueda constante de talento que comparta nuestros valores de
                excelencia, compromiso y pasión por el servicio.
            </p>

            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Buscar vacantes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006CFA] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:ring-blue-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-1/3">
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006CFA] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:ring-blue-400"
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                    >
                        <option value="">Todos los departamentos</option>
                        {departments.map((dept, index) => (
                            <option key={index} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
                Mostrando {filteredVacancies.length} {filteredVacancies.length === 1 ? 'vacante' : 'vacantes'}
            </p>

            {filteredVacancies.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-center py-8">
                    <span className="text-lg text-gray-500 dark:text-gray-300">
                        No se encontraron vacantes con los filtros seleccionados.
                    </span>
                </motion.div>
            )}

            <div className="flex flex-wrap gap-4">
                <AnimatePresence>
                    {filteredVacancies.map((vacancy) => (
                        <motion.div
                            key={vacancy.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            layout
                            className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col w-full lg:w-[calc(50%-0.5rem)] dark:bg-gray-800 dark:border-gray-700 ${highlightedVacancy === vacancy.id ? 'ring-2 ring-[#006CFA] dark:ring-blue-400' : ''
                                }`}
                            style={{
                                transform: highlightedVacancy === vacancy.id ? 'scale(1.01)' : 'scale(1)',
                                transition: 'transform 0.2s',
                            }}
                            tabIndex={0}
                            role="region"
                            aria-label={`Vacante: ${vacancy.title}`}
                        >
                            <div
                                className="p-4 cursor-pointer"
                                onClick={() => toggleExpand(vacancy.id)}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleExpand(vacancy.id)}
                                tabIndex={0}
                                aria-expanded={expandedVacancy === vacancy.id}
                                role="button"
                            >   
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#006CFA] dark:text-[#FBCC13]">
                                            {vacancy.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-white">
                                            {joinMeta(vacancy.department, vacancy.location)}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium mr-2 dark:bg-green-900 dark:text-green-400">
                                            Disponible
                                        </span>
                                        <motion.button
                                            className="text-gray-400 hover:text-[#006CFA] transition-all duration-300 dark:text-gray-300 dark:hover:text-blue-400 focus:outline-none"
                                            aria-label={expandedVacancy === vacancy.id ? 'Colapsar vacante' : 'Expandir vacante'}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <motion.svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 cursor-pointer"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                animate={{ rotate: expandedVacancy === vacancy.id ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </motion.svg>
                                        </motion.button>
                                    </div>
                                </div>

                                {expandedVacancy !== vacancy.id && (
                                    <p className="text-sm text-gray-600 mt-2 dark:text-white line-clamp-2">
                                        {vacancy.description}
                                    </p>
                                )}
                            </div>

                            <AnimatePresence>
                                {expandedVacancy === vacancy.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="overflow-hidden dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
                                    >
                                        <div ref={(el) => setContentRef(el, vacancy.id)} className="p-4">
                                            {/* Descripción completa */}
                                            <p className="text-sm text-gray-700 mb-4 dark:text-gray-300 whitespace-pre-line">
                                                {vacancy.description}
                                            </p>

                                            {(hasListContent(vacancy.requirements) ||
                                                hasListContent(vacancy.benefits)) && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        {/* Requisitos */}
                                                        {hasListContent(vacancy.requirements) && (
                                                            <div className="bg-gray-50 p-3 rounded-md dark:bg-gray-800">
                                                                <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center cursor-pointer dark:text-[#FFFFFF]">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4 mr-1 text-[#006CFA] dark:text-blue-400"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                    Requisitos
                                                                </h4>
                                                                <ul className="list-disc list-inside space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
                                                                    {vacancy.requirements.map((req: any, index: number) => {
                                                                        if (isNonEmptyText(req)) return <li key={index}>{String(req)}</li>;
                                                                        if (req && typeof req === 'object') {
                                                                            const title = isNonEmptyText(req.title) ? req.title : null;
                                                                            const items = Array.isArray(req.items)
                                                                                ? req.items
                                                                                    .map((s: any) => String(s).trim())
                                                                                    .filter(Boolean)
                                                                                : [];
                                                                            if (!title && items.length === 0) return null;
                                                                            return (
                                                                                <li key={index} className="mb-1">
                                                                                    {title && (
                                                                                        <span className="font-medium">{title}</span>
                                                                                    )}
                                                                                    {items.length > 0 && (
                                                                                        <ul className="list-disc list-inside ml-5 mt-1 space-y-0.5">
                                                                                            {items.map((sub: string, sidx: number) => (
                                                                                                <li key={sidx}>{sub}</li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    )}
                                                                                </li>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Beneficios */}
                                                        {hasListContent(vacancy.benefits) && (
                                                            <div className="bg-gray-50 p-3 rounded-md dark:bg-gray-800">
                                                                <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center dark:text-gray-300">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4 mr-1 text-[#006CFA] dark:text-blue-400"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                    Beneficios
                                                                </h4>
                                                                <ul className="list-disc list-inside space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
                                                                    {vacancy.benefits.map((b: any, index: number) => {
                                                                        if (isNonEmptyText(b)) return <li key={index}>{String(b)}</li>;
                                                                        if (b && typeof b === 'object') {
                                                                            const title = isNonEmptyText(b.title) ? b.title : null;
                                                                            const items = Array.isArray(b.items)
                                                                                ? b.items
                                                                                    .map((s: any) => String(s).trim())
                                                                                    .filter(Boolean)
                                                                                : [];
                                                                            if (!title && items.length === 0) return null;
                                                                            return (
                                                                                <li key={index} className="mb-1">
                                                                                    {title && (
                                                                                        <span className="font-medium">{title}</span>
                                                                                    )}
                                                                                    {items.length > 0 && (
                                                                                        <ul className="list-disc list-inside ml-5 mt-1 space-y-0.5">
                                                                                            {items.map((sub: string, sidx: number) => (
                                                                                                <li key={sidx}>{sub}</li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    )}
                                                                                </li>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                            {isNonEmptyText(vacancy.contact_email) && (
                                                <div className="bg-blue-50 p-3 rounded-md dark:bg-blue-900 flex flex-col md:flex-row md:items-center gap-2">
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            ¿Te interesa esta vacante? Envía tu CV a:{' '}
                                                            <a
                                                                href={`mailto:${vacancy.contact_email}`}
                                                                className="text-[#006CFA] hover:underline font-medium dark:text-blue-400"
                                                            >
                                                                {vacancy.contact_email}
                                                            </a>
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <a
                                                            href={`mailto:${vacancy.contact_email}?subject=Interesado en la vacante: ${vacancy.title}`}
                                                            className="inline-flex items-center px-3 py-1.5 bg-[#FBCC13] text-black text-sm rounded-md hover:bg-[#FBCC13] transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
                                                            aria-label={`Aplicar a la vacante ${vacancy.title}`}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4 mr-1"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                            </svg>
                                                            Aplicar
                                                        </a>
                                                        <a
                                                            href={buildWhatsAppUrl(vacancy.title)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-3 py-1.5 bg-[#25D366] text-black font-semibold text-sm rounded-md hover:brightness-95 transition-colors"
                                                            aria-label={`Contactar por WhatsApp acerca de ${vacancy.title}`}
                                                        >
                                                            <FaWhatsapp className="h-4 w-4 mr-1" size={16} aria-hidden="true" />
                                                            WhatsApp
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-100 dark:bg-blue-900 dark:border-blue-700">
                <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3 dark:bg-blue-800">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-blue-700 dark:text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 18.72V22a2 2 0 01-2 2h-1C9.82 24 3 17.18 3 9V8a3 3 0 010-3V5z"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-md font-semibold text-gray-800 mb-1 dark:text-gray-300">
                            ¿Interesado en alguna vacante?
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 dark:text-gray-400">
                            Puedes llamarnos y con gusto te atenderemos por teléfono.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href="tel:+527775005017"
                                className="inline-flex items-center px-3 py-1.5 bg-[#FBCC13] text-black text-sm rounded-md transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
                                aria-label="Llamar ahora"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M2 3a1 1 0 011-1h3.28a1 1 0 01.948.684l1.5 4.5a1 1 0 01-.502 1.211l-2.26 1.13a11.042 11.042 0 005.517 5.517l1.13-2.26a1 1 0 011.211-.502l4.5 1.5a1 1 0 01.684.949V17a1 1 0 01-1 1h-1C9.82 18 2 10.18 2 1V3z" />
                                </svg>
                                Llamar 777-500-5017
                            </a>
                            <a
                                href="https://wa.me/527775005017"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 bg-[#25D366] text-black text-sm rounded-md  transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
                                aria-label="Contactar por WhatsApp"
                            >
                                <FaWhatsapp className="h-4 w-4 mr-1" size={16} aria-hidden="true" />
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
