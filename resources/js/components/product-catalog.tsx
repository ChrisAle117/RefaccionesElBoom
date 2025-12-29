import React, { useState, useEffect, useRef, useLayoutEffect, useMemo, Suspense, lazy } from 'react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { ProductCard } from './product-card';
import { Pagination } from './pagination';

import { ProductDetails } from './product-detail';

// Helpers globales para imÃ¡genes de tipos
const slugifyType = (t: string) => (
    (t || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
);

/*Imagenes para tipos de productos de manera normal*/

const TYPE_IMAGE_MAP: Record<string, string> = {
    // Categorías principales y slugs correctos
    'bocina': '/images/bocinas.webp', // Cornetas de aire, eléctricas y repuestos
    'plafon': '/images/plafon.webp', // Iluminación de señalización, micas, plafones LED
    'cubretuerca': '/images/cubretuercas.webp', // Accesorios cromados para rines
    'faro-led': '/images/faroled.webp', // Iluminación principal, barras LED, ojos de ángel
    'faro': '/images/faroled.webp', // Alias por si viene sin el "led"
    'modulo-led': '/images/modulos.webp', // Módulos LED decorativos/señalización
    'modulos-led': '/images/modulos.webp', // Alias plural
    'limpiaparabrisas': '/images/limpiaparabrisas.webp', // Plumillas de todas las medidas
    'mantenimiento-y-quimicos': '/images/mantenimiento-y-quimicos.webp', // Cemento, siliconas, sprays, grasas
    'accesorios-y-herramientas': '/images/accesorios-y-herramientas.webp', // Abrazaderas, conectores, cinchos
    'espejos': '/images/espejos.webp', // Espejos retrovisores laterales y panorámicos para camiones
    'otros': '/images/otros.webp',
    'sin-clasificar': '/images/otros.webp',
    'default': '/images/otros.webp',
    '': '/images/otros.webp',
};

const getTypeImage = (t: string) => {
    const slug = slugifyType(t);
    return TYPE_IMAGE_MAP[slug] || '/images/logotipo.png';
};

interface Product {
    id_product: number;
    name: string;
    price: number;
    description: string;
    disponibility: number;
    image: string;
    active: boolean;
    type?: string;
    code?: string;
    variants?: Array<{
        id_product: number;
        code: string;
        name: string;
        description: string;
        price: number;
        image: string;
        audio_url?: string | null;
        disponibility: number;
        color_hex: string;
        color_label: string;
    }>;
}

type FilterOption = {
    id: string;
    label: string;
    isActive: boolean;
    applyFilter: (products: Product[]) => Product[];
};

// Definir las opciones de filtro fuera del componente para evitar recreación
const DEFAULT_FILTER_OPTIONS: FilterOption[] = [
    {
        id: 'price-desc',
        label: 'Precio: Mayor a menor',
        isActive: false,
        applyFilter: (products: Product[]) => [...products].sort((a, b) => b.price - a.price)
    },
    {
        id: 'availability-desc',
        label: 'Disponibilidad: Mayor a menor',
        isActive: false,
        applyFilter: (products: Product[]) => [...products].sort((a, b) => b.disponibility - a.disponibility)
    },
    {
        id: 'only-available',
        label: 'Solo productos disponibles',
        isActive: false,
        applyFilter: (products: Product[]) => products.filter(p => p.disponibility > 0)
    },
    {
        id: 'price-asc',
        label: 'Precio: Menor a mayor',
        isActive: false,
        applyFilter: (products: Product[]) => [...products].sort((a, b) => a.price - b.price)
    },
    {
        id: 'availability-asc',
        label: 'Disponibilidad: Menor a mayor',
        isActive: false,
        applyFilter: (products: Product[]) => [...products].sort((a, b) => a.disponibility - b.disponibility)
    },
];

export function ProductCatalog() {
    // Define specific props for this page
    type PageProps = SharedData & {
        products?: Product[];
        search?: string;
        type?: string;
        productTypes?: string[];
    };

    // Destructurar props ANTES de cualquier uso
    const { products: rawProducts = [], search = '', type = '', productTypes = [] } = usePage<PageProps>().props;

    // Use useMemo to ensure stable reference unless underlying data changes
    const initialProducts = useMemo(() => {
        return [...(rawProducts || [])].sort((a, b) => {
            if ((a.disponibility > 0) === (b.disponibility > 0)) return 0;
            return a.disponibility > 0 ? -1 : 1;
        });
    }, [rawProducts]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Abrir automáticamente producto si viene el parámetro openProduct
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const openProductId = urlParams.get('openProduct');

        if (openProductId && initialProducts.length > 0) {
            const productToOpen = initialProducts.find(p => p.id_product === parseInt(openProductId));
            if (productToOpen) {
                setSelectedProduct(productToOpen);
                // Limpiar el parámetro del URL
                urlParams.delete('openProduct');
                const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
                window.history.replaceState({}, '', newUrl);
            }
        }
    }, [initialProducts]);

    // Estado para manejar los productos filtrados
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);

    // Estado para el tipo de producto seleccionado
    const [selectedType, setSelectedType] = useState<string>(type);

    // Estados para la paginaciÃ³n
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [productsPerPage, setProductsPerPage] = useState<number>(18);
    const [columnsCount, setColumnsCount] = useState<number>(0);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentPage]);

    // Detectar el número de columnas del grid y ajustar productos por página
    useLayoutEffect(() => {
        const updateGridLayout = () => {
            if (!gridRef.current) return;
            const computedStyle = window.getComputedStyle(gridRef.current);
            const gridTemplateColumns = computedStyle.gridTemplateColumns || '';
            let columns = gridTemplateColumns === 'none' ? 0 : gridTemplateColumns.split(' ').filter(Boolean).length;
            if (columns === 0) {
                const w = window.innerWidth;
                columns = w >= 1920 ? 8 : w >= 1536 ? 6 : w >= 1280 ? 5 : w >= 1024 ? 4 : w >= 768 ? 3 : w >= 640 ? 2 : 1;
            }
            if (columns > 0) {
                setColumnsCount(columns);
                const rowsToShow = window.innerWidth < 768 ? 5 : 3;
                const newProductsPerPage = columns * rowsToShow;
                setProductsPerPage(prev => (prev === 10 || prev !== newProductsPerPage ? newProductsPerPage : prev));
            }
        };
        updateGridLayout();
        if (gridRef.current && typeof ResizeObserver === 'function') {
            const resizeObserver = new ResizeObserver(() => updateGridLayout());
            resizeObserver.observe(gridRef.current);
            return () => resizeObserver.disconnect();
        }
        const onResize = () => updateGridLayout();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Estado para manejar los filtros
    const [filterOptions, setFilterOptions] = useState<FilterOption[]>(DEFAULT_FILTER_OPTIONS);

    // Estado para mostrar/ocultar el menÃº de filtros
    const [showFilters, setShowFilters] = useState(false);

    // Funcion para manejar el cambio de tipo de producto
    const handleTypeFilter = (type: string) => {
        setSelectedType(type);
        setViewMode('grid');
        try {
            const url = new URL(window.location.href);
            if (type) url.searchParams.set('type', type); else url.searchParams.delete('type');
            url.searchParams.set('view', 'grid');
            window.history.pushState(window.history.state, '', url.toString());
        } catch {
            const url = new URL(window.location.href);
            if (type) url.searchParams.set('type', type); else url.searchParams.delete('type');
            url.searchParams.set('view', 'grid');
            window.location.href = url.toString();
        }
    };

    // Aplicar filtros cuando cambian las opciones o el tipo seleccionado
    useEffect(() => {
        let result = [...initialProducts].filter(p => p.active);
        // Filtrar por tipo si hay uno seleccionado
        if (selectedType) {
            result = result.filter(p => p.type === selectedType);
        }
        // Aplicar todos los filtros activos
        filterOptions.forEach(option => {
            if (option.isActive) {
                result = option.applyFilter(result);
            }
        });
        setFilteredProducts(result);
        setCurrentPage(1);
    }, [initialProducts, filterOptions, selectedType]);

    // Calcular índices de productos para la página actual
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    let currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    if (columnsCount > 0 && currentProducts.length % columnsCount !== 0 && indexOfLastProduct < filteredProducts.length) {
        const missing = (columnsCount - (currentProducts.length % columnsCount)) % columnsCount;
        const extra = filteredProducts.slice(indexOfLastProduct, indexOfLastProduct + missing);
        currentProducts = currentProducts.concat(extra);
    }
    const padCount = columnsCount > 0 ? (columnsCount - (currentProducts.length % columnsCount)) % columnsCount : 0;
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // Navegación de páginas
    const goToPage = (pageNumber: number) => setCurrentPage(pageNumber);

    // Manejar cambio de filtro
    const handleFilterChange = (filterId: string) => {
        setFilterOptions(prevOptions =>
            prevOptions.map(option => {
                if (filterId.includes('price-') && option.id.includes('price-')) {
                    return {
                        ...option,
                        isActive: option.id === filterId ? !option.isActive : false
                    };
                }
                if (filterId.includes('availability-') && option.id.includes('availability-')) {
                    return {
                        ...option,
                        isActive: option.id === filterId ? !option.isActive : false
                    };
                }
                if (option.id === filterId) {
                    return { ...option, isActive: !option.isActive };
                }
                return option;
            })
        );
    };

    // Limpiar todos los filtros
    const clearAllFilters = () => {
        setFilterOptions(prevOptions =>
            prevOptions.map(option => ({ ...option, isActive: false }))
        );
    };


    // Modo de vista: 'selector' (categorías) o 'grid' (productos)
    const getInitialView = (): 'selector' | 'grid' => {
        try {
            const url = new URL(window.location.href);
            // Si hay parámetros de búsqueda, tipo o producto específico, mostrar vista de grid
            if (url.searchParams.has('search') || url.searchParams.has('type') || url.searchParams.has('openProduct')) {
                return 'grid';
            }
            const v = (url.searchParams.get('view') || '').toLowerCase();
            if (v === 'grid') return 'grid';
        } catch { /* ignore */ }
        return 'selector';
    };
    const [viewMode, setViewMode] = useState<'selector' | 'grid'>(getInitialView());
    const updateViewInUrl = (mode: 'selector' | 'grid', replace = false) => {
        try {
            const url = new URL(window.location.href);
            if (mode === 'selector') url.searchParams.delete('view');
            else url.searchParams.set('view', 'grid');
            const href = url.toString();
            if (replace) window.history.replaceState(window.history.state, '', href);
            else window.history.pushState(window.history.state, '', href);
        } catch { /* ignore */ }
    };

    // Vista: mostrar selector si viewMode = 'selector'
    const shouldShowTypeSelector = viewMode === 'selector';

    //Fotografias parte trasera de las categorias
    if (shouldShowTypeSelector) {
        // Información adicional por categoría (puedes personalizar)
        const CATEGORY_INFO: Record<string, { image: string; info: string }> = {
            'faro-led': {
                image: '/images/faroled.webp',
                info: 'Faros principales y barras LED de alta potencia para camiones.'
            },
            'faroled': {
                image: '/images/faroled.webp',
                info: 'Faros principales y barras LED de alta potencia para camiones.'
            },
            'faro': {
                image: '/images/faroled.webp',
                info: 'Faros principales y barras LED de alta potencia para camiones.'
            },
            'plafon': {
                image: '/images/plafon.webp',
                info: 'Plafones LED resistentes para cabinas de camión.'
            },
            'bocina': {
                image: '/images/bocinas.webp',
                info: 'Bocinas de aire comprimido y eléctricas para camiones.'
            },
            'espejos': {
                image: '/images/espejos.webp',
                info: 'Espejos retrovisores laterales y panorámicos para camiones.'
            },
            'modulo-led': {
                image: '/images/modulos.webp',
                info: 'Módulos LED para señalización y decoración de camiones.'
            },
            'modulos-led': {
                image: '/images/modulos.webp',
                info: 'Módulos LED para señalización y decoración de camiones.'
            },
            'modulos': {
                image: '/images/modulos.webp',
                info: 'Módulos LED para señalización y decoración de camiones.'
            },
            'leds': {
                image: '/images/modulos.webp',
                info: 'Módulos LED para señalización y decoración de camiones.'
            },
            'cubretuerca': {
                image: '/images/cubretuercas.webp',
                info: 'Cubretuercos cromados y decorativos para llantas de camión.'
            },
            'limpiaparabrisas': {
                image: '/images/limpiaparabrisas.webp',
                info: 'Plumillas y brazos limpiaparabrisas para camiones.'
            },
            'mantenimiento-y-quimicos': {
                image: '/images/mantenimiento-y-quimicos.webp',
                info: 'Cemento, siliconas, sprays, thinner y grasas para mantenimiento automotriz.'
            },
            'accesorios-y-herramientas': {
                image: '/images/accesorios-y-herramientas.webp',
                info: 'Abrazaderas, conectores de aire, válvulas de frenos y cinchos.'
            },
            'otros': {
                image: '/images/otros.webp',
                info: 'Otras refacciones y accesorios para camiones.'
            },
            'otro': {
                image: '/images/otros.webp',
                info: 'Otras refacciones y accesorios para camiones.'
            },
            'sin-clasificar': {
                image: '/images/otros.webp',
                info: 'Otras refacciones y accesorios para camiones.'
            },
            'default': {
                image: '/images/otros.webp',
                info: 'Otras refacciones y accesorios para camiones.'
            },
            '': {
                image: '/images/otros.webp',
                info: 'Otras refacciones y accesorios para camiones.'
            },
        };

        return (
            <div className="w-full bg-white dark:bg-gray-950">
                {/* Header */}
                <div className="relative w-full bg-white dark:bg-gray-950 py-8 sm:py-12 px-4 sm:px-6 flex items-center justify-between">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black dark:text-white drop-shadow-lg">NUESTROS PRODUCTOS</h1>

                </div>

                {/* Categorías Hero */}
                {productTypes && productTypes.length > 0 ? (
                    <div className="w-full px-2 sm:px-6 py-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full">
                            {productTypes.map((t, i) => {
                                const slug = slugifyType(t);
                                const backImage = CATEGORY_INFO[slug]?.image || '/images/default-large.jpg';
                                const backText = CATEGORY_INFO[slug]?.info || 'Más información de la categoría.';
                                return (
                                    <div
                                        key={`type-choice-${i}`}
                                        className="group perspective w-full aspect-[1/1]"
                                    >
                                        <button
                                            onClick={() => handleTypeFilter(t)}
                                            className="relative w-full h-full rounded-[25px] overflow-hidden shadow-2xl focus:outline-none cursor-pointer select-none transition-all duration-300"
                                            type="button"
                                            aria-label={`Explorar ${t || 'Sin clasificar'}`}
                                        >
                                            <div className="flip-card-inner group-hover:rotate-y-180 transition-transform duration-700 w-full h-full relative">
                                                {/* Front Side */}
                                                <div className="flip-card-front absolute inset-0 w-full h-full backface-hidden">
                                                    <img
                                                        src={getTypeImage(t)}
                                                        alt={`Categoría: ${t || 'Producto general'}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/default.jpg'; }}
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 transition-all z-10"></div>
                                                    <span className="absolute left-0 right-0 bottom-0 flex items-end justify-center pb-6 sm:pb-8 text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold drop-shadow-xl z-20 text-center px-2 sm:px-4 bg-gradient-to-t from-black/70 via-black/10 to-transparent h-1/2">
                                                        {t || 'Otros'}
                                                    </span>
                                                </div>
                                                {/* Back Side */}
                                                <div className="flip-card-back absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                                                    <img
                                                        src={backImage}
                                                        alt={`Información adicional de ${t || 'Producto general'}`}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 transition-all z-10"></div>
                                                    <span className="absolute left-0 right-0 bottom-0 flex items-end justify-center pb-6 sm:pb-8 text-white text-base sm:text-xl md:text-2xl lg:text-3xl font-bold drop-shadow-xl z-20 text-center px-2 sm:px-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent h-2/3">
                                                        {backText}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                        {/* Flip card CSS */}
                                        <style>{`
                                            .perspective { perspective: 1200px; }
                                            .flip-card-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }
                                            .group:hover .flip-card-inner { transform: rotateY(180deg); }
                                            .flip-card-front, .flip-card-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 25px; overflow: hidden; }
                                            .flip-card-back { transform: rotateY(180deg); }
                                        `}</style>
                                    </div>
                                );
                            })}
                        </div>




                        {/* Catalogos y donde comprar */}
                        <div className="w-full flex flex-col items-center justify-center mt-24 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-3xl justify-center">
                                <a
                                    href="/catalogos"
                                    className="relative rounded-2xl overflow-hidden shadow-xl transition-transform hover:scale-105 cursor-pointer flex items-end aspect-[4/3] min-h-[220px] md:min-h-[280px] bg-black"
                                    style={{ backgroundImage: "url('/images/catalogos.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                                >
                                    {/* Overlay removed */}
                                    <span className="relative z-10 w-full text-white text-xl md:text-2xl font-extrabold text-center drop-shadow-lg pb-4 px-3">
                                        CATÁLOGOS
                                    </span>
                                </a>
                                <a
                                    href="/sucursales"
                                    className="relative rounded-2xl overflow-hidden shadow-xl transition-transform hover:scale-105 cursor-pointer flex items-end aspect-[4/3] min-h-[220px] md:min-h-[280px] bg-black"
                                    style={{ backgroundImage: "url('/images/dondeComprar.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                                >
                                    {/* Overlay removed */}
                                    <span className="relative z-10 w-full text-white text-xl md:text-2xl font-extrabold text-center drop-shadow-lg pb-4 px-3">
                                        DÓNDE COMPRAR
                                    </span>
                                </a>
                            </div>
                        </div>


                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">No hay tipos de producto disponibles.</p>
                )}
            </div>
        );
    }

    return (
        <div className="p-2 sm:p-4 border-b-2 border-[#FBCC13]  text-bold text-white rounded shadow overflow-y-auto overflow-x-hidden relative w-full  max-w-none w-screen -ml-[calc(50vw-50%)] left-0 px-4 sm:px-6">
            {/* Header y acciones */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 flex-wrap bg-white p-3 rounded-md shadow-sm mb-3 dark:bg-gray-800">
                <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-black dark:text-white">Catálogo de productos.</h2>
                <div className="flex flex-row items-center gap-2 sm:gap-3 ">
                    {search.trim() && (
                        <p className="text-lg mb-2 mr-0 sm:mr-4 dark:text-gray-300">Resultado de búsqueda: {search}</p>
                    )}
                    <button
                        className="text-black text-sm sm:text-base hover:text-black transition duration-300 flex items-center cursor-pointer underline-offset-2 hover:underline dark:text-white dark:hover:text-yellow-400"
                        onClick={() => { setViewMode('selector'); updateViewInUrl('selector'); }}
                        type="button"
                    >
                        Ver categorías
                    </button>
                    <span className="text-gray-300 mx-1">|</span>
                    <button
                        className="text-black text-sm sm:text-base hover:text-black transition duration-300 flex items-center cursor-pointer underline-offset-2 hover:underline dark:text-white dark:hover:text-yellow-400"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? (
                            <><svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                                Ocultar filtros</>
                        ) : (
                            <><svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                                Filtrar productos</>
                        )}
                    </button>
                    <span className="text-gray-300 mx-1">|</span>
                    <button
                        className="text-black text-sm sm:text-base hover:text-black transition duration-300 flex items-center cursor-pointer underline-offset-2 hover:underline dark:text-white dark:hover:text-yellow-400"
                        onClick={() => {
                            setFilterOptions(prev => prev.map(o => ({ ...o, isActive: false })));
                            setSelectedType('');
                            const url = new URL(window.location.href);
                            url.searchParams.delete('search');
                            url.searchParams.delete('type');
                            window.location.href = url.toString();
                        }}
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Limpiar búsqueda
                    </button>
                </div>
            </div>

            {/* Panel de filtros */}
            {showFilters && (
                <div className="bg-white text-black p-2 sm:p-4 rounded-md mt-1 mb-3 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 shadow-sm">
                    <div className="flex flex-row justify-between items-center mb-3">
                        <h3 className="font-semibold text-base dark:text-gray-100">Filtrar por:</h3>
                        <button
                            className="text-blue-600 hover:text-[#FBCC13] transition duration-300 dark:text-blue-400 dark:hover:text-yellow-400 focus:outline-none"
                            onClick={clearAllFilters}
                            title="Limpiar todos los filtros"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>
                    <div className="mb-3">
                        <h4 className="font-medium text-sm mb-2 dark:text-gray-200">Ordenar por:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {filterOptions.map(option => (
                                <div key={option.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={option.id}
                                        checked={option.isActive}
                                        onChange={() => handleFilterChange(option.id)}
                                        className="mr-2 h-4 w-4 text-[#006CFA] focus:ring-1 focus:ring-[#006CFA] rounded dark:text-blue-400 dark:focus:ring-blue-400"
                                    />
                                    <label htmlFor={option.id} className="text-sm dark:text-gray-300">
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filtro por tipo de producto */}
                    {productTypes && productTypes.length > 0 && (
                        <div>
                            <h4 className="font-medium text-sm mb-2 dark:text-gray-200">Tipo de producto:</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {productTypes.map((type, index) => (
                                    <div key={`type-${index}`} className="flex items-center">
                                        <input
                                            type="radio"
                                            id={`type-${index}`}
                                            name="product-type"
                                            checked={selectedType === type}
                                            onChange={() => handleTypeFilter(type)}
                                            className="mr-2 h-4 w-4 text-[#006CFA] focus:ring-1 focus:ring-[#006CFA] rounded-full dark:text-blue-400 dark:focus:ring-blue-400"
                                        />
                                        <label htmlFor={`type-${index}`} className="text-sm dark:text-gray-300">
                                            {type || 'Sin clasificar'}
                                        </label>
                                    </div>
                                ))}
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="type-all"
                                        name="product-type"
                                        checked={selectedType === ''}
                                        onChange={() => handleTypeFilter('')}
                                        className="mr-2 h-4 w-4 text-[#006CFA] focus:ring-1 focus:ring-[#006CFA] rounded-full dark:text-blue-400 dark:focus:ring-blue-400"
                                    />
                                    <label htmlFor="type-all" className="text-sm dark:text-gray-300">
                                        Todos
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}



            {/* Grid de productos */}
            {selectedProduct ? (
                <ProductDetails
                    id_product={selectedProduct.id_product}
                    name={selectedProduct.name}
                    price={selectedProduct.price}
                    description={selectedProduct.description}
                    disponibility={selectedProduct.disponibility}
                    image={selectedProduct.image}
                    type={selectedProduct.type}
                    code={selectedProduct.code}
                    variants={selectedProduct.variants}
                    onClose={() => setSelectedProduct(null)}
                />
            ) : (
                <div
                    ref={gridRef}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 gap-3 sm:gap-4 md:gap-5 w-full p-2 product-grid-container"
                >
                    {currentProducts.length > 0 ? (
                        <>
                            {currentProducts.map((product) => (
                                <div
                                    key={product.id_product}
                                    onClick={() => {
                                        // Asegurar que se pasa toda la información del producto
                                        const fullProduct = {
                                            ...product,
                                            // Preservar propiedades importantes que pueden haberse perdido
                                            active: product.active !== undefined ? product.active : true,
                                            disponibility: product.disponibility || 0
                                        };
                                        setSelectedProduct(fullProduct);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <ProductCard {...product} />
                                </div>
                            ))}
                            {Array(padCount).fill(null).map((_, i) => (
                                <div key={`pad-${i}`} className="invisible select-none" aria-hidden="true">
                                    <div className="h-full" />
                                </div>
                            ))}
                        </>
                    ) : (
                        <p className="col-span-full text-center py-8 bg-white dark:bg-gray-800 rounded-md p-4 font-medium">No hay productos disponibles con los filtros seleccionados.</p>
                    )}
                </div>
            )}

            {/* Paginación y selector de productos por página */}
            {filteredProducts.length > 0 && (
                <div className="mt-5 bg-white rounded-md p-3 dark:bg-gray-800 shadow-sm">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredProducts.length}
                        itemsPerPage={productsPerPage}
                        currentItems={currentProducts.length}
                        onPageChange={goToPage}
                        onItemsPerPageChange={(newValue) => {
                            const adjustedValue = Math.ceil(newValue / columnsCount) * columnsCount;
                            setProductsPerPage(adjustedValue);
                            setCurrentPage(1);
                        }}
                        itemsPerPageOptions={[
                            columnsCount * 2,
                            columnsCount * 3,
                            columnsCount * 4
                        ]}
                        showItemsPerPageSelector={true}
                    />
                </div>
            )}
        </div>
    );
}














