import { useShoppingCart } from "./shopping-car-context";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Address } from "@/components/address";
import { router } from "@inertiajs/react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

export interface ProductData {
    id_product: number;
    name: string;
    price: number | string;
    description: string;
    disponibility: number;
    image: string;
    quantity?: number;
}

interface DetailsPurchaseProps {
    product?: ProductData;
}

interface AddressData {
    id: number;
    street: string;
    colony: string;
    exteriorNumber: string;
    interiorNumber: string | null;
    postalCode: string;
    phone: string;
    reference: string;
    city: string;
    state: string;
}

const isValidRFC = (rfc: string) => /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i.test(rfc.trim());
// Valida teléfonos mexicanos de 10 dígitos (ignora caracteres no numéricos)
const isValidPhone10 = (phone?: string | null): boolean => {
    if (!phone) return false;
    const digits = (phone.match(/\d/g) || []).join("");
    return digits.length >= 10;
};


// Función para formatear precios con separadores de miles
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
};

// Formatea un ISO string como "2025-07-29T23:59:00" a "Martes 29"
const formatEta = (iso: string): string => {
    const d = new Date(iso);
    return (
        new Intl.DateTimeFormat('es-MX', {
            weekday: 'long',
            day: 'numeric',
        }).format(d)
            .replace(/^\w/, c => c.toUpperCase())
    );
};

// Sucursales disponibles
const BRANCHES = [
    {
        id: 'alpuyeca',
        name: 'Sucursal Matriz Alpuyeca',
        address: 'REFACCIONES EL BOOM, Carr. Federal Mexico-Acapulco Km. 29, 62660 Puente de Ixtla, MORELOS',
        city: 'Alpuyeca',
        state: 'Morelos',
        postalCode: '62660'
    },
    {
        id: 'acapulco',
        name: 'Sucursal Acapulco',
        address: 'Refaccionaria EL BOOM, Avenida Lázaro Cárdenas, No. 2, Manzana 18. Colonia La Popular, Acapulco, Guerrero. C.P. 39700',
        city: 'Acapulco',
        state: 'Guerrero',
        postalCode: '39700'
    },
    {
        id: 'chilpancingo',
        name: 'Sucursal Chilpancingo',
        address: 'Refaccionaria EL BOOM, Boulevard Vicente Guerrero, Km 269, Chilpancingo, Guerrero. C.P. 39010',
        city: 'Chilpancingo',
        state: 'Guerrero',
        postalCode: '39010'
    },
    {
        id: 'tizoc',
        name: 'Sucursal Tizoc',
        address: 'Refaccionaria EL BOOM, Boulevard Cuauhnáhuac Km 3.5, No. 25. Colonia Buganbilias, Jiutepec, Morelos. C.P. 62560',
        city: 'Jiutepec',
        state: 'Morelos',
        postalCode: '62560'
    }
];

export function DetailsPurchase({ product }: DetailsPurchaseProps) {
    // Usar carrito real o simular carrito con un solo producto
    const { cartItems, totalPrice } = useShoppingCart();

    // Asegurar que todos los elementos del carrito tengan precios válidos
    const validatedCartItems = cartItems.map(item => ({
        ...item,
        price: typeof item.price === 'string' ? parseFloat(item.price) || 0 : (item.price || 0)
    }));

    // Crear un "carrito simulado" si se recibió un producto específico
    const displayItems = product
        ? [{
            ...product,
            quantity: 1,
            price: typeof product.price === 'string' ? parseFloat(product.price) || 0 : (product.price || 0)
        }]
        : validatedCartItems;

    // Calcular totales según el caso (producto único o carrito completo)
    const displayPrice = product
        ? (typeof product.price === 'string' ? parseFloat(product.price) || 0 : (product.price || 0))
        : totalPrice;


    // Estados para direcciones
    const [addresses, setAddresses] = useState<AddressData[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string>("");
    const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
    const [shipping, setShipping] = useState<{
        price: number;
        eta: string;
        freeShipping?: boolean;
        originalPrice?: number;
    } | null>(null);
    const [loadingShipping, setLoadingShipping] = useState(false);
    // Recoger en sucursal
    const [pickupAtStore, setPickupAtStore] = useState<boolean>(false);
    const [selectedBranch, setSelectedBranch] = useState<string>(BRANCHES[0].id);
    // Modal y campo de teléfono para recoger en sucursal
    const [showPhoneRequiredModal, setShowPhoneRequiredModal] = useState<boolean>(false);
    const [pickupPhone, setPickupPhone] = useState<string>("");
    const [pickupPhoneError, setPickupPhoneError] = useState<string>("");

    // Estado para controlar si la sección de productos está desplegada
    const [isProductsExpanded, setIsProductsExpanded] = useState<boolean>(false);

    // Estado para manejar errores
    const [error, setError] = useState<React.ReactNode | null>(null);

    // Estado para el botón de pago con tarjeta
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);


    const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
    const [invoiceDecisionMade, setInvoiceDecisionMade] = useState<boolean>(false);
    const [requiresInvoice, setRequiresInvoice] = useState<boolean>(false);
    const [invoiceRfc, setInvoiceRfc] = useState<string>('');
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [invoicePreviewUrl, setInvoicePreviewUrl] = useState<string>('');
    const [invoicePath, setInvoicePath] = useState<string>('');
    const [invoiceError, setInvoiceError] = useState<string | null>(null);
    const [invoiceUploading, setInvoiceUploading] = useState<boolean>(false);


    const postCheckout = async (opts?: {
        requiresInvoice?: boolean;
        rfc?: string;
        taxPath?: string;
    }) => {
        setIsRedirecting(true);
        setPaymentError(null);

        try {
            const requestBody: Record<string, unknown> = {
                amount: parseFloat((displayPrice + (pickupAtStore ? 0 : (shipping?.price || 0))).toString()),
                description: product ? `Compra rápida - ${product.name}` : "Compra desde carrito",
                return_url: `${window.location.origin}/payment-success`,
                cancel_url: `${window.location.origin}/payment-cancelled`,
                requires_invoice: !!opts?.requiresInvoice,
                pickup_in_store: pickupAtStore,
            };
            if (pickupAtStore) {
                requestBody.pickup_in_store = true;
                requestBody.branch_id = selectedBranch;
            } else if (selectedAddress) {
                requestBody.address_id = parseInt(selectedAddress, 10);
            }
            // En pickup, si el usuario capturó un teléfono válido aquí, mándalo
            if (pickupAtStore && isValidPhone10(pickupPhone)) {
                requestBody.phone = pickupPhone;
            }

            if (product) {
                requestBody.product_id = product.id_product;
                requestBody.quantity = product.quantity || 1;
            }
            if (opts?.requiresInvoice) {
                requestBody.rfc = opts.rfc;
                requestBody.tax_situation_document = opts.taxPath;
            }

            const response = await fetch("/api/create-openpay-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN":
                        document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
                body: JSON.stringify(requestBody),
            });

            const contentType = response.headers.get("content-type") || "";
            const data = contentType.includes("application/json") ? await response.json() : null;

            if (response.ok && data?.success && data?.checkout_url) {
                if (data.order_id) {
                    try {
                        sessionStorage.setItem('boom_openpay_expect_back', '1');
                        sessionStorage.setItem('boom_openpay_order_id', String(data.order_id));
                    } catch (_e) { /* ignore */ }
                }
                window.location.href = data.checkout_url;
            } else {
                setPaymentError(
                    data?.message || data?.error || `Error al crear sesión de pago (${response.status})`
                );
                setIsRedirecting(false);
            }
        } catch (_err) {
            setPaymentError("Ocurrió un error al iniciar el proceso de pago");
            setIsRedirecting(false);
        }
    };

    useEffect(() => {
        const isFromOpenpay = () => {
            try {
                const ref = document.referrer || '';
                return /openpay\./i.test(ref) || /openpay\b/i.test(ref);
            } catch (_e) { return false; }
        };
        const redirectIfExpectBack = () => {
            try {
                const expect = sessionStorage.getItem('boom_openpay_expect_back');
                const orderId = sessionStorage.getItem('boom_openpay_order_id');
                if (expect === '1' && orderId) {
                    sessionStorage.removeItem('boom_openpay_expect_back');
                    const url = `${window.location.origin}/payment-back-handler?order_id=${encodeURIComponent(orderId)}`;
                    window.location.replace(url);
                }
            } catch { /* ignore */ }
        };

        redirectIfExpectBack();
        if (isFromOpenpay()) {
            redirectIfExpectBack();
        }

        const onPageShow = (ev: PageTransitionEvent) => {
            if ((ev as { persisted?: boolean }).persisted) redirectIfExpectBack();
        };
        const onVisibility = () => {
            if (!document.hidden) {
                try {
                    const navEntries = (performance as unknown as { getEntriesByType?: (type: string) => PerformanceEntry[] }).getEntriesByType?.('navigation') || [];
                    const nav = navEntries[0] as unknown as { type?: string };
                    if (nav && nav.type === 'back_forward') {
                        redirectIfExpectBack();
                    }
                } catch (_e) { /* ignore */ }
            }
        };
        window.addEventListener('pageshow', onPageShow);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('pageshow', onPageShow);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, []);

    //Función para iniciar checkout con Openpay
    const handleOpenpayCheckout = async () => {
        if (!pickupAtStore && !selectedAddress) {
            alert("Por favor seleccione una dirección de envío");
            return;
        }
        const hasAnyValidPhone = addresses.some(a => isValidPhone10(a.phone)) || isValidPhone10(pickupPhone);
        if (pickupAtStore && !hasAnyValidPhone) {
            setShowPhoneRequiredModal(true);
            return;
        }
        if (!invoiceDecisionMade) {
            setShowInvoiceModal(true);
            return;
        }

        // Si NO requiere factura, dispara directamente
        if (!requiresInvoice) {
            await postCheckout({ requiresInvoice: false });
            return;
        }

        // Requiere factura: valida y manda con datos actuales
        if (!invoiceRfc?.trim() || !isValidRFC(invoiceRfc)) {
            setPaymentError("RFC inválido. Verifica el formato.");
            return;
        }
        if (!invoicePath) {
            setPaymentError("No se encontró la constancia subida. Intenta de nuevo.");
            return;
        }

        await postCheckout({
            requiresInvoice: true,
            rfc: invoiceRfc.trim(),
            taxPath: invoicePath,
        });
    };

    const uploadConstancia = async (file: File) => {
        setInvoiceError(null);
        setInvoiceUploading(true);
        try {
            const form = new FormData();
            form.append('constancia', file);

            const res = await fetch('/invoices/upload-constancia', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                body: form,
                credentials: 'include',
            });

            const data = await res.json() as { success: boolean; data: { path: string }; error?: string };
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'No se pudo subir la constancia');
            }
            // Guardamos SOLO la ruta para BD
            setInvoicePath(data.data.path);
            return data.data;
        } catch (e: unknown) {
            setInvoiceError((e as Error).message || 'Error subiendo constancia');
            return null;
        } finally {
            setInvoiceUploading(false);
        }
    };

    const handleInvoiceNo = () => {
        setRequiresInvoice(false);
        setInvoiceDecisionMade(true);
        setShowInvoiceModal(false);
        // Disparar checkout con parámetros explícitos
        postCheckout({ requiresInvoice: false }).catch(() => { });
    };

    const handleInvoiceYes = async () => {
        setInvoiceError(null);
        if (!invoiceRfc.trim() || !isValidRFC(invoiceRfc)) {
            setInvoiceError('RFC inválido. Verifica el formato.');
            return;
        }
        if (!invoiceFile) {
            setInvoiceError('Debes adjuntar la Constancia (PDF).');
            return;
        }
        const meta = await uploadConstancia(invoiceFile);
        if (!meta?.path) return;

        setRequiresInvoice(true);
        setInvoiceDecisionMade(true);
        setShowInvoiceModal(false);

        // Disparar checkout pasando datos explícitos recién obtenidos
        await postCheckout({
            requiresInvoice: true,
            rfc: invoiceRfc.trim(),
            taxPath: meta.path,
        });
    };

    const handleInvoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        setInvoiceFile(f || null);
        setInvoicePath('');
        if (f) {
            const url = URL.createObjectURL(f);
            setInvoicePreviewUrl(url);
        } else {
            setInvoicePreviewUrl('');
        }
    };

    const handleRemoveFromCart = React.useCallback(async (productId: number) => {
        try {
            const response = await fetch(`/cart/${productId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
            });
            if (response.ok) {
                window.location.reload();
            } else {
                /* silent fail */
            }
        } catch {
            /* silent fail */
        }
    }, []);

    // Fetch direcciones
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await fetch("/addresses", {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                    },
                });
                if (!response.ok) {
                    throw new Error("Error al obtener las direcciones");
                }
                const data = await response.json();
                const mapped: AddressData[] = data.map((a: {
                    id_direccion: number;
                    calle: string;
                    colonia: string;
                    numero_exterior: string;
                    numero_interior: string | null;
                    codigo_postal: string;
                    telefono: string;
                    referencia: string;
                    ciudad: string;
                    estado: string;
                }) => ({
                    id: a.id_direccion,
                    street: a.calle,
                    colony: a.colonia,
                    exteriorNumber: a.numero_exterior,
                    interiorNumber: a.numero_interior,
                    postalCode: a.codigo_postal,
                    phone: a.telefono,
                    reference: a.referencia,
                    city: a.ciudad,
                    state: a.estado,
                }));
                setAddresses(mapped);
            } catch {
                /* silent fail */
            }
        };
        fetchAddresses();
    }, []);

    const handleAddressChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const addressId = event.target.value;
        setSelectedAddress(addressId);
        setShipping(null);
        if (!addressId || pickupAtStore) return;
        await fetchShippingForAddress(addressId);
    };

    const fetchShippingForAddress = React.useCallback(async (addressId: string) => {
        if (!addressId) return;
        setLoadingShipping(true);
        try {
            if (product) {
                const res = await fetch(
                    `/dhl/rate?address_id=${addressId}&product_id=${product.id_product}&quantity=1`,
                    {
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                        credentials: "include"
                    }
                );
                const body = await res.json();
                if (body.success) {
                    setShipping({
                        price: body.data.price,
                        eta: body.data.eta,
                        freeShipping: body.data.free_shipping,
                        originalPrice: body.data.original_price,
                    });
                }
            } else {
                const res = await fetch("/api/dhl/rate-cart", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        address_id: parseInt(addressId, 10),
                        items: cartItems.map((i) => ({ id_product: i.id_product, quantity: i.quantity })),
                    }),
                });
                const body = await res.json();
                if (body.success) {
                    setShipping({
                        price: body.data.shipping_cost,
                        eta: body.data.eta,
                        freeShipping: body.data.free_shipping,
                        originalPrice: body.data.original_price,
                    });
                }
            }
        } catch {
            /* silent fail */
        } finally {
            setLoadingShipping(false);
        }
    }, [product, cartItems]);

    useEffect(() => {
        if (!pickupAtStore) {
            if (selectedAddress) {
                fetchShippingForAddress(selectedAddress);
            }
        } else {

            setShipping(null);
        }

    }, [pickupAtStore, selectedAddress, fetchShippingForAddress]);

    const handleRegisterClick = () => {
        setShowAddressForm(true);
    };

    const handleAddressRegistered = () => {
        setShowAddressForm(false);
        (async () => {
            try {
                const response = await fetch("/addresses", {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                    },
                });
                const data = await response.json();
                setAddresses(data.map((a: {
                    id_direccion: number;
                    calle: string;
                    colonia: string;
                    numero_exterior: string;
                    numero_interior: string | null;
                    codigo_postal: string;
                    telefono: string;
                    referencia: string;
                    ciudad: string;
                    estado: string;
                }) => ({
                    id: a.id_direccion,
                    street: a.calle,
                    colony: a.colonia,
                    exteriorNumber: a.numero_exterior,
                    interiorNumber: a.numero_interior,
                    postalCode: a.codigo_postal,
                    phone: a.telefono,
                    reference: a.referencia,
                    city: a.ciudad,
                    state: a.estado,
                })));
            } catch {
                /* silent fail */
            }
        })();
    };

    return (
        <div className="relative w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md flex flex-col p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
            {/* Encabezado con título principal y logo */}
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-600 pb-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                    {product ? "Confirmación de Compra" : "Resumen de tu carrito"}
                </h2>
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex flex-col overflow-y-auto">
                    <img
                        className="object-contain cursor-pointer max-w-full max-h-full"
                        src={document.documentElement.classList.contains('dark') ? '/images/logotipo-claro.png' : '/images/logotipo.png'}
                        alt="Logo"
                        onClick={() => window.location.href = '/dashboard'}
                    />
                </div>
            </div>

            {/* Sección para listar los productos*/}
            <div className="w-full cursor-pointer">
                <button
                    onClick={() => setIsProductsExpanded(!isProductsExpanded)}
                    className="w-full flex justify-between items-center font-bold cursor-pointer text-sm sm:text-base lg:text-lg mb-3 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-all"
                >
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                        </svg>
                        {product ? "Producto seleccionado:" : "Productos en el carrito:"}
                        <span className="ml-2 text-sm text-gray-500 cursor-pointer">({displayItems.length} {displayItems.length === 1 ? "producto" : "productos"})</span>
                    </div>
                    <div className="flex items-center cursor-pointer">
                        <span className="text-sm text-white mr-2 cursor-pointer">
                            {isProductsExpanded ? "Ocultar artículos" : "Ver artículos"}
                        </span>
                        {isProductsExpanded ? (
                            <ChevronUp className="h-5 w-5 dark:text-white text-blue-600 cursor-pointer" />
                        ) : (
                            <ChevronDown className="h-5 w-5 dark:text-white text-blue-600 cursor-pointer" />
                        )}
                    </div>
                </button>

                {isProductsExpanded && (
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                            {displayItems.map((item) => (
                                <li key={item.id_product} className="py-2 px-3 flex justify-between items-center text-sm hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors">
                                    <div className="flex items-center flex-1 min-w-0">
                                        <span className="font-medium text-gray-800 dark:text-white truncate" title={item.name}>{item.name}</span>
                                        {item.quantity && item.quantity > 1 && (
                                            <span className="ml-2 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs px-2 py-0.5 rounded-full">
                                                x{item.quantity}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-gray-500 dark:text-gray-300">
                                            {formatPrice(Number(item.price))} MXN C/U
                                        </span>
                                        {item.quantity && item.quantity > 1 && (
                                            <div className="text-sm font-medium mt-0.5 text-green-600 dark:text-green-400">
                                                Subtotal: {formatPrice(Number(item.price) * item.quantity)} MXN
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Sección para descripción adicional */}
            {product && (
                <div className="w-full bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                    <h5 className="font-bold text-sm sm:text-base lg:text-lg mb-2 flex items-center text-gray-800 dark:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Descripción de producto:
                    </h5>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-600/50 p-3 rounded-md">{product.description}</p>
                </div>
            )}

            {/* Mostrar mensaje de error si existe */}
            {error && (
                <div className="mb-4 text-xs sm:text-sm lg:text-base transform transition-all hover:scale-[1.01] focus:outline-none">
                    {error}
                </div>
            )}

            {/* Mostrar errores del proceso de pago */}
            {paymentError && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border-l-4 border-red-500 shadow-sm text-xs sm:text-sm lg:text-base flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p>{paymentError}</p>
                </div>
            )}

            {/* Selector de dirección y botones de pago */}
            <div className="grid grid-cols-1 w-full mb-6">
                <div className="bg-gray-50 dark:bg-gray-600/30 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-200">
                            Seleccionar dirección de envío:
                        </h5>
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                            <input
                                type="checkbox"
                                checked={pickupAtStore}
                                onChange={(e) => {
                                    const next = e.target.checked;
                                    setPickupAtStore(next);
                                    if (next) {
                                        setShipping(null);
                                        const hasAnyValidPhone = addresses.some(a => isValidPhone10(a.phone)) || isValidPhone10(pickupPhone);
                                        if (!hasAnyValidPhone) setShowPhoneRequiredModal(true);
                                    }
                                }}
                                className="h-4 w-4 cursor-pointer"
                            />
                            Recoger en sucursal
                        </label>
                    </div>
                    {!pickupAtStore && (
                        addresses.length > 0 ? (
                            <select
                                className="block w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm cursor-pointer focus:outline-none focus:border-blue-500 text-gray-700 dark:text-gray-200"
                                value={selectedAddress}
                                onChange={handleAddressChange}
                                disabled={pickupAtStore}
                            >
                                <option value="" disabled>Seleccione una dirección</option>
                                {addresses.map(address => (
                                    <option key={address.id} value={address.id.toString()}>
                                        {address.street}, {address.city}, {address.state}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div>
                                {/* Versión compacta para móvil */}
                                <div className="sm:hidden bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-md p-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-yellow-900 dark:text-yellow-200 text-[13px] leading-snug flex-1">
                                        <svg className="h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span>No tienes direcciones registradas. Agrega una para continuar.</span>
                                    </div>
                                    <Button
                                        onClick={handleRegisterClick}
                                        className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 text-xs rounded-md whitespace-nowrap">
                                        Agregar dirección
                                    </Button>
                                </div>

                                {/* Versión original para pantallas >= sm */}
                                <div className="hidden sm:block p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-md">
                                    <p className="text-sm lg:text-base">
                                        No cuentas con dirección registradas, para poder finalizar con tu proceso de compra debes de registrar una desde la configuración de perfil o dando clic en "Agregar dirección". <br />
                                        En caso de ya contar con direcciones registradas, y no visualizarlas, contacta a soporte
                                    </p>
                                    <button
                                        onClick={handleRegisterClick}
                                        className="inline-block ml-70 my-4 bg-none cursor-pointer hover:text-underline hover:text-[#FBCC13] text-black dark:text-white text-sm py-2 px-4 rounded">
                                        Agregar dirección
                                    </button>
                                </div>
                            </div>
                        )
                    )}

                    {pickupAtStore && (
                        <div className="mt-4 p-4 rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 text-sm text-gray-800 dark:text-gray-200">
                            <div className="flex items-start">
                                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1 1 0 01-1.414 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div>
                                    <p className="font-semibold mb-2">Selecciona la sucursal:</p>
                                    <select
                                        className="block w-full px-3 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:border-blue-500 text-gray-700 dark:text-gray-200"
                                        value={selectedBranch}
                                        onChange={(e) => setSelectedBranch(e.target.value)}
                                    >
                                        {BRANCHES.map(branch => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="font-semibold">Dirección de entrega:</p>
                                    <p>{BRANCHES.find(b => b.id === selectedBranch)?.name}</p>
                                    <p>{BRANCHES.find(b => b.id === selectedBranch)?.address}</p>
                                    {!(addresses.some(a => isValidPhone10(a.phone)) || isValidPhone10(pickupPhone)) ? (
                                        <div className="mt-3 p-3 rounded bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-xs">
                                            Para continuar, registra un número de teléfono de contacto.
                                            <div className="mt-2">
                                                <Button onClick={() => { setShowPhoneRequiredModal(true); }} className="bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer py-1 h-8">
                                                    Agregar teléfono
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        isValidPhone10(pickupPhone) && (
                                            <div className="mt-3 p-3 rounded bg-green-50 border-l-4 border-green-400 text-green-800 text-xs flex items-center justify-between">
                                                <div>
                                                    <span className="font-semibold">Teléfono de contacto:</span> {pickupPhone}
                                                </div>
                                                <button
                                                    onClick={() => setShowPhoneRequiredModal(true)}
                                                    className="text-blue-600 font-medium hover:underline"
                                                >
                                                    Cambiar
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Detalle de precios y totales */}
                <div className="flex flex-col w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-5 shadow-sm">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                        <Label>Total productos:</Label>
                        <span className="font-medium">{formatPrice(displayPrice)}</span>
                    </div>
                    <div className="flex justify-between mt-3 text-sm text-gray-600 dark:text-gray-300">
                        <Label>{pickupAtStore ? 'Entrega' : 'Costo envío:'}</Label>
                        <span className="font-medium">
                            {pickupAtStore
                                ? 'Recoger en sucursal (sin envío)'
                                : loadingShipping
                                    ? (<span className="text-[#FBCC13] animate-pulse">Calculando...</span>)
                                    : shipping
                                        ? (shipping.freeShipping
                                            ? (
                                                <span className="text-green-600 dark:text-green-400 font-bold flex items-center">
                                                    <span className="line-through text-gray-400 mr-2 text-xs">
                                                        {formatPrice(shipping.originalPrice || 0)}
                                                    </span>
                                                    ¡GRATIS!
                                                    <svg className="h-4 w-4 ml-1 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </span>
                                            )
                                            : formatPrice(shipping.price))
                                        : "---"}
                        </span>
                    </div>
                    {/* Información sobre envío gratuito */}
                    {shipping && shipping.freeShipping && (
                        <div className="mt-1 bg-green-50 dark:bg-green-900/20 p-2 rounded-md text-xs text-green-700 dark:text-green-300">
                            <div className="flex items-start">
                                <svg className="h-4 w-4 mr-1 mt-0.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Tu compra califica para envío gratuito por ser mayor a $2,000 MXN</span>
                            </div>
                        </div>
                    )}
                    {/* Mostrar tiempo de entrega formateado */}
                    {!pickupAtStore && (
                        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-300">
                            <Label>Tiempo estimado de llegada:</Label>
                            <span className="font-medium">
                                {loadingShipping ? (
                                    <span className="text-[#FBCC13] animate-pulse">Calculando...</span>
                                ) : shipping ? (
                                    formatEta(shipping.eta)
                                ) : (
                                    "---"
                                )}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between mt-4 pt-3 border-t-2 border-gray-200 dark:border-gray-600">
                        <Label className="text-lg font-bold text-gray-800 dark:text-white">Total a pagar:</Label>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatPrice(displayPrice + (pickupAtStore ? 0 : (shipping?.price || 0)))}
                        </span>
                    </div>
                </div>


                {!pickupAtStore && selectedAddress && !shipping && !loadingShipping && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-3 rounded mb-4">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                Hubo un error al calcular el costo de envío. Por favor, seleccione otra dirección o inténtelo de nuevo más tarde.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-6 mt-6">

                    <div className="flex-1 border border-gray-300 rounded-lg p-6 dark:border-gray-600 hover:border-green-600 dark:hover:border-green-600 transition-all duration-300 ease-in-out transform hover:-translate-y-1 ">
                        <div className="flex items-center mb-3">
                            <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="text-base font-medium text-gray-700 dark:text-gray-200">Pago con tarjeta</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Pago seguro con tarjetas de crédito o débito a través de la plataforma Openpay.
                        </p>
                        <Button
                            onClick={handleOpenpayCheckout}
                            disabled={((pickupAtStore ? !(addresses.some(a => isValidPhone10(a.phone)) || isValidPhone10(pickupPhone)) : (!selectedAddress || !shipping)) || isRedirecting || loadingShipping)}
                            className={`w-full bg-green-600 cursor-pointer text-white py-2.5 px-4 rounded text-sm ${(((pickupAtStore ? !(addresses.some(a => isValidPhone10(a.phone)) || isValidPhone10(pickupPhone)) : (!selectedAddress || !shipping)) || isRedirecting || loadingShipping) ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700")}`}
                        >
                            <span className="flex items-center justify-center">
                                {isRedirecting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </>
                                ) : loadingShipping ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Calculando envío...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Pagar con tarjeta
                                    </>
                                )}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Formulario para agregar nueva dirección */}
            {showAddressForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto shadow-xl">
                        <Address onRegisterSuccess={handleAddressRegistered} />
                        <div className="mt-4 text-right cursor-pointer">
                            <Button onClick={() => setShowAddressForm(false)}>Cancelar</Button>
                        </div>
                    </div>
                </div>
            )}

            {/**Modal facturación */}
            {showInvoiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                            ¿Requieres factura?
                        </h3>

                        {!requiresInvoice && !invoiceDecisionMade && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Antes de continuar con el pago, indícanos si necesitas factura.
                                </p>
                                <div className="flex gap-3">
                                    <Button onClick={() => setRequiresInvoice(true)} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                                        Sí, requiero factura
                                    </Button>
                                    <Button onClick={handleInvoiceNo} variant="outline" className="cursor-pointer">
                                        No, continuar sin factura
                                    </Button>
                                </div>
                            </div>
                        )}

                        {requiresInvoice && (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <Label className="block text-sm mb-1">RFC</Label>
                                    <input
                                        type="text"
                                        value={invoiceRfc}
                                        onChange={(e) => setInvoiceRfc(e.target.value.toUpperCase())}
                                        placeholder="XAXX010101000"
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Formato válido: 12–13 caracteres.</p>
                                </div>

                                <div>
                                    <Label className="block text-sm mb-1">Constancia de Situación Fiscal (PDF)</Label>
                                    <input type="file" accept="application/pdf" onChange={handleInvoiceFileChange} className="w-full text-sm" />
                                </div>

                                {invoicePreviewUrl && (
                                    <div className="mt-3 border rounded-lg overflow-hidden" style={{ height: '320px' }}>
                                        <object data={invoicePreviewUrl} type="application/pdf" width="100%" height="100%">
                                            <p className="p-3 text-sm">No se pudo previsualizar el PDF.</p>
                                        </object>
                                    </div>
                                )}

                                {invoiceError && (
                                    <div className="p-2 rounded bg-red-50 text-red-700 text-sm border-l-4 border-red-500">
                                        {invoiceError}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button onClick={() => { setRequiresInvoice(false); setShowInvoiceModal(false); }} variant="outline" className="cursor-pointer">Cancelar</Button>
                                    <Button onClick={handleInvoiceYes} disabled={invoiceUploading} className="bg-green-600 hover:bg-green-700 text-white cursor-pointer">
                                        {invoiceUploading ? 'Subiendo...' : 'Confirmar y continuar'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/** Modal para requerir teléfono antes de pagar en sucursal */}
            {showPhoneRequiredModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Agrega un teléfono de contacto</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            Para recoger en sucursal, necesitamos un número de teléfono de contacto.
                        </p>
                        <div className="mb-2">
                            <Label htmlFor="pickupPhone" className="block text-sm">Teléfono (10 dígitos)</Label>
                            <input
                                id="pickupPhone"
                                type="tel"
                                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
                                placeholder="5512345678"
                                value={pickupPhone}
                                onChange={(e) => { setPickupPhone(e.target.value); setPickupPhoneError(""); }}
                            />
                            {pickupPhoneError && (
                                <div className="text-red-600 text-xs mt-1">{pickupPhoneError}</div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="outline" className="cursor-pointer" onClick={() => setShowPhoneRequiredModal(false)}>Cancelar</Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" onClick={() => {
                                if (!isValidPhone10(pickupPhone)) { setPickupPhoneError('Ingresa un teléfono válido de 10 dígitos'); return; }
                                setShowPhoneRequiredModal(false);
                            }}>
                                Guardar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sección de métodos de pago aceptados */}
            <div className="w-full mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 text-center">
                    Métodos de pago aceptados
                </h5>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <div className="flex flex-col items-center">
                        <img
                            src="/images/cards1.png"
                            alt="Tarjetas de crédito aceptadas"
                            className="h-8 object-contain"
                        />
                    </div>
                    <div className="flex flex-col items-center">
                        <img
                            src="/images/cards2.png"
                            alt="Tarjetas de débito aceptadas"
                            className="h-8 object-contain"
                        />
                    </div>
                    <div className="flex flex-col items-center">
                        <img
                            src="/images/openpay.png"
                            alt="Openpay"
                            className="h-8 object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
