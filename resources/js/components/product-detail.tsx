import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { IoMdArrowRoundBack, IoMdClose } from 'react-icons/io';
import { TbTruckDelivery } from 'react-icons/tb';
import {
    FiZoomIn,
    FiShoppingCart,
    FiCreditCard,
    FiChevronDown,
} from 'react-icons/fi';
import { useShoppingCart } from './shopping-car-context';
import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import type { SharedProps } from './product-card';

interface Variant {
    id_product: number;
    code?: string;
    name?: string;
    description?: string;
    price?: number;
    image?: string;
    audio_url?: string | null;
    disponibility?: number;
    color_hex?: string;
    color_label?: string;
}

interface ProductDetailsProps {
    id_product: number;
    name: string;
    price: number;
    description: string;
    disponibility: number;
    image: string;
    type?: string;
    code?: string;
    variants?: Variant[];
    onClose: () => void;
}

export function ProductDetails({
    id_product,
    name,
    price,
    description,
    disponibility,
    image,
    type,
    code,
    variants,
    onClose,
}: ProductDetailsProps) {
    const { cartItems, addToCart, isProductInCart } = useShoppingCart();
    const { props } = usePage<SharedProps>();
    const { auth } = props;

    // Variant selection
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

    // Effective values based on selected variant
    const effectiveId = currentVariant?.id_product ?? id_product;
    const effectiveName = (currentVariant?.name && currentVariant.name.trim() !== '') ? currentVariant.name : name;
    const effectivePrice = currentVariant?.price ?? price;
    const effectiveImage = (currentVariant?.image && currentVariant.image.trim() !== '') ? currentVariant.image : image;
    const effectiveCode = currentVariant?.code ?? code;
    const effectiveDescription = (currentVariant as Record<string, unknown>)?.description as string || description;
    const effectiveDisponibility = currentVariant?.disponibility ?? disponibility;

    const [currentDisponibility, setCurrentDisponibility] = useState(effectiveDisponibility);
    const [reconciling, setReconciling] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const isInCart = isProductInCart(effectiveId);
    const cartItem = cartItems.find(item => item.id_product === effectiveId);
    const quantityInCart = cartItem ? cartItem.quantity : 0;
    const remainingStock = Math.max(0, currentDisponibility - quantityInCart);

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [lightboxZoomLevel, setLightboxZoomLevel] = useState(1);
    const [lightboxZoomPosition, setLightboxZoomPosition] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const lightboxImageRef = useRef<HTMLDivElement>(null);

    // Dirección y envío
    const [addresses, setAddresses] = useState<unknown[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [shipping, setShipping] = useState<{ price: number; eta: string } | null>(null);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [shippingError, setShippingError] = useState<string | null>(null);

    useEffect(() => {
        // Permitir scroll natural de la página
        document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        if (!auth?.user) return;
        setLoadingAddresses(true);
        fetch('/user/addresses', {
            headers: { Accept: 'application/json' },
            credentials: 'include',
        })
            .then(r => r.json())
            .then(b => { if (b.success) setAddresses(b.addresses); })
            .finally(() => setLoadingAddresses(false));
    }, [auth?.user]);

    const formatPrice = (n: number) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

    const formatEta = (iso: string) => {
        const d = new Date(iso);
        const s = d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric' });
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    // Color derivation functions (same as product-card)
    const colorNames: Record<string, string> = {
        rojo: '#FF0000', red: '#FF0000', negro: '#000000', black: '#000000',
        blanco: '#FFFFFF', white: '#FFFFFF', azul: '#0000FF', blue: '#0000FF',
        verde: '#00FF00', green: '#00FF00', amarillo: '#FFFF00', yellow: '#FFFF00',
        naranja: '#FFA500', orange: '#FFA500', rosa: '#FFC0CB', pink: '#FFC0CB',
        morado: '#800080', purple: '#800080', violeta: '#800080', violet: '#800080',
        gris: '#808080', gray: '#808080', grey: '#808080', cafe: '#8B4513',
        brown: '#8B4513', cromo: '#C0C0C0', chrome: '#C0C0C0', plateado: '#C0C0C0',
        silver: '#C0C0C0', dorado: '#FFD700', gold: '#FFD700',
    };

    const extractFromText = (txt: string): string[] => {
        if (!txt) return [];
        const lower = txt.toLowerCase();
        const out: string[] = [];
        for (const [kw, hex] of Object.entries(colorNames)) {
            if (lower.includes(kw)) out.push(hex);
        }
        return out.slice(0, 2).reverse();
    };

    const extractFromCode = (c?: string): string[] => {
        if (!c) return [];
        const parts = c.split(/[\/-]/);
        if (parts.length < 2) return [];
        const last = parts[parts.length - 1];
        const out: string[] = [];
        for (const [kw, hex] of Object.entries(colorNames)) {
            if (last.toLowerCase().includes(kw)) out.push(hex);
        }
        return out.slice(0, 2).reverse();
    };

    const deriveSwatchColors = (v: { color_hex?: string; code?: string; name?: string; color_label?: string; description?: string }): string[] => {
        if (v.color_hex && v.color_hex.trim() !== '') {
            if (v.color_hex.includes('|')) {
                const parts = v.color_hex.split('|').map(s => s.trim()).filter(Boolean);
                if (parts.length >= 2) return parts.slice(0, 2);
                return [parts[0]];
            }
            return [v.color_hex.trim()];
        }
        const fromCode = extractFromCode(v.code);
        if (fromCode.length) return fromCode;
        const fromText = [
            ...extractFromText(v.color_label || ''),
            ...extractFromText(v.name || ''),
            ...extractFromText(v.description || '')
        ];
        const uniq: string[] = [];
        for (const c of fromText) { if (!uniq.includes(c)) uniq.push(c); if (uniq.length >= 2) break; }
        if (uniq.length) return uniq;
        return ['#eee'];
    };

    const deriveSwatchBackground = (v: { color_hex?: string; code?: string; name?: string; color_label?: string; description?: string }): string => {
        const cols = deriveSwatchColors(v);
        if (cols.length >= 2) {
            const c1 = cols[0];
            const c2 = cols[1];
            return `linear-gradient(90deg, ${c1} 0%, ${c1} 50%, ${c2} 50%, ${c2} 100%)`;
        }
        return cols[0];
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const addrId = e.target.value;
        setSelectedAddress(addrId);
        setShipping(null);
        setShippingError(null);
        if (!addrId) return;
        setLoadingShipping(true);
        fetch(`/dhl/rate?address_id=${addrId}&product_id=${id_product}&quantity=1`, {
            headers: { Accept: 'application/json' },
            credentials: 'include',
        })
            .then(r => r.json())
            .then(b => {
                if (b.success) setShipping(b.data);
                else setShippingError('No fue posible cotizar el envío');
            })
            .catch(() => setShippingError('Error al cotizar envío'))
            .finally(() => setLoadingShipping(false));
    };

    const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageContainerRef.current) return;
        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
        setZoomPosition({ x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100 });
    };

    const handleLightboxMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!lightboxImageRef.current) return;
        const { left, top, width, height } = lightboxImageRef.current.getBoundingClientRect();
        setLightboxZoomPosition({ x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100 });
    };

    const [isAddingToCart, setIsAddingToCart] = useState(false);





    // Reconciliar al montar la vista de detalle
    useEffect(() => {
        let aborted = false;

        // Solo iniciar reconciliación si no es cero inicial
        if (effectiveDisponibility > 0) {
            setReconciling(true);
        }

        fetch(`/api/products/${effectiveId}/reconcile-stock`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!aborted && data && data.success && typeof data.local_stock === 'number') {
                    setCurrentDisponibility(data.local_stock);
                }
            })
            .catch(() => {
                // En caso de error, mantener el stock inicial
                if (!aborted) {
                    setCurrentDisponibility(effectiveDisponibility);
                }
            })
            .finally(() => {
                if (!aborted) {
                    setReconciling(false);
                }
            });
        return () => { aborted = true; };
    }, [effectiveId, effectiveDisponibility]);

    // Asegurar que selectedQuantity no sea mayor que el stock disponible restante
    useEffect(() => {
        if (currentDisponibility > 0) {
            if (selectedQuantity > remainingStock && remainingStock > 0) {
                setSelectedQuantity(remainingStock);
            } else if (selectedQuantity === 0 && remainingStock > 0) {
                setSelectedQuantity(1);
            } else if (remainingStock === 0) {
                setSelectedQuantity(0);
            }
        } else if (!reconciling) {
            setSelectedQuantity(0);
        }
    }, [currentDisponibility, remainingStock, reconciling, selectedQuantity]);

    const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!auth?.user) { router.visit('/login'); return; }
        if (isAddingToCart || remainingStock <= 0) return;
        try {
            setIsAddingToCart(true);
            let finalStock = currentDisponibility;
            try {
                const r = await fetch(`/api/products/${effectiveId}/reconcile-stock`, { credentials: 'include' });
                if (r.ok) {
                    const d = await r.json();
                    if (d && d.success && typeof d.local_stock === 'number') {
                        finalStock = d.local_stock;
                        setCurrentDisponibility(d.local_stock);
                    }
                }
            } catch { /* ignore */ }
            await addToCart({ id_product: effectiveId, name: effectiveName, price: effectivePrice, quantity: selectedQuantity, disponibility: finalStock, image: effectiveImage });


            setTimeout(() => {
                setIsAddingToCart(false);

            }, 2000);
        } catch {
            alert('Error al agregar al carrito');
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!auth?.user) { router.visit('/login'); return; }
        // Reconciliar stock justo antes de continuar
        let finalStock = currentDisponibility;
        try {
            const r = await fetch(`/api/products/${id_product}/reconcile-stock`, { credentials: 'include' });
            if (r.ok) {
                const d = await r.json();
                if (d && d.success && typeof d.local_stock === 'number') {
                    finalStock = d.local_stock;
                    setCurrentDisponibility(d.local_stock);
                }
            }
        } catch { /* ignore */ }
        const pd = { id_product, name, price, description, disponibility: finalStock, image, quantity: selectedQuantity };
        router.visit(`/confirmation?product=${encodeURIComponent(JSON.stringify(pd))}`, { replace: true });
    };

    return (
        <AppLayout>
            <div className="relative bg-white dark:bg-gray-900 flex flex-col max-w-full min-h-screen overflow-x-hidden overflow-y-auto pt-12 pb-16" style={{ minHeight: '100vh' }}>
                {/* Regresar */}
                <button
                    onClick={onClose}
                    className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 bg-white dark:bg-gray-900 p-1 sm:p-2 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    aria-label="Regresar"
                >
                    <IoMdArrowRoundBack className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-200" />
                </button>


                <div className="flex-1 flex lg:flex-row flex-col gap-3 lg:gap-6 p-2 sm:p-3 overflow-y-auto overflow-x-hidden pb-24 max-w-screen">

                    <div className="w-full lg:w-1/4 mt-2 md:ml-5 mx-auto">
                        <div
                            ref={imageContainerRef}
                            className="relative w-full aspect-square max-w-xs mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-xl overflow-hidden cursor-zoom-in shadow-lg border border-blue-100 dark:border-gray-700 group"
                            onMouseMove={handleImageMouseMove}
                            onMouseEnter={() => setZoomLevel(1.5)}
                            onMouseLeave={() => setZoomLevel(1)}
                            onClick={() => setLightboxOpen(true)}
                        >
                            <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-2 opacity-70 hover:opacity-100 z-10 transition-all">
                                <FiZoomIn className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <img
                                src={effectiveImage}
                                alt={effectiveName}
                                className="absolute w-full h-full object-contain transition-transform duration-200 transform-gpu"
                                style={{
                                    transform: `scale(${zoomLevel})`,
                                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                }}
                            />
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity"></div>
                        </div>
                    </div>


                    <div className="w-full lg:flex-1 flex justify-start items-start mt-4 lg:mt-2 px-2 sm:px-4">
                        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 w-full flex flex-col">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {disponibility > 0 && disponibility < 5 && (
                                    <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs font-medium rounded-full">
                                        ¡Últimas unidades!
                                    </span>
                                )}
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-black dark:text-white mb-2 sm:mb-3">{effectiveName}</h1>
                            
                            {/* Variant color swatches */}
                            {variants && variants.length > 1 && (
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</span>
                                    {variants.map((v) => (
                                        <button
                                            key={v.id_product}
                                            onClick={() => setSelectedVariantId(v.id_product)}
                                            title={(v.color_label || v.code || '').toString()}
                                            className={`w-8 h-8 rounded-full border-2 ${selectedVariantId === v.id_product ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'} shadow-sm hover:scale-110 transition-transform cursor-pointer`}
                                            style={{ background: deriveSwatchBackground(v), borderColor: selectedVariantId === v.id_product ? '#3b82f6' : '#000' }}
                                            aria-label={`Ver variante ${(v.color_label || '')}`}
                                        />
                                    ))}
                                    {currentVariant?.color_label && (
                                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">({currentVariant.color_label})</span>
                                    )}
                                </div>
                            )}
                            
                            <p className="text-xl sm:text-2xl md:text-3xl text-green-700 dark:text-green-400 font-bold mb-3 sm:mb-4">{formatPrice(effectivePrice)}</p>
                            <p className="border-t border-b border-gray-200 dark:border-gray-700 py-3 sm:py-4 mb-3 sm:mb-4 text-gray-700 dark:text-gray-300 max-h-[15vh] sm:max-h-[20vh] overflow-y-auto overflow-x-hidden text-sm sm:text-base">{effectiveDescription}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="flex flex-col gap-2 text-sm sm:text-base">
                                    {type && <div className="flex items-center gap-2 sm:gap-3"><span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-purple-500" /><span className="font-medium text-gray-700 dark:text-gray-300">Tipo:</span><span className="font-semibold text-gray-900 dark:text-gray-100">{type}</span></div>}
                                    {effectiveCode && <div className="flex items-center gap-2 sm:gap-3"><span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-500" /><span className="font-medium text-gray-700 dark:text-gray-300">Código:</span><span className="font-semibold text-gray-900 dark:text-gray-100">{effectiveCode}</span></div>}
                                    <div className="flex items-center gap-2 sm:gap-3"><span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500" /><span className="font-medium text-gray-700 dark:text-gray-300">Stock:</span><span className="font-semibold text-gray-900 dark:text-gray-100">{reconciling ? 'Calculando…' : currentDisponibility} unidades</span></div>

                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4">
                                    <h3 className="flex items-center font-bold mb-2 sm:mb-3 text-gray-800 dark:text-gray-200 text-sm sm:text-base"><TbTruckDelivery className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-blue-600 dark:text-blue-400" />Información de envío</h3>
                                    <div className="space-y-2 sm:space-y-3 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                        <p className="flex justify-between"><span className="font-medium">Envío estimado:</span>{loadingShipping ? <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 dark:bg-blue-900 text-blue-500 dark:text-blue-300 rounded-full text-xs"><svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Calculando...</span> : shipping ? <span className="font-bold px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-500 dark:text-blue-300 rounded-full text-sm">{formatEta(shipping.eta)}</span> : <span className="text-gray-400">Selecciona dirección</span>}</p>
                                        <p className="flex justify-between"><span className="font-medium">Costo de envío:</span>{loadingShipping ? <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 dark:bg-blue-900 text-blue-500 dark:text-blue-300 rounded-full text-xs"><svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Calculando...</span> : shipping ? <span className="font-bold px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-500 dark:text-blue-300 rounded-full text-sm">{formatPrice(shipping.price)}</span> : <span className="text-gray-400">Selecciona dirección</span>}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="relative">
                                    {loadingAddresses ? (
                                        <div className="flex items-center justify-center py-2 text-sm"><svg className="animate-spin h-4 w-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg><span className="text-gray-600 dark:text-gray-400">Cargando direcciones...</span></div>
                                    ) : addresses.length === 0 ? (
                                        <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 p-2 rounded text-xs"><p className="text-blue-700 dark:text-blue-300">No tienes direcciones registradas.</p></div>
                                    ) : (
                                        <div className="flex items-center">
                                            <select className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 transition shadow-sm appearance-none" value={selectedAddress} onChange={handleAddressChange}>
                                                <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">Selecciona dirección...</option>
                                                {addresses.map((a: { id_direccion: number; codigo_postal: string; calle: string; ciudad: string }) => (
                                                    <option key={a.id_direccion} value={a.id_direccion} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">{a.codigo_postal} — {a.calle}, {a.ciudad}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute right-0 flex items-center px-2 text-gray-700 dark:text-gray-300 h-full"><FiChevronDown className="h-4 w-4" /></div>
                                        </div>
                                    )}
                                    {shippingError && <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-2 mt-2 rounded text-xs"><p className="text-red-700 dark:text-gray-300">{shippingError}</p></div>}
                                </div>

                                {/* Selector de cantidad */}
                                {remainingStock > 0 && (
                                    <div className="mt-6 flex items-center gap-4">
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Cantidad:</span>
                                        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-gray-50 dark:bg-gray-900">
                                            <button
                                                onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                                                className="px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-gray-600 dark:text-gray-400 font-bold transition-colors cursor-pointer"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max={remainingStock}
                                                value={selectedQuantity}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) {
                                                        setSelectedQuantity(Math.min(remainingStock, Math.max(1, val)));
                                                    }
                                                }}
                                                className="w-16 text-center border-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-0"
                                            />
                                            <button
                                                onClick={() => setSelectedQuantity(prev => Math.min(remainingStock, prev + 1))}
                                                className="px-4 py-2 hover:bg-green-100 dark:hover:bg-green-900 text-gray-600 dark:text-gray-400 font-bold transition-colors cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            ({remainingStock} más disponibles)
                                        </span>
                                    </div>
                                )}
                                {isInCart && remainingStock === 0 && (
                                    <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm border border-blue-100 dark:border-blue-800 flex items-center gap-2">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Ya tienes todas las unidades disponibles en tu carrito ({quantityInCart}).</span>
                                    </div>
                                )}

                                {/* Botones de acción - ubicados justo después de la sección de direcciones */}
                                {(disponibility > 0 || currentDisponibility > 0 || reconciling) && (
                                    <div className="w-full flex gap-2 sm:gap-4 mt-6">
                                        <button
                                            onClick={!isAddingToCart && !reconciling && remainingStock > 0 ? handleAddToCart : undefined}
                                            disabled={isAddingToCart || reconciling || currentDisponibility <= 0 || (isInCart && remainingStock <= 0)}
                                            className={`w-full py-2 sm:py-3 ${isAddingToCart || reconciling
                                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                                : isInCart && remainingStock <= 0
                                                    ? 'bg-blue-600 pointer-events-none text-white opacity-80'
                                                    : currentDisponibility > 0
                                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                                        : 'bg-gray-300 cursor-not-allowed text-gray-500'
                                                } font-bold text-sm sm:text-base rounded-lg shadow transition-all duration-300 hover:shadow-lg flex items-center justify-center relative overflow-hidden`}
                                        >
                                            {reconciling ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                    </svg>
                                                    Verificando stock...
                                                </>
                                            ) : isAddingToCart ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                    </svg>
                                                    Agregando...
                                                </>
                                            ) : isInCart && remainingStock > 0 ? (
                                                <>
                                                    <FiShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> Agregar más
                                                </>
                                            ) : isInCart && remainingStock <= 0 ? (
                                                <>
                                                    <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    En el carrito ({quantityInCart})
                                                </>
                                            ) : currentDisponibility > 0 ? (
                                                <>
                                                    <FiShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> Agregar al carrito
                                                </>
                                            ) : (
                                                <>
                                                    <FiShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> Sin stock
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={!reconciling && currentDisponibility > 0 ? handleBuyNow : undefined}
                                            disabled={reconciling || currentDisponibility <= 0}
                                            className={`w-full py-2 cursor-pointer sm:py-3 ${reconciling || currentDisponibility <= 0
                                                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                                : 'bg-[#FBCC13] hover:bg-blue-700 hover:text-white text-black'
                                                } font-bold text-sm sm:text-base rounded-lg shadow transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-1 sm:gap-2`}
                                        >
                                            {reconciling ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                    </svg>
                                                    Verificando stock...
                                                </>
                                            ) : (
                                                <>
                                                    <FiCreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    {currentDisponibility > 0 ? 'Comprar ahora' : 'Sin stock'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* Mensaje cuando no hay stock disponible */}
                                {!reconciling && currentDisponibility <= 0 && disponibility <= 0 && (
                                    <div className="w-full mt-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                                        <div className="flex items-center justify-center text-red-600 dark:text-red-300">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <span className="font-medium">Producto agotado</span>
                                        </div>
                                        <p className="text-red-600 dark:text-red-300 text-center mt-2 text-sm">
                                            Este producto actualmente no tiene stock disponible.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lightbox para zoom de imagen */}
                {lightboxOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-30" onClick={() => setLightboxOpen(false)}>
                        <div onClick={e => e.stopPropagation()} className="relative max-w-5xl w-full mx-auto">
                            <button onClick={e => { e.stopPropagation(); setLightboxOpen(false); }} className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 text-gray-800 shadow-lg z-10" aria-label="Cerrar">
                                <IoMdClose className="w-8 h-8" />
                            </button>
                            <div className="absolute top-4 left-4 bg-white bg-opacity-80 rounded-full p-2 z-10">
                                <FiZoomIn className="w-6 h-6 text-gray-800" />
                                <span className="text-xs font-medium bg-black bg-opacity-70 text-white px-2 py-1 rounded absolute top-full left-0 mt-1">
                                    Mueve el cursor para hacer zoom
                                </span>
                            </div>
                            <div ref={lightboxImageRef} className="cursor-zoom-in overflow-hidden" onMouseMove={handleLightboxMouseMove} onMouseEnter={() => setLightboxZoomLevel(2)} onMouseLeave={() => setLightboxZoomLevel(1)}>
                                <div className="relative overflow-hidden rounded-lg shadow-2xl max-h-[85vh] max-w-[90vw]">
                                    <img
                                        src={effectiveImage}
                                        alt={effectiveName}
                                        className="object-contain transition-transform duration-200 transform-gpu"
                                        style={{
                                            transform: `scale(${lightboxZoomLevel})`,
                                            transformOrigin: `${lightboxZoomPosition.x}% ${lightboxZoomPosition.y}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout >
    );
}
