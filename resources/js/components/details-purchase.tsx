import { useShoppingCart } from "./shopping-car-context";
import { ArrowLeft, Truck, CreditCard, ShoppingCart, CheckCircle, MapPin, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { Address } from "@/components/address";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Stepper } from "./ui/stepper";
import { useToast } from "./ui/toast";

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
    price: number;
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
    const toast = useToast();

    // Asegurar que todos los elementos del carrito tengan precios válidos
    const validatedCartItems: CartItem[] = useMemo(() => {
        return cartItems.map(item => ({
            ...item,
            description: "",
            price: typeof item.price === 'string' ? parseFloat(item.price) || 0 : (item.price || 0)
        }));
    }, [cartItems]);

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
    // Campo de teléfono para recoger en sucursal / contacto invitado
    const [pickupPhone, setPickupPhone] = useState<string>("");
    const [pickupPhoneError, setPickupPhoneError] = useState<string>("");

    const { auth } = usePage().props as unknown as { auth: { user: { id: number; name: string; email: string; phone?: string; } | null } };
    const user = auth?.user;
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");

    // Estado para controlar si la sección de productos está desplegada
    const [isProductsExpanded, setIsProductsExpanded] = useState<boolean>(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Estado para el botón de pago con tarjeta
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Stepper State
    const [currentStep, setCurrentStep] = useState(1);

    const handleNextStep = () => {
        setPaymentError(null);
        if (currentStep === 2) {
            // Validar paso 2
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
                    setPaymentError("Por favor ingresa un teléfono de contacto de 10 dígitos.");
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
                let errorMsg = data?.message || data?.error || `Error al crear sesión de pago (${response.status})`;

                // Si hay detalles de validación, extraer el primero para mostrar al usuario
                if (data?.details && typeof data.details === 'object') {
                    const firstError = Object.values(data.details)[0];
                    if (Array.isArray(firstError) && firstError.length > 0) {
                        errorMsg = firstError[0];
                    }
                }

                setPaymentError(errorMsg);
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

    // Función para iniciar checkout con Openpay
    const handleOpenpayCheckout = async () => {
        if (!pickupAtStore && !selectedAddress) {
            toast.warning("Por favor selecciona una dirección de envío.");
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
        const hasAnyValidPhone = addresses.some(a => isValidPhone10(a.phone)) || user?.phone || isValidPhone10(pickupPhone);
        if (pickupAtStore && !hasAnyValidPhone) {
            setPaymentError("Por favor ingresa un teléfono de contacto de 10 dígitos en la sección de envío.");
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

            const mapped: AddressData[] = data.map((a: {
                id_direccion: number;
                calle: string;
                colonia: string;
                numero_exterior: string;
                numero_interior?: string;
                codigo_postal: string;
                telefono?: string;
                referencia?: string;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);


    // Recalcular shipping cuando cambia la dirección seleccionada, el carrito, o la recolección
    const displayItemsKey = useMemo(() => JSON.stringify(displayItems), [displayItems]);
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
    }, [selectedAddress, displayItemsKey, pickupAtStore, displayItems]);

    const handleAddressRegistered = () => {
        setShowAddressForm(false);
        setTimeout(() => {
            fetchAddresses();
        }, 500);
    };

    // Suppress unused var warnings
    void pickupPhoneError; void setPickupPhoneError;

    return (
        <div className="relative w-full mx-auto bg-white dark:bg-gray-900 min-h-screen pb-32">

            {/* Modal: Nueva Dirección */}
            <AnimatePresence>
                {showAddressForm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto flex flex-col relative p-6">
                            <button onClick={() => setShowAddressForm(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                                <X size={24} />
                            </button>
                            <Address onRegisterSuccess={handleAddressRegistered} />
                            <div className="mt-4 text-right">
                                <Button variant="outline" onClick={() => setShowAddressForm(false)} className="cursor-pointer">Cancelar</Button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Factura */}
            {showInvoiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-[#006CFA]" />
                            ¿Requieres factura?
                        </h3>

                        {!requiresInvoice && !invoiceDecisionMade && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Antes de continuar con el pago, indícanos si necesitas factura.
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    <Button onClick={() => setRequiresInvoice(true)} className="bg-[#006CFA] hover:bg-[#0055b3] text-white cursor-pointer">
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
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white uppercase font-mono"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Formato válido: 12–13 caracteres.</p>
                                </div>
                                <div>
                                    <Label className="block text-sm mb-1">Constancia de Situación Fiscal (PDF)</Label>
                                    <Input type="file" accept="application/pdf" onChange={handleInvoiceFileChange}
                                        className="bg-white dark:bg-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#006CFA] file:text-white hover:file:bg-[#0055b3]" />
                                </div>
                                {invoicePreviewUrl && (
                                    <div className="mt-3 border rounded-lg overflow-hidden" style={{ height: '280px' }}>
                                        <object data={invoicePreviewUrl} type="application/pdf" width="100%" height="100%">
                                            <p className="p-3 text-sm">No se pudo previsualizar el PDF.</p>
                                        </object>
                                    </div>
                                )}
                                {invoiceError && (
                                    <p className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-100 flex items-center gap-2">
                                        <X className="w-4 h-4" /> {invoiceError}
                                    </p>
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

            {/* ── Encabezado fijo ── */}
            <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b-2 border-[#FBCC13] dark:border-gray-700 shadow-sm transition-all duration-300">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-[#006CFA] font-bold transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="hidden sm:inline">Regresar</span>
                        </button>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {displayItems.reduce((acc: number, i: CartItem) => acc + (i.quantity || 1), 0)} artículo(s)
                            </p>
                            <p className="text-xl font-black text-[#006CFA] dark:text-[#FBCC13]">
                                {formatPrice(displayPrice + (pickupAtStore ? 0 : (shipping?.price || 0)))}
                            </p>
                        </div>
                    </div>
                    <Stepper
                        steps={[
                            { id: 1, title: 'Pedido' },
                            { id: 2, title: 'Envío' },
                            { id: 3, title: 'Confirmar' },
                        ]}
                        currentStep={currentStep}
                        className="mb-2"
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* ── PASO 1: RESUMEN ── */}
                {currentStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                            <ShoppingCart className="text-[#FBCC13]" /> Resumen de Compra
                        </h2>

                        {displayItems.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium">No hay productos para mostrar.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Primer producto siempre visible */}
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center">
                                    <img src={displayItems[0].image || '/images/logotipo.png'} alt={displayItems[0].name} className="w-20 h-20 object-contain rounded bg-gray-50 p-1" />
                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="font-bold text-gray-800 dark:text-white">{displayItems[0].name}</h3>
                                        <p className="text-sm text-gray-500">{formatPrice(Number(displayItems[0].price))}</p>
                                    </div>
                                    <div className="text-right min-w-[100px]">
                                        <p className="text-xs text-gray-400 mb-1">Cant: {displayItems[0].quantity || 1} pza(s)</p>
                                        <p className="font-bold text-[#006CFA] dark:text-[#FBCC13]">
                                            {formatPrice(Number(displayItems[0].price) * (displayItems[0].quantity || 1))}
                                        </p>
                                    </div>
                                </div>

                                {/* Productos adicionales (expandibles) */}
                                {displayItems.length > 1 && (
                                    <>
                                        <AnimatePresence>
                                            {isProductsExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden space-y-4"
                                                >
                                                    {displayItems.slice(1).map((item: CartItem) => (
                                                        <div key={item.id_product} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center">
                                                            <img src={item.image || '/images/logotipo.png'} alt={item.name} className="w-16 h-16 object-contain rounded bg-gray-50 p-1" />
                                                            <div className="flex-1 text-center sm:text-left">
                                                                <h3 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-1">{item.name}</h3>
                                                                <p className="text-xs text-gray-500">{formatPrice(Number(item.price))}</p>
                                                            </div>
                                                            <div className="text-right min-w-[90px]">
                                                                <p className="text-xs text-gray-400 mb-1">Cant: {item.quantity || 1}</p>
                                                                <p className="font-bold text-[#006CFA] dark:text-[#FBCC13] text-sm">
                                                                    {formatPrice(Number(item.price) * (item.quantity || 1))}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <button
                                            onClick={() => setIsProductsExpanded(!isProductsExpanded)}
                                            className="w-full py-2 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 font-medium hover:text-[#006CFA] dark:hover:text-[#FBCC13] transition-colors flex items-center justify-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                                        >
                                            {isProductsExpanded
                                                ? <><span>Ver menos</span><ChevronUp className="h-4 w-4" /></>
                                                : <><span>Ver {displayItems.length - 1} producto(s) más</span><ChevronDown className="h-4 w-4" /></>
                                            }
                                        </button>
                                    </>
                                )}

                                {/* Subtotal */}
                                <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <span className="font-medium text-gray-600 dark:text-gray-300">
                                        Subtotal ({displayItems.reduce((acc: number, i: CartItem) => acc + (i.quantity || 1), 0)} artículo(s))
                                    </span>
                                    <span className="text-xl font-black text-gray-900 dark:text-white">{formatPrice(displayPrice)}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-6">
                            <Button onClick={handleNextStep} className="bg-[#006CFA] hover:bg-[#0055b3] text-white px-8 py-2 rounded-xl shadow cursor-pointer">
                                Siguiente: Envío <ArrowLeft className="w-5 h-5 ml-2 rotate-180 inline" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* ── PASO 2: DATOS Y ENVÍO ── */}
                {currentStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                            <Truck className="text-[#FBCC13]" /> Datos de Envío
                        </h2>

                        {/* Formulario de contacto para invitados */}
                        {!user && (
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-800 mb-6">
                                <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-500" /> Datos de Contacto
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2 block">Nombre completo *</Label>
                                        <Input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Ej. Juan Pérez" className="bg-white dark:bg-gray-700" />
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Correo electrónico *</Label>
                                        <Input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" className="bg-white dark:bg-gray-700" />
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Teléfono de contacto *</Label>
                                        <Input
                                            type="tel"
                                            value={pickupPhone}
                                            onChange={e => setPickupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="5512345678"
                                            className="bg-white dark:bg-gray-700"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">10 dígitos requeridos.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Toggle: Recoger en sucursal */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <input
                                    type="checkbox"
                                    id="pickup"
                                    checked={pickupAtStore}
                                    onChange={e => { setPickupAtStore(e.target.checked); if (e.target.checked) setShipping(null); }}
                                    className="w-5 h-5 text-[#006CFA] cursor-pointer rounded focus:ring-[#006CFA]"
                                />
                                <label htmlFor="pickup" className="font-bold text-gray-800 dark:text-white cursor-pointer select-none flex-1">
                                    Recoger en sucursal (sin costo de envío)
                                </label>
                            </div>

                            {!pickupAtStore ? (
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg dark:text-white">Dirección de Entrega</h3>
                                        <Button size="sm" variant="outline" onClick={() => setShowAddressForm(true)} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                            + Nueva dirección
                                        </Button>
                                    </div>

                                    {addresses.length > 0 ? (
                                        <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                                            {addresses.map(addr => (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => setSelectedAddress(addr.id.toString())}
                                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative ${selectedAddress === addr.id.toString()
                                                        ? 'border-[#006CFA] bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="pr-8">
                                                            <p className="font-bold text-gray-800 dark:text-white">{addr.street} {addr.exteriorNumber}{addr.interiorNumber ? ` Int. ${addr.interiorNumber}` : ''}</p>
                                                            <p className="text-sm text-gray-500">{addr.colony}, {addr.city}, {addr.state}</p>
                                                            <p className="text-xs text-gray-400 mt-1">CP: {addr.postalCode} · Tel: {addr.phone}</p>
                                                        </div>
                                                        {selectedAddress === addr.id.toString() && <CheckCircle className="text-[#006CFA] absolute top-4 right-4" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200">
                                            <p className="mb-2">No tienes direcciones guardadas.</p>
                                            <Button size="sm" onClick={() => setShowAddressForm(true)}>Agregar Dirección</Button>
                                        </div>
                                    )}

                                    {/* Costo de envío */}
                                    {selectedAddress && (
                                        <div className="mt-6 pt-4 border-t dark:border-gray-700">
                                            {loadingShipping ? (
                                                <div className="flex items-center gap-2 text-[#006CFA] animate-pulse">
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Calculando costo de envío...
                                                </div>
                                            ) : shipping ? (
                                                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                    <div>
                                                        <p className="font-bold text-gray-700 dark:text-gray-300">Estándar (DHL)</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Entrega estimada: {formatEta(shipping.eta)}
                                                        </p>
                                                    </div>
                                                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                                                        {shipping.freeShipping
                                                            ? <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> GRATIS</span>
                                                            : formatPrice(shipping.price)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">Selecciona una dirección para calcular el envío.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Recoger en sucursal */
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 space-y-4">
                                    <div>
                                        <Label className="mb-2 block">Selecciona Sucursal</Label>
                                        <select
                                            value={selectedBranch}
                                            onChange={e => setSelectedBranch(e.target.value)}
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#006CFA] outline-none"
                                        >
                                            {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                            <MapPin className="w-4 h-4 inline mr-1 -mt-0.5" />
                                            {BRANCHES.find(b => b.id === selectedBranch)?.address}
                                        </div>
                                    </div>

                                    {user && !(addresses.some(a => isValidPhone10(a.phone)) || (user as { phone?: string }).phone) && (
                                        <div>
                                            <Label className="mb-2 block">Teléfono de contacto (10 dígitos)</Label>
                                            <Input
                                                value={pickupPhone}
                                                onChange={e => setPickupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                placeholder="Ej. 7771234567"
                                                className="bg-white dark:bg-gray-700"
                                            />
                                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Te contactaremos a este número cuando el pedido esté listo.
                                            </p>
                                        </div>
                                    )}
                                    {user && (addresses.some(a => isValidPhone10(a.phone)) || (user as { phone?: string }).phone) && (
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Usaremos el teléfono registrado en tu perfil.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {paymentError && (
                            <p className="mt-4 text-red-500 text-sm bg-red-50 p-3 rounded border border-red-100">{paymentError}</p>
                        )}

                        <div className="flex justify-between pt-6">
                            <Button variant="ghost" onClick={handlePrevStep} className="cursor-pointer text-gray-500 hover:text-gray-700">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
                            </Button>
                            <Button onClick={handleNextStep} className="bg-[#006CFA] hover:bg-[#0055b3] text-white px-8 py-2 rounded-xl shadow cursor-pointer">
                                Siguiente: Pago <ArrowLeft className="w-5 h-5 ml-2 rotate-180 inline" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* ── PASO 3: PAGO ── */}
                {currentStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                            <CreditCard className="text-[#FBCC13]" /> Facturación y Pago
                        </h2>

                        {/* Toggle: Factura */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 mb-6">
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer select-none p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                                onClick={() => setRequiresInvoice(!requiresInvoice)}
                            >
                                <h3 className="font-bold text-lg dark:text-white">¿Requiere Factura?</h3>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${requiresInvoice ? 'bg-[#006CFA]' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${requiresInvoice ? 'translate-x-6' : ''}`} />
                                </div>
                            </div>

                            <AnimatePresence>
                                {requiresInvoice && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4 pt-2">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="mb-4">
                                                <Label className="mb-2 block">RFC (Personas: 13 caracteres, Empresas: 12)</Label>
                                                <Input value={invoiceRfc} onChange={e => setInvoiceRfc(e.target.value.toUpperCase())} placeholder="XAXX010101000" className="uppercase bg-white dark:bg-gray-700 font-mono" maxLength={13} />
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Constancia de Situación Fiscal (PDF)</Label>
                                                <div className="mt-1 flex items-center gap-3">
                                                    <Input type="file" accept=".pdf" onChange={handleInvoiceFileChange}
                                                        className="bg-white dark:bg-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#006CFA] file:text-white hover:file:bg-[#0055b3]" />
                                                    {invoicePath && <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" />}
                                                </div>
                                                {invoiceUploading && <p className="text-xs text-[#006CFA] mt-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Subiendo archivo...</p>}
                                            </div>
                                            {invoiceError && <p className="text-red-500 text-sm mt-3 font-bold bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2"><X className="w-4 h-4" /> {invoiceError}</p>}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Resumen del pedido */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 mb-6">
                            <h3 className="font-bold text-lg dark:text-white mb-4">Resumen del Pedido</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                    <span>Subtotal ({displayItems.reduce((a: number, i: CartItem) => a + (i.quantity || 1), 0)} artículo(s))</span>
                                    <span className="font-medium">{formatPrice(displayPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                    <span>{pickupAtStore ? 'Entrega' : 'Envío'}</span>
                                    <span className="font-medium">
                                        {pickupAtStore ? (
                                            'Recoger en sucursal (sin costo)'
                                        ) : loadingShipping ? (
                                            <span className="text-[#FBCC13] animate-pulse">Calculando...</span>
                                        ) : shipping ? (
                                            shipping.freeShipping
                                                ? <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> GRATIS</span>
                                                : formatPrice(shipping.price)
                                        ) : '---'}
                                    </span>
                                </div>
                                {!pickupAtStore && shipping && (
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                        <span>Entrega estimada</span>
                                        <span className="font-medium">{formatEta(shipping.eta)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-3 border-t-2 border-gray-200 dark:border-gray-600">
                                    <span className="text-lg font-bold text-gray-800 dark:text-white">Total a pagar</span>
                                    <span className="text-lg font-bold text-[#006CFA] dark:text-[#FBCC13]">
                                        {formatPrice(displayPrice + (pickupAtStore ? 0 : (shipping?.price || 0)))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Método de pago */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-lg dark:text-white mb-4">Método de Pago</h3>
                            <div className="flex items-center gap-4 p-4 border border-[#006CFA] bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                                <CreditCard className="w-6 h-6 text-[#006CFA]" />
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-white">Tarjeta de Crédito / Débito</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Pago seguro vía OpenPay</p>
                                </div>
                            </div>

                            {paymentError && (
                                <p className="mt-4 text-red-500 text-sm bg-red-50 p-3 rounded border border-red-100 flex items-center gap-2">
                                    <X className="w-4 h-4" /> {paymentError}
                                </p>
                            )}

                            <Button
                                onClick={handleOpenpayCheckout}
                                disabled={isRedirecting || loadingShipping || (!pickupAtStore && (!selectedAddress || !shipping))}
                                className={`w-full mt-4 py-3 text-base font-bold rounded-xl cursor-pointer transition-all ${isRedirecting || loadingShipping ? 'bg-gray-400' : 'bg-[#006CFA] hover:bg-[#0055b3]'} text-white shadow-lg`}
                            >
                                {isRedirecting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Procesando...
                                    </span>
                                ) : loadingShipping ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Calculando envío...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <CreditCard className="w-5 h-5" />Proceder Al pago
                                    </span>
                                )}
                            </Button>

                            {/* Logos de métodos de pago */}
                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-center text-gray-400 mb-3">Métodos de pago aceptados</p>
                                <div className="flex items-center justify-center gap-6 flex-wrap">
                                    <img src="/images/cards1.webp" alt="Visa, Mastercard, American Express" className="h-8 object-contain" />
                                    <img src="/images/cards2.webp" alt="Tarjetas de débito" className="h-8 object-contain" />
                                    <img src="/images/openpay.png" alt="OpenPay" className="h-8 object-contain" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-start pt-6">
                            <Button variant="ghost" onClick={handlePrevStep} className="cursor-pointer text-gray-500 hover:text-gray-700">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
