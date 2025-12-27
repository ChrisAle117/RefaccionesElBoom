import { motion, AnimatePresence } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useState, lazy, Suspense } from 'react';

// Lazy load heavy tab components
const ProductCatalog = lazy(() => import('./product-catalog').then(m => ({ default: m.ProductCatalog })));
const LegalDocuments = lazy(() => import('./LegalDocuments').then(m => ({ default: m.LegalDocuments })));
const Vacancies = lazy(() => import('./Vacancies').then(m => ({ default: m.Vacancies })));
const Ubication = lazy(() => import('./ubication'));
const Catalog = lazy(() => import('./catalog').then(m => ({ default: m.Catalog })));
const AboutUs = lazy(() => import('./about-us'));
const Support = lazy(() => import('./Support'));
const SocialFeeds = lazy(() => import('./SocialFeeds'));
const Deshuesadero = lazy(() => import('./Deshuesadero'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center py-20 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
    </div>
);

type Tab = {
    id: string;
    label: string;
    content: React.ReactNode;
};

interface TabNavigationProps {
    tabs?: Tab[];
    defaultActiveTab?: string;
    stickyOffset?: string;
    className?: string;
    contentPadding?: string;
    contentMinHeight?: string;
    showPurchases?: boolean;
    fullWidth?: boolean;
}

export function TabNavigation({
    tabs: customTabs,
    defaultActiveTab,
    stickyOffset = "top-[72px]",
    className = "",
    contentPadding = "p-8",
    contentMinHeight = "min-h-[calc(100vh-300px)]",
    showPurchases = false,
    fullWidth = false
}: TabNavigationProps) {
    // Opciones predefinidas de tabs para todas las páginas
    const defaultTabs: Tab[] = [
        {
            id: 'productos',
            label: 'Productos',
            content: (
                <div className="pt-10 w-full">
                    <ProductCatalog />
                </div>
            )
        },
        {
            id: 'deshuesadero',
            label: 'Tractopartes nuevas y usadas',
            content: <Deshuesadero />
        },
        {
            id: 'catalogos',
            label: 'Catálogos',
            content: <Catalog />
        },
        {
            id: 'nosotros',
            label: 'Nosotros',
            content: (
                <div className="pt-10">
                    <AboutUs />
                </div>
            )
        },
        {
            id: 'sucursales',
            label: 'Sucursales',
            content: <Ubication />
        },
        // {
        //     id: 'promociones',
        //     label: '¡Promociones!',
        //     content: (
        //         <div className="pt-10">
        //             <h2 className="text-2xl font-bold mb-4 text-[#006CFA]">Promociones Especiales</h2>
        //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        //                 <div className="bg-white rounded-lg shadow-md overflow-hidden">
        //                     <div className="p-6">
        //                         <h3 className="text-xl font-semibold mb-2">¡Oferta especial!</h3>
        //                         <p className="text-gray-600">Contenido de promoción aquí...</p>
        //                     </div>
        //                 </div>
        //             </div>
        //         </div>
        //     )
        // },
        {
            id: 'vacantes',
            label: 'Bolsa de trabajo',
            content: <Vacancies />
        },
        // {
        //     id: 'servicios',
        //     label: 'Fabricación',
        //     content: (
        //         <div className="pt-10">
        //             <h2 className="text-2xl font-bold mb-4 text-[#006CFA]">Fabricación</h2>
        //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        //                 <div className="bg-white rounded-lg shadow-md overflow-hidden">
        //                     <div className="p-6">
        //                         <h3 className="text-xl font-semibold mb-2">¡Tanques de agua!</h3>
        //                         <p className="text-gray-600">Info de pipas</p>
        //                     </div>
        //                 </div>
        //             </div>
        //         </div>
        //     )
        // },
        {
            id: 'datos',
            label: 'Redes sociales',
            content: <SocialFeeds />
        },
        {
            id: 'terminos',
            label: 'Avisos',
            content: (
                <div className="pt-10">
                    <LegalDocuments />
                </div>
            )
        },
        {
            id: 'soporte',
            label: 'Soporte',
            content: <Support />
        },
        // {
        //     id: 'Otros',
        //     label: 'Otros',
        //     content: (
        //         <div className="pt-10">
        //             <h2 className="text-2xl font-bold mb-4 text-[#006CFA]">
        //             </h2>
        //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        //                 <div className="bg-white rounded-lg shadow-md overflow-hidden">
        //                     <div className="p-6">


        //                     </div>
        //                 </div>
        //             </div>
        //         </div>
        //     )
        // },
    ];



    const tabs = customTabs || (() => {
        const standardTabs = [...defaultTabs];
        if (showPurchases) {
            standardTabs.splice(3, 0);
        }
        return standardTabs;
    })();

    // Detectar si hay parámetros de búsqueda o producto para activar tab de productos
    const getInitialTab = () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('search') || urlParams.has('openProduct') || urlParams.has('type')) {
                return 'productos';
            }
        } catch {
            /* ignore */
        }
        return defaultActiveTab || (tabs.length > 0 ? tabs[0].id : '');
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());

    const validTabIds = useMemo(() => new Set(tabs.map(t => t.id)), [tabs]);
    const idToSlug: Record<string, string> = useMemo(() => ({
        productos: 'productos',
        nosotros: 'nosotros',
        sucursales: 'sucursales',
        vacantes: 'vacantes',
        catalogos: 'catalogos',
        datos: 'datos',
        terminos: 'terminos',
        soporte: 'soporte',
        deshuesadero: 'deshuesadero',
    }), []);
    const slugToId: Record<string, string> = useMemo(() => Object.fromEntries(Object.entries(idToSlug).map(([k, v]) => [v, k])), [idToSlug]);

    const getTabFromUrl = useCallback((): string | null => {
        try {
            const url = new URL(window.location.href);

            const segs = url.pathname.split('/').filter(Boolean);
            if (segs.length > 0) {
                const last = segs[segs.length - 1];
                const bySlug = slugToId[last];
                if (bySlug && validTabIds.has(bySlug)) return bySlug;
            }
            return null;
        } catch {
            return null;
        }
    }, [slugToId, validTabIds]);

    const makeUrlWithTab = useCallback((tabId: string): string => {
        try {
            const url = new URL(window.location.href);
            const params = new URLSearchParams(url.search);
            params.delete('tab');

            const segments = url.pathname.split('/').filter(Boolean);
            if (segments.length > 0) {
                const last = segments[segments.length - 1];
                if (slugToId[last]) segments.pop();
            }
            let base = '';
            if (segments[0] === 'dashboard') {
                base = '/dashboard';
            }
            const slug = idToSlug[tabId] || tabId;
            const qs = params.toString();
            return `${base}/${slug}`.replace(/\/+/g, '/').replace(/\/$/, '') + (qs ? `?${qs}` : '');
        } catch {
            return `?tab=${encodeURIComponent(tabId)}`;
        }
    }, [idToSlug, slugToId]);

    const pushTabToHistory = useCallback((tabId: string, replace = false) => {
        const href = makeUrlWithTab(tabId);
        try {
            if (replace) {
                window.history.replaceState(window.history.state, '', href);
            } else {
                window.history.pushState(window.history.state, '', href);
            }
        } catch {
            // Fallback seguro
            try { window.location.replace(href); } catch { window.location.href = href; }
        }
    }, [makeUrlWithTab]);


    useEffect(() => {
        // Detectar si hay parámetros de búsqueda para activar automáticamente la tab de productos
        try {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('search') || urlParams.has('openProduct') || urlParams.has('type')) {
                if (activeTab !== 'productos') {
                    setActiveTab('productos');
                    // Actualizar la URL al slug correcto
                    pushTabToHistory('productos', true);
                }
                return; // No continuar con la lógica normal
            }
        } catch { /* ignore */ }

        // 1) Sincroniza el tab activo desde la URL si hay slug válido (sin escribir en la URL)
        const urlTab = getTabFromUrl();
        if (urlTab && urlTab !== activeTab) {
            setActiveTab(urlTab);
        } else if (!urlTab) {
            // Si no hay slug y estamos en base ('/' o '/dashboard'), corrige una sola vez con replaceState
            try {
                const { pathname } = window.location;
                if (pathname === '/' || pathname === '/dashboard') {
                    pushTabToHistory(activeTab, true);
                }
            } catch { /* ignore */ }
        }

        // 2) Solo escucha back/forward para actualizar el estado; no reescribe la URL si el slug falta
        const onPopState = () => {
            const newTab = getTabFromUrl();
            if (newTab && newTab !== activeTab) {
                setActiveTab(newTab);
            }
        };
        window.addEventListener('popstate', onPopState);

        return () => {
            window.removeEventListener('popstate', onPopState);
        };
    }, [activeTab, getTabFromUrl, pushTabToHistory]);

    return (
        <div className={className}>
            {/* Barra de navegación por tabs */}
            <div
                data-coachmark="tabnav"
                className={`sticky ${stickyOffset} z-30 bg-white shadow-md ${fullWidth ? 'w-screen left-0 -ml-[calc(50vw-50%)]' : ''} dark:bg-[#101828] dark:shadow-lg`}
            >
                <div className="container mx-auto flex w-full overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <motion.a
                            key={tab.id}
                            data-tab-id={tab.id}
                            href={typeof window !== 'undefined' ? makeUrlWithTab(tab.id) : '#'}
                            className={`px-6 py-5 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer flex-1 basis-0 text-center ${activeTab === tab.id
                                ? 'text-slate-900 border-b-2 border-yellow-500 dark:text-[#FBCC13] dark:border-[#FBCC13]'
                                : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-[#FBCC13]'
                                }`}
                            onClick={(e) => {
                                e.preventDefault();
                                if (activeTab !== tab.id) {
                                    setActiveTab(tab.id);
                                    pushTabToHistory(tab.id);
                                } else {
                                    const currentSlug = getTabFromUrl();
                                    if (!currentSlug) pushTabToHistory(tab.id, true);
                                }
                            }}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                        >
                            {tab.label}
                        </motion.a>
                    ))}
                </div>
            </div>

            {/* Contenido principal */}
            <div className={`${fullWidth ? 'px-0' : contentPadding}`}>
                <div className={`${contentMinHeight} pb-20 dark:bg-gray-900 dark:text-gray-100 ${fullWidth ? 'w-full' : ''}`}>
                    <AnimatePresence mode="wait">
                        {tabs.map((tab) => (
                            activeTab === tab.id && (
                                <motion.div
                                    key={tab.id}
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <Suspense fallback={<LoadingFallback />}>
                                        {tab.content}
                                    </Suspense>
                                </motion.div>
                            )
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div >
    );
}