import { CheckoutStepper } from "./checkout/CheckoutStepper";
import { useShoppingCart } from "./shopping-car-context";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { Address } from "@/components/address";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { usePage } from "@inertiajs/react";

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

// Define CartItem type based on ProductData, ensuring price is number
interface CartItem extends ProductData {
    price: number; // Ensure price is always a number after validation
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
    const validatedCartItems: CartItem[] = cartItems.map(item => ({
        ...item,
        description: "",
        price: typeof item.price === 'string' ? parseFloat(item.price) || 0 : (item.price || 0)
    }));

    // Crear un "carrito simulado" si se recibió un producto específico
    const displayItems: CartItem[] = useMemo(() => product
        ? [{
            ...product,
            quantity: 1,
            price: typeof product.price === 'string' ? parseFloat(product.price) || 0 : (product.price || 0)
        }]
        : validatedCartItems, [product, validatedCartItems]);

    // Calcular totales según el caso (producto único o carrito completo)
    const displayPrice: number = useMemo(() => product
        ? (typeof product.price === 'string' ? parseFloat(product.price) || 0 : (product.price || 0))
        : totalPrice, [product, totalPrice]);


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

    const { auth } = usePage().props as unknown as { auth: { user: { id: number; name: string; email: string; } | null } };
    const user = auth?.user;
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");

    // Estado para controlar si la sección de productos está desplegada
    const [isProductsExpanded, setIsProductsExpanded] = useState<boolean>(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // ...existing code...

    // Estado para el botón de pago con tarjeta
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Stepper State
    const [currentStep, setCurrentStep] = useState(1);
    const steps = ["Resumen", "Envío", "Pago"];

    const handleNextStep = () => {
        setPaymentError(null);
        if (currentStep === 2) {
            // Validate step 2
            if (!user) {
                if (!guestName.trim()) {
                    setPaymentError("Por favor ingresa tu nombre completo.");
                    return;
                }
                if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
                    setPaymentError("Por favor ingresa un correo electrónico válido.");
                    return;
                }
            }
            if (pickupAtStore) {
                const hasAnyValidPhone = addresses.some(a => isValidPhone10(a.phone)) || isValidPhone10(pickupPhone);
                if (!hasAnyValidPhone) {
                    setShowPhoneRequiredModal(true);
                    return;
                }
            } else {
                if (!selectedAddress) {
                    setPaymentError("Por favor selecciona una dirección de envío.");
                    return;
                }
                if (!shipping && !loadingShipping) {
                    setPaymentError("No se ha podido calcular el envío. Intenta con otra dirección.");
                    return;
                }
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const handlePrevStep = () => {
        setPaymentError(null);
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };


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

            if (!user) {
                requestBody.guest_name = guestName;
                requestBody.guest_email = guestEmail;
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
                    } catch { /* ignore */ }
                }
                window.location.href = data.checkout_url;
            } else {
                setPaymentError(
                    data?.message || data?.error || `Error al crear sesión de pago (${response.status})`
                );
                setIsRedirecting(false);
            }
        } catch {
            setPaymentError("Ocurrió un error al iniciar el proceso de pago");
            setIsRedirecting(false);
        }
    };

    useEffect(() => {
        const isFromOpenpay = () => {
            try {
                const ref = document.referrer || '';
                return /openpay\./i.test(ref) || /openpay\b/i.test(ref);
            } catch { return false; }
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
                } catch { /* ignore */ }
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

        if (!user) {
            if (!guestName.trim()) {
                setPaymentError("Por favor ingresa tu nombre completo.");
                return;
            }
            if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
                setPaymentError("Por favor ingresa un correo electrónico válido.");
                return;
            }
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

    const fetchAddresses = async () => {
        try {
            console.log("DetailsPurchase - Attempting to fetch addresses...");
            const response = await fetch("/addresses", {
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
                credentials: 'include',
            });
            if (!response.ok) throw new Error("Error al obtener las direcciones");

            const data = await response.json();
            console.log("DetailsPurchase - Data received:", data);

            const mapped: AddressData[] = data.map((a: any) => ({
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

            const sorted = mapped.sort((a, b) => b.id - a.id);
            setAddresses(sorted);
            if (sorted.length > 0 && !selectedAddress) {
                setSelectedAddress(sorted[0].id.toString());
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
    };

    // Fetch direcciones on mount or user change
    useEffect(() => {
        fetchAddresses();
    }, [user]);

    // Recalcular shipping cuando cambia la dirección seleccionada, el carrito, o la recolección
    useEffect(() => {
        if (pickupAtStore) {
            setShipping(null);
            setLoadingShipping(false);
            return;
        }

        if (!selectedAddress || displayItems.length === 0) {
            setShipping(null);
            return;
        }

        const calculateShipping = async () => {
            setLoadingShipping(true);
            try {
                const response = await fetch("/api/dhl/rate-cart", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        address_id: parseInt(selectedAddress, 10),
                        items: displayItems.map((item: CartItem) => ({
                            id_product: item.id_product,
                            quantity: item.quantity
                        }))
                    }),
                });

                const data = await response.json();
                if (data.success) {
                    setShipping({
                        price: parseFloat(data.data.shipping_cost),
                        eta: data.data.eta,
                        freeShipping: data.data.free_shipping,
                        originalPrice: parseFloat(data.data.original_price || 0)
                    });
                } else {
                    setShipping(null);
                }
            } catch (error) {
                console.error("Error calculating shipping:", error);
                setShipping(null);
            } finally {
                setLoadingShipping(false);
            }
        };

        calculateShipping();
    }, [selectedAddress, displayItems, pickupAtStore]);

    const handleAddressRegistered = () => {
        setShowAddressForm(false);
        // Pequeño retraso para asegurar que la sesión se persista en BD antes de re-consultar
        setTimeout(() => {
            fetchAddresses();
        }, 500);
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAddress(e.target.value);
    };

    const handleRegisterClick = () => {
        setShowAddressForm(true);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header con botón de regreso */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => window.history.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Regresar
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finalizar Compra</h1>
                    <div className="w-24"></div> {/* Spacer for center alignment */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Columna Principal - Stepper y Contenido */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Stepper Component */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                            <CheckoutStepper currentStep={currentStep} steps={steps} />
                        </div>

                        {/* STEP 1: RESUMEN DE COMPRA */}
                        {currentStep === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                            <line x1="3" y1="6" x2="21" y2="6" />
                                            <path d="M16 10a4 4 0 0 1-8 0" />
                                        </svg>
                                        Resumen de Compra
                                    </h3>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    {/* Lista de productos */}
                                    <div className="p-4 space-y-4">
                                        {/* Primera fila siempre visible */}
                                        {displayItems.length > 0 && (
                                            <div className="flex gap-4 items-start">
                                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-white">
                                                    <img
                                                        src={displayItems[0].image || "/images/logotipo.png"}
                                                        alt={displayItems[0].name}
                                                        className="h-full w-full object-contain object-center p-1"
                                                    />
                                                </div>
                                                <div className="flex flex-1 flex-col">
                                                    <div>
                                                        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                                                            <h3 className="line-clamp-2">{displayItems[0].name}</h3>
                                                            <p className="ml-4 tabular-nums w-24 text-right">
                                                                {formatPrice(Number(displayItems[0].price))}
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{displayItems[0].description}</p>
                                                    </div>
                                                    <div className="flex flex-1 items-end justify-between text-sm">
                                                        <p className="text-gray-500 dark:text-gray-400 font-medium">Cant: {displayItems[0].quantity} pza(s)</p>
                                                        <div className="flex">
                                                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                                                {formatPrice(Number(displayItems[0].price) * (displayItems[0].quantity || 1))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Productos adicionales (Expandible) */}
                                        {displayItems.length > 1 && (
                                            <div className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${isProductsExpanded ? 'max-h-[1000px] opacity-100 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700' : 'max-h-0 opacity-0'}`}>
                                                {displayItems.slice(1).map((item: CartItem) => (
                                                    <div key={item.id_product} className="flex gap-4 items-start">
                                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-white">
                                                            <img
                                                                src={item.image || "/images/logotipo.png"}
                                                                alt={item.name}
                                                                className="h-full w-full object-contain object-center p-1"
                                                            />
                                                        </div>
                                                        <div className="flex flex-1 flex-col">
                                                            <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white">
                                                                <h3 className="line-clamp-1">{item.name}</h3>
                                                                <p className="ml-4 tabular-nums w-24 text-right">
                                                                    {formatPrice(Number(item.price))}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-1 items-end justify-between text-xs mt-1">
                                                                <p className="text-gray-500 dark:text-gray-400">Cant: {item.quantity}</p>
                                                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                                                    {formatPrice(Number(item.price) * (item.quantity || 1))}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Toggle Button */}
                                    {displayItems.length > 1 && (
                                        <button
                                            onClick={() => setIsProductsExpanded(!isProductsExpanded)}
                                            className="w-full py-2 bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-600 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1 border-t border-gray-100 dark:border-gray-700 cursor-pointer"
                                        >
                                            {isProductsExpanded ? (
                                                <>Ver menos productos <ChevronUp className="h-4 w-4" /></>
                                            ) : (
                                                <>Ver {displayItems.length - 1} productos más <ChevronDown className="h-4 w-4" /></>
                                            )}
                                        </button>
                                    )}

                                    {/* Total Footer */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal ({displayItems.reduce((acc: number, item: CartItem) => acc + (item.quantity || 1), 0)} productos)</span>
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(displayPrice)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 shadow-md">
                                        Siguiente: Dirección
                                        <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: DATOS DE ENVÍO */}
                        {currentStep === 2 && (
                            <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="10" r="3" />
                                            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
                                        </svg>
                                        Datos de Envío
                                    </h3>
                                    <Button variant="ghost" size="sm" onClick={handlePrevStep} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                        <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
                                    </Button>
                                </div>

                                {/* Formulario de invitado (si no hay user) */}
                                {!user && (
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
                                        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            Datos de contacto
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="guestName">Nombre completo *</Label>
                                                <Input
                                                    id="guestName"
                                                    value={guestName}
                                                    onChange={(e) => setGuestName(e.target.value)}
                                                    placeholder="Ej. Juan Pérez"
                                                    className="bg-white dark:bg-gray-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="guestEmail">Correo electrónico *</Label>
                                                <Input
                                                    id="guestEmail"
                                                    type="email"
                                                    value={guestEmail}
                                                    onChange={(e) => setGuestEmail(e.target.value)}
                                                    placeholder="ejemplo@correo.com"
                                                    className="bg-white dark:bg-gray-700"
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Enviaremos los detalles de tu pedido a este correo.
                                                </p>
                                            </div>
                                        </div>
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

                                    <div className="flex justify-end pt-4">
                                        <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 shadow-md">
                                            Siguiente: Pago
                                            <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Detalle de precios y totales */}
                        {/* STEP 3: PAGO */}
                        {currentStep === 3 && (
                            <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="5" width="20" height="14" rx="2" />
                                            <line x1="2" y1="10" x2="22" y2="10" />
                                        </svg>
                                        Resumen y Pago
                                    </h3>
                                    <Button variant="ghost" size="sm" onClick={handlePrevStep} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                        <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
                                    </Button>
                                </div>
                                <div className="space-y-4">
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
                                                            ? (shipping?.freeShipping
                                                                ? (
                                                                    <span className="text-green-600 dark:text-green-400 font-bold flex items-center">
                                                                        <span className="line-through text-gray-400 mr-2 text-xs">
                                                                            {formatPrice(shipping?.originalPrice || 0)}
                                                                        </span>
                                                                        ¡GRATIS!
                                                                        <svg className="h-4 w-4 ml-1 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </span>
                                                                )
                                                                : formatPrice(shipping?.price || 0))
                                                            : "---"}
                                            </span>
                                        </div>
                                        {/* Información sobre envío gratuito */}
                                        {shipping && shipping?.freeShipping && (
                                            <div className="mt-1 bg-green-50 dark:bg-green-900/20 p-2 rounded-md text-xs text-green-700 dark:text-green-300">
                                                <div className="flex items-start">
                                                    <svg className="h-4 w-4 mr-1 mt-0.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>Tu compra califica para envío gratuito por ser mayor a $1,000 MXN</span>
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

                                        {paymentError && (
                                            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded mb-4">
                                                <div className="flex items-center">
                                                    <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                    <p className="text-sm text-red-600 dark:text-red-400">
                                                        {paymentError}
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
                                </div>
                            </div>
                        )}

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
                                        src="/images/cards1.webp"
                                        alt="Logos de tarjetas de crédito aceptadas: Visa, Mastercard, American Express"
                                        className="h-8 object-contain"
                                    />
                                </div>
                                <div className="flex flex-col items-center">
                                    <img
                                        src="/images/cards2.webp"
                                        alt="Logos de tarjetas de débito aceptadas: Visa y Mastercard"
                                        className="h-8 object-contain"
                                    />
                                </div>
                                <div className="flex flex-col items-center">
                                    <img
                                        src="/images/openpay.png"
                                        alt="Logo de Openpay - Pasarela de pagos segura"
                                        className="h-8 object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}