// src/components/product-card.tsx

import { parseISO, differenceInBusinessDays, format } from 'date-fns';
import { useShoppingCart } from './shopping-car-context';
import React, { useState, useEffect, useRef } from 'react';
import { ProductDetails } from './product-detail';
import { TbTruckDelivery } from 'react-icons/tb';
import { router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { es } from 'date-fns/locale';

export interface SharedProps {
    auth: {
        user?: {
            id: number;
            name: string;
            email: string;
        };
    };
    [key: string]: unknown;
}

interface ProductCardProps {
    id_product: number;
    name: string;
    price: number;
    description: string;
    disponibility: number;
    image: string;
    type?: string;
    code?: string;
    audio_url?: string | null;
    variants?: Array<{
        id_product: number;
        code?: string;
        name?: string;
        price?: number;
        image?: string;
        audio_url?: string | null;
        disponibility: number;
        color_hex?: string;
        color_label?: string;
    }>;
}

export function ProductCard({
    id_product,
    name,
    price,
    description,
    disponibility,
    image,
    type,
    code,
    audio_url,
    variants = []
}: ProductCardProps) {
    const { addToCart, isProductInCart } = useShoppingCart();
    const { props } = usePage<SharedProps>();
    const { auth } = props;

    const [showDetails, setShowDetails] = useState(false);
    const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
    const [liveDisponibility, setLiveDisponibility] = useState(disponibility);
    const [reconcilingStock, setReconcilingStock] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isInCart, setIsInCart] = useState(isProductInCart(id_product));

    useEffect(() => {
        setIsInCart(isProductInCart(id_product));
    }, [isProductInCart, id_product]);

    const [addresses, setAddresses] = useState<unknown[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [shipping, setShipping] = useState<{ price: number; eta: string } | null>(null);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [shippingError, setShippingError] = useState<string | null>(null);

    const [showEtaInfo, setShowEtaInfo] = useState(false);
    const [isHoverDevice, setIsHoverDevice] = useState(false);
    const etaInfoRef = useRef<HTMLSpanElement | null>(null);
    const tooltipId = `eta-tip-${id_product}`;

    const formatPrice = (n: number) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

    // Color helpers for swatches derived from code suffixes
    const COLOR_MAP: Record<string, string> = {
        AM: '#FFC107', // ámbar/amarillo
        YL: '#FFEB3B',
        RD: '#E53935', // rojo
        GN: '#2E7D32', // verde
        BU: '#1976D2', // azul
        BL: '#000000', // negro
        BK: '#000000', // negro
        WH: '#FFFFFF', // blanco
        CL: '#F5F5F5', // claro/transparente
        PK: '#E91E63', // rosa
        PU: '#9C27B0', // morado/purple
        OR: '#FF9800', // naranja
        GY: '#9E9E9E', // gris
        GR: '#9E9E9E',
        ICE: '#81D4FA', // azul hielo
        CY: '#00BCD4', // cian
        AQ: '#00BCD4', // aqua
        NV: '#3F51B5', // azul marino
    };

    const COLOR_WORDS: Record<string, string> = {
        'ambar': '#FFC107', 'ámbar': '#FFC107', 'amarillo': '#FFEB3B',
        'rojo': '#E53935', 'verde': '#2E7D32', 'azul': '#1976D2',
        'blanco': '#FFFFFF', 'claro': '#F5F5F5', 'transparente': '#F5F5F5', 'cristal': '#F5F5F5',
        'cromo': '#C0C0C0', 'cromado': '#C0C0C0',
        'rosa': '#E91E63', 'morado': '#9C27B0', 'violeta': '#9C27B0',
        'naranja': '#FF9800', 'hielo': '#81D4FA', 'ice': '#81D4FA',
        'cian': '#00BCD4', 'aqua': '#00BCD4', 'turquesa': '#00BCD4',
        'negro': '#000000', 'gris': '#9E9E9E'
    };

    const COLOR_CODE_REGEX = /(AM|YL|RD|GN|BU|BL|BK|WH|CL|PK|PU|OR|GY|GR|ICE|CY|AQ|NV)/g;

    const stripAccents = (s: string) => s
        .replace(/á/gi, 'a').replace(/é/gi, 'e').replace(/í/gi, 'i')
        .replace(/ó/gi, 'o').replace(/ú/gi, 'u').replace(/ü/gi, 'u').replace(/ñ/gi, 'n');

    const extractFromText = (text?: string): string[] => {
        if (!text) return [];
        const norm = stripAccents(text.toLowerCase());
        const keys = Object.keys(COLOR_WORDS).map(k => stripAccents(k));
        const pattern = new RegExp('\\b(' + keys.join('|') + ')\\b', 'gi');
        const found: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = pattern.exec(norm)) && found.length < 2) {
            const word = m[1];
            for (const [k, val] of Object.entries(COLOR_WORDS)) {
                if (stripAccents(k) === word && !found.includes(val)) { found.push(val); break; }
            }
        }
        return found;
    };

    const extractFromCode = (code?: string): string[] => {
        if (!code) return [];
        const up = code.toUpperCase();
        const segs = up.split(/[/-]/).filter(Boolean);
        const out: string[] = [];
        for (let i = segs.length - 1; i >= 0 && out.length < 2; i--) {
            const seg = segs[i];
            if (COLOR_MAP[seg] && !out.includes(COLOR_MAP[seg])) out.push(COLOR_MAP[seg]);
            const matches = seg.match(COLOR_CODE_REGEX);
            if (matches) {
                for (const codeK of matches) {
                    const hex = COLOR_MAP[codeK];
                    if (hex && !out.includes(hex)) out.push(hex);
                    if (out.length >= 2) break;
                }
            }
        }
        return out.slice(0, 2).reverse();
    };

    // Derive up to two color hexes for a swatch from variant info
    const deriveSwatchColors = (v: { color_hex?: string; code?: string; name?: string; color_label?: string; description?: string }): string[] => {
        // 1) Prefer explicit hex(es)
        if (v.color_hex && v.color_hex.trim() !== '') {
            if (v.color_hex.includes('|')) {
                const parts = v.color_hex.split('|').map(s => s.trim()).filter(Boolean);
                if (parts.length >= 2) return parts.slice(0, 2);
                return [parts[0]];
            }
            return [v.color_hex.trim()];
        }
        // 2) Infer from code
        const fromCode = extractFromCode(v.code);
        if (fromCode.length) return fromCode;
        // 3) Infer from text (label/name/description)
        const fromText = [
            ...extractFromText(v.color_label || ''),
            ...extractFromText(v.name || ''),
            ...extractFromText(v.description || '')
        ];
        const uniq: string[] = [];
        for (const c of fromText) { if (!uniq.includes(c)) uniq.push(c); if (uniq.length >= 2) break; }
        if (uniq.length) return uniq;
        // 4) Fallback
        return ['#eee'];
    };

    // Background painter: if two colors, split 50/50 without soft gradient
    const deriveSwatchBackground = (v: { color_hex?: string; code?: string; name?: string; color_label?: string; description?: string }): string => {
        const cols = deriveSwatchColors(v);
        if (cols.length >= 2) {
            const c1 = cols[0];
            const c2 = cols[1];
            // Hard split: left half c1, right half c2
            return `linear-gradient(90deg, ${c1} 0%, ${c1} 50%, ${c2} 50%, ${c2} 100%)`;
        }
        return cols[0];
    };

    // We will always show a black border so white swatches don't get lost


    const base = import.meta.env.VITE_IMG_BASE_URL as string | undefined;

    const logoSrc = document.documentElement.classList.contains('dark')
        ? '/images/logotipo-claro.png'
        : '/images/logotipo.png';


    const computeInitialSrc = React.useCallback(() => {
        const trimmed = (image || '').trim();
        if (trimmed) {
            // If it's just a filename, assume it's in /images/
            if (!trimmed.startsWith('/') && !trimmed.startsWith('http')) {
                return `/images/${trimmed}`;
            }
            return trimmed;
        }
        if (base && id_product) return `${base}/${id_product}.webp`;
        return logoSrc;
    }, [image, base, id_product, logoSrc]);

    const [imgSrc, setImgSrc] = useState<string>(() => computeInitialSrc());
    const [retryCount, setRetryCount] = useState<number>(0);

    // Variant selection state (default to representative if exists in variants)
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(() => {
        if (variants && variants.length > 0) {
            const hasRep = variants.find(v => v.id_product === id_product);
            return hasRep ? id_product : variants[0].id_product;
        }
        return null;
    });
    const currentVariant = React.useMemo(() => {
        if (!variants || variants.length === 0) return null;
        const v = variants.find(v => v.id_product === (selectedVariantId ?? id_product));
        return v || variants[0];
    }, [variants, selectedVariantId, id_product]);

    // Effective values based on selected variant (fallback to representative)
    const effectiveId = currentVariant?.id_product ?? id_product;
    const effectiveName = (currentVariant?.name && currentVariant.name.trim() !== '') ? currentVariant.name : name;
    const effectivePrice = currentVariant?.price ?? price;
    const effectiveImage = (currentVariant?.image && currentVariant.image.trim() !== '') ? currentVariant.image : image;
    const effectiveCode = currentVariant?.code ?? code;
    const effectiveDescription = (currentVariant as Record<string, unknown>)?.description as string || description;
    const effectiveAudioUrl = currentVariant?.audio_url ?? audio_url ?? null;

    // When variant has image, update preview
    useEffect(() => {
        // Update preview image when variant changes
        setRetryCount(0); // Reset retry on change
        if (currentVariant && currentVariant.image) {
            let nextSrc = currentVariant.image.trim();
            if (nextSrc && !nextSrc.startsWith('/') && !nextSrc.startsWith('http')) {
                nextSrc = `/images/${nextSrc}`;
            }
            setImgSrc(nextSrc || computeInitialSrc());
        } else {
            setImgSrc(computeInitialSrc());
        }
        // Sync stock baseline to selected variant
        if (currentVariant && typeof currentVariant.disponibility === 'number') {
            setLiveDisponibility(currentVariant.disponibility);
        } else {
            setLiveDisponibility(disponibility);
        }
        // Update cart flag for selected variant id
        setIsInCart(isProductInCart(effectiveId));
    }, [selectedVariantId, currentVariant, disponibility, isProductInCart, effectiveId, image, computeInitialSrc]);

    useEffect(() => {
        setRetryCount(0);
        setImgSrc(computeInitialSrc());
    }, [image, id_product, base, logoSrc, computeInitialSrc]);


    useEffect(() => {
        const check = () => {
            if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
                setIsHoverDevice(false);
                return;
            }
            const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
            setIsHoverDevice(!!mq.matches);
        };
        check();
        let mq: MediaQueryList | null = null;
        if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
            mq = window.matchMedia('(hover: hover) and (pointer: fine)');
            const handler = () => setIsHoverDevice(!!mq!.matches);
            if (mq.addEventListener) mq.addEventListener('change', handler);
            else if ('addListener' in mq) (mq as unknown as { addListener: (h: (ev: MediaQueryListEvent) => void) => void }).addListener(handler);
            return () => {
                if (!mq) return;
                if (mq.removeEventListener) mq.removeEventListener('change', handler);
                else if ('removeListener' in mq) (mq as unknown as { removeListener: (h: (ev: MediaQueryListEvent) => void) => void }).removeListener(handler);
            };
        }
    }, []);


    useEffect(() => {
        if (!showEtaInfo) return;
        const onDocClick = (ev: MouseEvent) => {
            if (!etaInfoRef.current) return;
            if (!etaInfoRef.current.contains(ev.target as Node)) {
                setShowEtaInfo(false);
            }
        };
        const onKey = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape') setShowEtaInfo(false);
        };
        document.addEventListener('click', onDocClick, true);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('click', onDocClick, true);
            document.removeEventListener('keydown', onKey);
        };
    }, [showEtaInfo]);



    useEffect(() => {
        if (!auth?.user) return;
        setLoadingAddresses(true);
        fetch('/user/addresses', {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        })
            .then(res => {
                // Silently ignore 401 errors (user not authenticated)
                if (res.status === 401) {
                    return { success: false, addresses: [] };
                }
                return res.json();
            })
            .then(body => {
                if (body.success) setAddresses(body.addresses);
            })
            .catch(() => {
                // Silently catch any errors
            })
            .finally(() => setLoadingAddresses(false));
    }, [auth?.user]);


    const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        const addrId = e.target.value;
        setSelectedAddress(addrId);
        setShipping(null);
        setShippingError(null);
        if (!addrId) return;

        setLoadingShipping(true);
        fetch(`/dhl/rate?address_id=${addrId}&product_id=${effectiveId}&quantity=1`, {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        })
            .then(res => res.json())
            .then(body => {
                if (body.success) {
                    setShipping(body.data);
                } else {
                    setShippingError('No fue posible cotizar el envío');
                }
            })
            .catch(() => setShippingError('Error al cotizar envío'))
            .finally(() => setLoadingShipping(false));
    };


    const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        if (isAddingToCart || isInCart) return;

        if (!auth?.user) {
            const alertDiv = document.createElement('div');
            alertDiv.textContent = 'Para poder agregar un producto al carrito, debe de iniciar sesión o registrarse.';
            alertDiv.className = 'fixed top-[-100px] left-1/2 transform -translate-x-1/2 bg-[#] text-white px-6 py-3 rounded-lg shadow-lg z-50 text-center transition-transform duration-5000 ease-in-out';
            document.body.appendChild(alertDiv);
            setTimeout(() => {
                alertDiv.style.top = '25px';
            }, 10);
            setTimeout(() => {
                alertDiv.style.top = '-100px';
                setTimeout(() => document.body.removeChild(alertDiv), 500);
            }, 4000);
            router.visit('/login');
            return;
        }

        try {
            setIsAddingToCart(true);

            let finalStock = liveDisponibility;
            try {
                const r = await fetch(`/api/products/${effectiveId}/reconcile-stock`, { credentials: 'include' });
                if (r.ok) {
                    const d = await r.json();
                    if (d && d.success && typeof d.local_stock === 'number') {
                        finalStock = d.local_stock;
                        setLiveDisponibility(d.local_stock);
                    }
                }
            } catch { /* ignore */ }

            const product = { id_product: effectiveId, name: effectiveName, price: effectivePrice, quantity: 1, disponibility: finalStock, image: effectiveImage };
            await addToCart(product);

            //Alerta de éxito
            const alertDiv = document.createElement('div');
            alertDiv.textContent = 'Producto agregado correctamente';
            alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 opacity-0 flex items-center';


            const checkIcon = document.createElement('span');
            checkIcon.innerHTML = '✓';
            checkIcon.className = 'mr-2 font-bold';
            alertDiv.prepend(checkIcon);

            document.body.appendChild(alertDiv);
            setTimeout(() => {
                alertDiv.style.opacity = '1';
            }, 100);

            setTimeout(() => {
                alertDiv.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(alertDiv);
                    setIsAddingToCart(false);
                    setIsInCart(true);
                }, 300);
            }, 3000);
        } catch {
            alert('Hubo un problema al agregar el producto al carrito.');
            setIsAddingToCart(false);
        }
    };


    const handleBuyNow = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!auth?.user) {
            const alertDiv = document.createElement('div');
            alertDiv.textContent = 'Para poder comprar, debe de iniciar sesión o registrarse.';
            alertDiv.className = 'fixed top-[-100px] left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-center transition-transform duration-500 ease-in-out';
            document.body.appendChild(alertDiv);
            setTimeout(() => {
                alertDiv.style.top = '25px';
            }, 10);
            setTimeout(() => {
                alertDiv.style.top = '-100px';
                setTimeout(() => document.body.removeChild(alertDiv), 500);
            }, 4000);
            router.visit('/login');
            return;
        }
        try {
            // Reconciliar stock antes de continuar con la compra
            let finalStock = liveDisponibility;
            try {
                const r = await fetch(`/api/products/${effectiveId}/reconcile-stock`, { credentials: 'include' });
                if (r.ok) {
                    const d = await r.json();
                    if (d && d.success && typeof d.local_stock === 'number') {
                        finalStock = d.local_stock;
                        setLiveDisponibility(d.local_stock);
                    }
                }
            } catch { /* ignore */ }

            const productData = { id_product: effectiveId, name: effectiveName, price: effectivePrice, description, disponibility: finalStock, image: effectiveImage, quantity: 1 };
            const encoded = encodeURIComponent(JSON.stringify(productData));
            router.visit(`/confirmation?product=${encoded}`, { replace: true });
        } catch {
            alert('Hubo un problema al procesar la compra.');
        }
    };

    useEffect(() => {
        setLiveDisponibility(disponibility);
    }, [disponibility]);


    let etaData: { businessDays: number; dayLabel: string; dayName: string; dayNumber: string } | null = null;
    if (shipping) {
        const etaDate = parseISO(shipping.eta);
        const now = new Date();
        const businessDays = differenceInBusinessDays(etaDate, now);
        const dayLabel = businessDays === 1 ? 'día hábil' : 'días hábiles';
        const rawName = format(etaDate, 'EEEE', { locale: es });
        const dayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        const dayNumber = format(etaDate, 'd');
        etaData = { businessDays, dayLabel, dayName, dayNumber };
    }

    if (showDetails) {
        return (
            <div className="fixed inset-0 bg-white z-50 flex items-center justify-center min-h-screen py-8 overflow-y-auto">
                <ProductDetails
                    id_product={effectiveId}
                    name={effectiveName}
                    price={effectivePrice}
                    description={description}
                    disponibility={liveDisponibility}
                    image={effectiveImage}
                    type={type}
                    code={effectiveCode}
                    variants={variants}
                    onClose={() => setShowDetails(false)}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col border-2 border-gray-400 rounded-xl shadow-md p-1 sm:p-4 transition-transform duration-300 hover:scale-105 w-full max-w-full dark:bg-gray-800 dark:border-gray-700">
            {/* Imagen */}
            <div
                className="w-full h-48 sm:h-56 md:h-64 border-1 border-[#FBCC13] overflow-hidden rounded-lg mb-3 sm:mb-4 bg-gray-50 dark:bg-gray-700 cursor-pointer"
                onClick={() => setShowDetails(true)}
            >
                <img
                    src={imgSrc}
                    alt={effectiveName}
                    className="object-contain h-full w-full"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        // Avoid infinite loop if logo also fails, though unlikely
                        if (target.src.includes('logotipo')) return;

                        if (retryCount === 0) {
                            // First failure: Try fetching from production
                            setRetryCount(1);
                            // Extract filename from current src or use original image prop
                            const filename = image ? image.split('/').pop() : '';
                            if (filename) {
                                setImgSrc(`https://refaccioneselboom.com/images/${filename}`);
                                return;
                            }
                        }

                        // If production also fails (or we couldn't determine filename), show logo
                        setImgSrc(logoSrc);
                    }}
                />
            </div>

            {/* Título y precio (ligeramente más grandes sin perder proporción) */}
            <div className="flex flex-col px-1 sm:px-2">
                <span
                    className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2 truncate dark:text-gray-100 cursor-pointer"
                    onClick={() => setShowDetails(true)}
                >
                    {effectiveName}
                </span>
                <div className="flex items-center justify-between gap-1 mb-2 sm:mb-3">
                    <div className="flex items-baseline">
                        <span className="text-xl sm:text-2xl font-extrabold text-green-700 dark:text-green-600">
                            {formatPrice(effectivePrice)}
                        </span>
                        <span className="text-sm ml-1 text-bold text-gray-500 dark:text-white">MXN</span>
                    </div>
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            const next = !showAdditionalInfo;
                            setShowAdditionalInfo(next);
                            if (next) {
                                setReconcilingStock(true);
                                fetch(`/api/products/${effectiveId}/reconcile-stock`, { credentials: 'include' })
                                    .then(r => r.ok ? r.json() : null)
                                    .then(data => {
                                        if (data && data.success && typeof data.local_stock === 'number') {
                                            setLiveDisponibility(data.local_stock);
                                        }
                                    })
                                    .catch(() => { /* silent fail */ })
                                    .finally(() => setReconcilingStock(false));
                            }
                        }}
                        className="bg-gray-100 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full p-2 transition-all duration-300 cursor-pointer"
                        aria-label={showAdditionalInfo ? 'Ocultar detalles' : 'Mostrar detalles'}
                    >
                        <svg
                            className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${showAdditionalInfo ? 'rotate-180' : ''
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Variant swatches (always visible) */}
            {variants && variants.length > 1 && (
                <div className="px-1 sm:px-2 mt-1 mb-1 flex flex-wrap items-center gap-2">
                    {variants.map((v) => (
                        <button
                            key={v.id_product}
                            onClick={(e) => { e.stopPropagation(); setSelectedVariantId(v.id_product); }}
                            title={(v.color_label || v.code || '').toString()}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border ${selectedVariantId === v.id_product ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'} shadow-sm hover:scale-110 transition-transform cursor-pointer`}
                            style={{ background: deriveSwatchBackground(v), borderColor: '#000' }}
                            aria-label={`Ver variante ${(v.color_label || '')}`}
                        />
                    ))}
                </div>
            )}


            <div
                className={`mt-1 sm:mt-2 mb-2 sm:mb-4 px-1 sm:px-2 border-t pt-2 sm:pt-3 transition-all duration-300 ${showAdditionalInfo
                    ? 'max-h-96 opacity-100 overflow-visible'
                    : 'max-h-0 opacity-0 py-0 overflow-hidden'
                    }`}
            >


                <div onClick={e => e.stopPropagation()}>
                    {loadingAddresses ? (
                        <div className="flex items-center justify-center py-2 text-sm text-gray-600 dark:text-gray-300">
                            <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Cargando direcciones...
                        </div>
                    ) : addresses.length === 0 ? (
                        <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded-md text-center">
                            No tienes direcciones. Registra una para cotizar envío.
                        </p>
                    ) : (
                        <div className="relative mb-2">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                                <svg
                                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <select
                                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006CFA] dark:focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                value={selectedAddress}
                                onChange={handleAddressChange}
                                onClick={e => e.stopPropagation()}
                            >
                                <option value="" className="text-gray-500 dark:text-gray-400">
                                    Selecciona un C.P.
                                </option>
                                {addresses.map((a: { id_direccion: number; codigo_postal: string; calle: string; ciudad: string }) => (
                                    <option key={a.id_direccion} value={a.id_direccion.toString()} className="text-gray-700 dark:text-gray-200">
                                        {a.codigo_postal}: {a.calle}, {a.ciudad}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {loadingShipping && <p className='text-black'>Calculando tiempo de entrega…</p>}
                {shippingError && <p className="text-red-500">{shippingError}</p>}


                {shipping && etaData && (
                    <div className="inline-flex flex-col mt-2 mb-2 items-start w-full text-sm text-blue-600 bg-blue-50 px-2 py-1.5 rounded dark:text-blue-400 dark:bg-blue-900">
                        <div className="flex items-center w-full">
                            <TbTruckDelivery className="w-4 h-4 mr-1 flex-shrink-0" />
                            {/* <span className="font-semibold">Costo de envío: {formatPrice(shipping.price)}</span> */}
                        </div>
                        <div className="mt-1 flex items-center">
                            <span className="font-semibold">Llegada aproximada:</span>&nbsp;{etaData.dayName} {etaData.dayNumber}
                            {/* Tooltip informativo */}
                            <span ref={etaInfoRef} className="relative inline-flex ml-2 group" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    aria-label="Información sobre la entrega"
                                    aria-expanded={showEtaInfo}
                                    aria-controls={tooltipId}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isHoverDevice) return;
                                        setShowEtaInfo(v => !v);
                                    }}
                                    className={`w-4 h-4 leading-4 text-center rounded-full bg-blue-600 text-white text-[10px] font-bold select-none focus:outline-none focus:ring-2 focus:ring-blue-400 ${isHoverDevice ? 'cursor-help' : 'cursor-pointer'}`}
                                >
                                    i
                                </button>
                                <div
                                    id={tooltipId}
                                    role="tooltip"
                                    className={`absolute left-1/2 -translate-x-1/2 top-[130%] z-[999] w-72 max-w-xs rounded-md border border-gray-200 bg-white px-3 py-2 text-black text-sm leading-relaxed text-justify shadow-lg transition-opacity duration-200
                                    ${isHoverDevice
                                            ? 'invisible opacity-0 group-hover:visible group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                                            : (showEtaInfo ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none')
                                        }
                                    dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200`}
                                    style={{ textAlign: 'justify' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        type="button"
                                        aria-label="Cerrar"
                                        className={`absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-sm dark:hover:bg-gray-700 dark:text-gray-300 ${isHoverDevice ? 'hidden' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); setShowEtaInfo(false); }}
                                    >
                                        ×
                                    </button>
                                    El tiempo estimado de llegada es en base a lo proporcionado por DHL, si bien en <span className="bg-[#F1FF26] text-black">la mayoría de los casos</span> esta se cumple según lo indicado, <span className="bg-[#F1FF26] text-black">puede llegar a variar por factores externos.</span>
                                    Por esta misma razón, se le informa que el tiempo de entrega es <span className="bg-[#F1FF26] text-black"> APROXIMADO</span> como se indica en la cotización.
                                </div>
                            </span>
                        </div>
                    </div>
                )}

                <p className="text-gray-700 text-sm mb-2 dark:text-gray-300">{effectiveDescription}</p>

                {/* Audio preview for bocina products */}
                {type && type.toLowerCase() === 'bocina' && effectiveAudioUrl && (
                    <div className="mb-3">
                        <label className="sr-only">Escuchar sonido de la bocina</label>
                        <audio controls preload="none" src={effectiveAudioUrl} className="w-full">
                            Tu navegador no soporta audio.
                        </audio>
                    </div>
                )}

                <div className="flex flex-wrap gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">

                    <span>Código: {effectiveCode || 'N/A'}</span>
                    <span className="flex items-center gap-1">
                        {reconcilingStock ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-200 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300 animate-pulse">
                                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" className="opacity-25" />
                                    <path d="M12 2a10 10 0 0 1 10 10" className="origin-center" />
                                </svg>
                                Calculando...
                            </span>
                        ) : (
                            <>Unidades: {liveDisponibility}</>
                        )}
                    </span>
                </div>
            </div>


            <div className="flex flex-col flex-1 justify-end px-1 sm:px-2 mt-auto">
                {liveDisponibility > 0 ? (
                    <div className="flex flex-col gap-2 sm:gap-3 mt-1 sm:mt-2">
                        <button
                            className={`w-full h-9 flex items-center justify-center gap-2 px-2 py-1 text-white font-bold rounded-sm transition duration-200 text-xs ${isAddingToCart
                                ? "bg-gray-500 cursor-not-allowed dark:bg-gray-600"
                                : isInCart
                                    ? "bg-blue-600 cursor-not-allowed dark:bg-blue-700"
                                    : "bg-red-700 cursor-pointer hover:bg-red-600 dark:bg-green-700 dark:hover:bg-green-800"
                                }`}
                            onClick={handleAddToCart}
                            disabled={isAddingToCart || isInCart}
                        >
                            {isAddingToCart ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Agregando...
                                </>
                            ) : isInCart ? (
                                <>
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Producto en el carrito
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">+</span> Agregar al carrito
                                </>
                            )}
                        </button>
                        <button
                            className="w-full h-9 cursor-pointer px-2 py-1 bg-[#FBCC13] text-black font-bold rounded-sm hover:bg-[#FBCC13] hover:text-black transition duration-200 text-xs dark:bg-[#FBBC13] dark:hover:bg-[#FBCC13] dark:hover:text-black"
                            onClick={handleBuyNow}
                            disabled={isAddingToCart}
                        >
                            Comprar ahora
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center bg-white bg-opacity-80 z-10 rounded-lg mt-2 dark:bg-gray-700">
                        <span className="text-red-500 font-bold text-sm dark:text-red-400">Agotado</span>
                    </div>
                )}
            </div>
        </div>
    );
}
