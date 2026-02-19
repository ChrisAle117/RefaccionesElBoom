import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useShoppingCart } from './shopping-car-context';
import { Trash2, ShoppingCart, CreditCard, X, Truck, ArrowLeft, Loader2, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePage, Head } from '@inertiajs/react';
import { Address } from './address';
import { Button } from './ui/button';
import { Stepper } from './ui/stepper';
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type AddressDto = {
    id_direccion: number;
    calle: string;
    colonia: string;
    codigo_postal: string;
    ciudad: string;
    estado: string;
    numero_exterior: string;
    numero_interior: string | null;
    telefono: string;
    referencia: string;
};

type AddressMapped = {
    id: number;
    street: string;
    colony: string;
    postalCode: string;
    city: string;
    state: string;
    exteriorNumber: string;
    interiorNumber: string | null;
    phone: string;
    reference: string;
};

const toInt = (v: unknown, fallback = 0) => {
    const n = Number.parseInt(String(v), 10);
    return Number.isFinite(n) ? n : fallback;
};

// Validaciones
const isValidRFC = (rfc: string) => /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i.test(rfc.trim());
const isValidPhone10 = (phone?: string | null): boolean => {
    if (!phone) return false;
    const digits = (phone.match(/\d/g) || []).join("");
    return digits.length >= 10;
};

const AddressModal: React.FC<{ isOpen: boolean; onClose: () => void; onAddressAdded: () => void; }> = ({ isOpen, onClose, onAddressAdded }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto flex flex-col relative p-6">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    <X size={24} />
                </button>
                <Address onRegisterSuccess={() => { onAddressAdded(); onClose(); }} />
                <div className="mt-4 text-right">
                    <Button variant="outline" onClick={onClose} className="cursor-pointer">Cancelar</Button>
                </div>
            </div>
        </div>
    );
};

const Confetti: React.FC = () => {
    const colors = ['#FBCC13', '#006CFA', '#FF5733', '#33FF57', '#5733FF'];
    const particles = Array.from({ length: 40 });

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 1, x: '50vw', y: '50vh', scale: Math.random() * 0.5 + 0.5, rotate: 0 }}
                    animate={{ x: `${Math.random() * 100}vw`, y: `${Math.random() * 100}vh`, rotate: Math.random() * 360, opacity: 0 }}
                    transition={{ duration: Math.random() * 2 + 1, ease: "easeOut" }}
                    className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-sm"
                    style={{ backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}
                />
            ))}
        </div>
    );
};

// Sucursales para el paso 2
const BRANCHES = [
    { id: 'alpuyeca', name: 'Alpuyeca (Matriz)', address: 'Carr. Federal Mexico-Acapulco Km. 29, Puente de Ixtla, MOR' },
    { id: 'acapulco', name: 'Acapulco', address: 'Av. Lázaro Cárdenas No. 2, Col. La Popular, Acapulco, GRO' },
    { id: 'chilpancingo', name: 'Chilpancingo', address: 'Blvd. Vicente Guerrero Km 269, Chilpancingo, GRO' },
    { id: 'tizoc', name: 'Jiutepec (Tizoc)', address: 'Blvd. Cuauhnáhuac Km 3.5, Jiutepec, MOR' }
];

export function ShoppingCarView() {
    const authProps = usePage().props as unknown as { auth: { user: { id: number; name: string; email: string; } | null } };
    const user = authProps.auth?.user;
    const { cartItems, totalPrice, removeFromCart, updateItem } = useShoppingCart();
    const [currentStep, setCurrentStep] = useState(1);

    // Estados generales
    const [showDeleteMsg] = useState(false);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [inputValues, setInputValues] = useState<Record<number, string>>({});
    const [showMaxAlert, setShowMaxAlert] = useState<boolean>(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasReachedThreshold, setHasReachedThreshold] = useState(false);

    // Estados Dirección (Paso 2)
    const [addresses, setAddresses] = useState<AddressMapped[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [pickupAtStore, setPickupAtStore] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0].id);
    const [pickupPhone, setPickupPhone] = useState("");

    // Estados Checkout / Envío
    const [shipping, setShipping] = useState<{ price: number; eta: string, free_shipping?: boolean, original_price?: number } | null>(null);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [shippingError, setShippingError] = useState<string | null>(null);

    // Estados Pago / Invitado (Paso 3)
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [requiresInvoice, setRequiresInvoice] = useState(false);
    const [invoiceRfc, setInvoiceRfc] = useState('');
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [invoicePath, setInvoicePath] = useState('');
    const [invoiceUploading, setInvoiceUploading] = useState(false);
    const [invoiceError, setInvoiceError] = useState<string | null>(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);


    // Sincronización carrito
    const pendingUpdatesRef = useRef(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const trackUpdate = (promise: Promise<unknown>) => {
        pendingUpdatesRef.current += 1;
        setIsSyncing(true);
        promise.finally(() => {
            pendingUpdatesRef.current -= 1;
            if (pendingUpdatesRef.current === 0) setIsSyncing(false);
        });
    };

    const steps = [
        { id: 1, title: 'Carrito' },
        { id: 2, title: 'Datos y Envío' },
        { id: 3, title: 'Pago' },
        { id: 4, title: 'Confirmar' }
    ];

    const MIN_PURCHASE_FOR_FREE_SHIPPING = 1000;
    const totalUnits = cartItems.reduce((sum, item) => sum + toInt(item.quantity, 0), 0);
    const finalTotal = totalPrice + (pickupAtStore ? 0 : (shipping?.price || 0));

    useEffect(() => { window.scrollTo(0, 0); }, [currentStep]);

    // Inicializar cantidades
    useEffect(() => {
        const newQuantities: Record<number, number> = {};
        const newInputValues: Record<number, string> = {};
        cartItems.forEach(item => {
            const q = toInt(item.quantity, 1);
            newQuantities[item.id_product] = q;
            newInputValues[item.id_product] = String(q);
        });
        setQuantities(newQuantities);
        setInputValues(newInputValues);

        if (totalPrice >= MIN_PURCHASE_FOR_FREE_SHIPPING && !hasReachedThreshold && cartItems.length > 0) {
            setHasReachedThreshold(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        } else if (totalPrice < MIN_PURCHASE_FOR_FREE_SHIPPING) {
            setHasReachedThreshold(false);
        }
    }, [cartItems, totalPrice, hasReachedThreshold]);

    // Calcular costo de envío
    const calculateShipping = useCallback((addrId: string) => {
        if (!addrId || cartItems.length === 0) return;
        setLoadingShipping(true);
        setShippingError(null);
        setShipping(null);

        fetch('/api/dhl/rate-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            credentials: 'include',
            body: JSON.stringify({
                address_id: parseInt(addrId, 10),
                items: cartItems.map(i => ({ id_product: i.id_product, quantity: i.quantity })),
            }),
        })
            .then(res => res.json())
            .then(body => {
                if (body.success) {
                    setShipping({ price: body.data.shipping_cost, eta: body.data.eta, free_shipping: body.data.free_shipping, original_price: body.data.original_price });
                } else {
                    setShippingError('No fue posible cotizar el envío para esta dirección.');
                    setShipping({ price: 250, eta: 'Por definir (Estándar)', free_shipping: false }); // Fallback visual
                }
            })
            .catch(() => {
                setShippingError('Error de conexión. Se usará tarifa estándar.');
                setShipping({ price: 250, eta: 'Por definir (Estándar)', free_shipping: false });
            })
            .finally(() => setLoadingShipping(false));
    }, [cartItems]);

    // Cargar direcciones
    const fetchAddresses = useCallback(() => {
        if (!user) {
            setLoadingAddresses(false);
            return;
        }
        setLoadingAddresses(true);
        fetch('/addresses', {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
            credentials: 'include'
        })
            .then(res => res.json())
            .then(body => {
                const mapped = body.map((a: AddressDto) => ({
                    id: a.id_direccion,
                    street: a.calle,
                    colony: a.colonia,
                    postalCode: a.codigo_postal,
                    city: a.ciudad,
                    state: a.estado,
                    exteriorNumber: a.numero_exterior,
                    interiorNumber: a.numero_interior,
                    phone: a.telefono,
                    reference: a.referencia
                }));
                setAddresses(mapped);
                if (mapped.length > 0 && !selectedAddress) {
                    // Auto seleccionar la ultima
                    const last = mapped[mapped.length - 1];
                    setSelectedAddress(last.id.toString());
                    calculateShipping(last.id.toString());
                }
            })
            .catch(console.error)
            .finally(() => setLoadingAddresses(false));
    }, [user, calculateShipping, selectedAddress]);

    useEffect(() => { fetchAddresses(); }, [fetchAddresses]);





    const formatPrice = (price: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);

    // Lógica para avanzar pasos
    const handleNextStep = () => {
        if (currentStep === 1) {
            if (cartItems.length === 0) return;
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Validar paso 2
            if (!user) {
                if (!guestName.trim() || !guestEmail.trim()) {
                    alert("Por favor completa tu nombre y correo para continuar.");
                    return;
                }
            }
            if (pickupAtStore) {
                // Validar teléfono para pickup
                const hasValidPhone = user && addresses.some(a => isValidPhone10(a.phone)) ? true : isValidPhone10(pickupPhone);
                if (!hasValidPhone) {
                    alert("Se requiere un número de teléfono válido de 10 dígitos para recolección en tienda.");
                    setShowMaxAlert(true); // Re-use alert or create new one
                    return;
                }
            } else {
                if (!selectedAddress) {
                    alert("Por favor selecciona una dirección de envío o elige recoger en sucursal.");
                    return;
                }
            }
            setCurrentStep(3);
        } else if (currentStep === 3) {
            // Validar paso 3 (Factura)
            if (requiresInvoice) {
                if (!isValidRFC(invoiceRfc)) {
                    setInvoiceError("RFC inválido");
                    return;
                }
                if (!invoicePath && !invoiceFile) {
                    setInvoiceError("Debes subir tu constancia fiscal");
                    return;
                }
                if (!invoicePath && invoiceFile) {
                    // Intentar subir si no se ha subido
                    uploadConstancia(invoiceFile).then(path => {
                        if (path) setCurrentStep(4);
                    });
                    return;
                }
            }
            setCurrentStep(4);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    // Subida de factura
    const uploadConstancia = async (file: File) => {
        setInvoiceError(null);
        setInvoiceUploading(true);
        try {
            const form = new FormData();
            form.append('constancia', file);
            const res = await fetch('/invoices/upload-constancia', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '', 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body: form,
                credentials: 'include',
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Error al subir');
            setInvoicePath(data.data.path);
            return data.data.path;
        } catch (e: unknown) {
            setInvoiceError(e instanceof Error ? e.message : 'Error desconocido');
            return null;
        } finally {
            setInvoiceUploading(false);
        }
    };

    // PROCESAR PAGO FINAL
    const handleCheckout = async () => {
        setPaymentProcessing(true);
        setPaymentError(null);
        try {
            const requestBody: {
                amount: number;
                description: string;
                return_url: string;
                cancel_url: string;
                requires_invoice: boolean;
                pickup_in_store: boolean;
                items: { id: number; qty: number }[];
                branch_id?: string;
                phone?: string;
                address_id?: number;
                guest_name?: string;
                guest_email?: string;
                rfc?: string;
                tax_situation_document?: string;
            } = {
                amount: parseFloat(finalTotal.toString()),
                description: "Compra desde carrito - Refaccionaria El Boom",
                return_url: `${window.location.origin}/payment-success`,
                cancel_url: `${window.location.origin}/payment-cancelled`,
                requires_invoice: requiresInvoice,
                pickup_in_store: pickupAtStore,
                items: cartItems.map(i => ({ id: i.id_product, qty: i.quantity })) // Enviar detalle si el back lo soporta, o confiar en sesión
            };

            if (pickupAtStore) {
                requestBody.pickup_in_store = true;
                requestBody.branch_id = selectedBranch;
                if (pickupPhone) requestBody.phone = pickupPhone;
            } else {
                requestBody.address_id = parseInt(selectedAddress);
            }

            if (!user) {
                requestBody.guest_name = guestName;
                requestBody.guest_email = guestEmail;
            }

            if (requiresInvoice) {
                requestBody.rfc = invoiceRfc;
                requestBody.tax_situation_document = invoicePath;
            }

            const response = await fetch("/api/create-openpay-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();
            if (response.ok && data.success && data.checkout_url) {
                if (data.order_id) {
                    sessionStorage.setItem('boom_openpay_expect_back', '1');
                    sessionStorage.setItem('boom_openpay_order_id', String(data.order_id));
                }
                window.location.href = data.checkout_url;
            } else {
                setPaymentError(data.message || "Error al iniciar pago");
                setPaymentProcessing(false);
            }
        } catch {
            setPaymentError("Error de conexión");
            setPaymentProcessing(false);
        }
    };

    // Componentes de la UI intermedios...
    // (Reutilizando logic de QuantityControls del código original)
    const QuantityControls = ({ item, size = 'md' }: { item: typeof cartItems[0]; size?: 'sm' | 'md' }) => {
        const isSmall = size === 'sm';
        const handleChange = (val: string) => {
            const newValue = val.replace(/[^0-9]/g, '');
            setInputValues(v => ({ ...v, [item.id_product]: newValue }));
            const newQ = parseInt(newValue, 10);
            if (!isNaN(newQ) && newQ >= 1 && newQ <= item.disponibility) {
                setQuantities(q => ({ ...q, [item.id_product]: newQ }));
                trackUpdate(updateItem(item.id_product, newQ));
            }
        };
        const inc = () => {
            const curr = quantities[item.id_product] || item.quantity;
            if (curr < item.disponibility) {
                const n = curr + 1;
                setQuantities(q => ({ ...q, [item.id_product]: n }));
                setInputValues(v => ({ ...v, [item.id_product]: String(n) }));
                trackUpdate(updateItem(item.id_product, n));
            } else setShowMaxAlert(true);
        };
        const dec = () => {
            const curr = quantities[item.id_product] || item.quantity;
            if (curr > 1) {
                const n = curr - 1;
                setQuantities(q => ({ ...q, [item.id_product]: n }));
                setInputValues(v => ({ ...v, [item.id_product]: String(n) }));
                trackUpdate(updateItem(item.id_product, n));
            }
        };

        return (
            <div className={`flex items-center border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 shadow ${isSmall ? 'min-w-[100px]' : 'min-w-[120px]'} justify-center`}>
                <button onClick={dec} disabled={isSyncing} className="px-2 py-1 font-bold text-gray-600 dark:text-gray-400 hover:text-red-500 cursor-pointer">-</button>
                <input
                    type="text" inputMode="numeric"
                    value={inputValues[item.id_product] || item.quantity}
                    onChange={e => handleChange(e.target.value)}
                    className="w-10 text-center bg-transparent border-none focus:outline-none dark:text-white font-bold"
                />
                <button onClick={inc} disabled={isSyncing} className="px-2 py-1 font-bold text-gray-600 dark:text-gray-400 hover:text-green-500 cursor-pointer">+</button>
            </div>
        );
    };

    return (
        <div className="relative w-full mx-auto bg-white dark:bg-gray-900 min-h-screen pb-32">
            <Head title="Carrito de Compras | Refaccionaria El Boom" />
            <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>
            <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} onAddressAdded={fetchAddresses} />

            {showDeleteMsg && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-100 text-green-800 px-6 py-3 rounded-xl shadow-lg z-50">Producto eliminado</div>}
            {showMaxAlert && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-800 px-6 py-3 rounded-xl shadow-lg z-50">Límite de stock alcanzado</div>}

            {/* Header Sticky */}
            <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b-2 border-[#FBCC13] dark:border-gray-700 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => window.location.href = '/'} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-[#006CFA] font-bold transition-colors">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="hidden sm:inline">Seguir comprando</span>
                        </button>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{cartItems.length} artículos</p>
                            <p className="text-xl font-black text-[#006CFA] dark:text-[#FBCC13]">{formatPrice(finalTotal)}</p>
                        </div>
                    </div>
                    <Stepper steps={steps} currentStep={currentStep} className="mb-2" />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* ── PASO 1: CARRITO ── */}
                {currentStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                            <ShoppingCart className="text-[#FBCC13]" /> Tu Carrito
                        </h2>

                        {cartItems.length === 0 ? (
                            <div className="text-center py-10">
                                <ShoppingCart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
                                <Button className="mt-4 bg-[#006CFA] text-white cursor-pointer" onClick={() => window.location.href = '/'}>Ir a comprar</Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id_product} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center transition-all hover:shadow-md">
                                        <img src={item.image || '/images/logotipo.png'} alt={item.name} className="w-20 h-20 object-contain rounded bg-gray-50 p-1" />
                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="font-bold text-gray-800 dark:text-white">{item.name}</h3>
                                            <p className="text-sm text-gray-500">{formatPrice(Number(item.price))}</p>
                                        </div>
                                        <QuantityControls item={item} />
                                        <div className="text-right min-w-[100px]">
                                            <p className="font-bold text-[#006CFA] dark:text-[#FBCC13]">{formatPrice(Number(item.price) * item.quantity)}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id_product)} className="text-red-400 hover:text-red-600 p-2 cursor-pointer transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}

                                {/* Barra Envío Gratis */}
                                <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between text-sm font-bold mb-2 dark:text-gray-200">
                                        <span>Progreso envío gratis</span>
                                        <span className={totalPrice >= MIN_PURCHASE_FOR_FREE_SHIPPING ? "text-green-500" : ""}>{totalPrice >= MIN_PURCHASE_FOR_FREE_SHIPPING ? '¡Conseguido!' : formatPrice(MIN_PURCHASE_FOR_FREE_SHIPPING)}</span>
                                    </div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#FBCC13] to-[#006CFA]" style={{ width: `${Math.min(totalPrice / MIN_PURCHASE_FOR_FREE_SHIPPING * 100, 100)}%` }} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 text-center">Envío gratis en compras mayores a {formatPrice(MIN_PURCHASE_FOR_FREE_SHIPPING)} MXN</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── PASO 2: DATOS Y ENVIO ── */}
                {currentStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                            <Truck className="text-[#FBCC13]" /> Datos de Envío
                        </h2>

                        {/* Guest Form */}
                        {!user && (
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-800 mb-6">
                                <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-500" /> Datos de Contacto
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2 block">Nombre completo</Label>
                                        <Input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Ej. Juan Pérez" className="bg-white dark:bg-gray-700" />
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Correo electrónico</Label>
                                        <Input value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" className="bg-white dark:bg-gray-700" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <input type="checkbox" id="pickup" checked={pickupAtStore} onChange={e => setPickupAtStore(e.target.checked)} className="w-5 h-5 text-[#006CFA] cursor-pointer rounded focus:ring-[#006CFA]" />
                                <label htmlFor="pickup" className="font-bold text-gray-800 dark:text-white cursor-pointer select-none flex-1">Recoger en sucursal (Sin costo de envío)</label>
                            </div>

                            {!pickupAtStore ? (
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg dark:text-white">Dirección de Entrega</h3>
                                        <Button size="sm" variant="outline" onClick={() => setIsAddressModalOpen(true)} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">+ Nueva dirección</Button>
                                    </div>

                                    {loadingAddresses ? <Loader2 className="animate-spin mx-auto text-blue-500 my-4" /> : (
                                        addresses.length > 0 ? (
                                            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                                                {addresses.map(addr => (
                                                    <div key={addr.id}
                                                        onClick={() => { setSelectedAddress(addr.id.toString()); calculateShipping(addr.id.toString()); }}
                                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative ${selectedAddress === addr.id.toString() ? 'border-[#006CFA] bg-blue-50 dark:bg-blue-900/20 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="pr-8">
                                                                <p className="font-bold text-gray-800 dark:text-white">{addr.street} {addr.exteriorNumber} {addr.interiorNumber ? `Int. ${addr.interiorNumber}` : ''}</p>
                                                                <p className="text-sm text-gray-500">{addr.colony}, {addr.city}, {addr.state}</p>
                                                                <p className="text-xs text-gray-400 mt-1">CP: {addr.postalCode} • Tel: {addr.phone}</p>
                                                            </div>
                                                            {selectedAddress === addr.id.toString() && <CheckCircle className="text-[#006CFA] absolute top-4 right-4" />}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-lg dashed border-2 border-gray-200">
                                                <p className="mb-2">No tienes direcciones guardadas.</p>
                                                <Button size="sm" onClick={() => setIsAddressModalOpen(true)}>Agregar Dirección</Button>
                                            </div>
                                        )
                                    )}

                                    {/* Shipping Cost Display */}
                                    <div className="mt-6 pt-4 border-t dark:border-gray-700">
                                        {loadingShipping ? (
                                            <div className="flex items-center gap-2 text-blue-600 animate-pulse"><Loader2 className="w-4 h-4 animate-spin" /> Calculando costos de envío...</div>
                                        ) : shipping ? (
                                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                <div>
                                                    <p className="font-bold text-gray-700 dark:text-gray-300">Estándar (DHL)</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Entrega estimada: {shipping.eta}</p>
                                                </div>
                                                <span className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {shipping.free_shipping ? <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> GRATIS</span> : formatPrice(shipping.price)}
                                                </span>
                                            </div>
                                        ) : shippingError && (
                                            <p className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-100">{shippingError}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 space-y-4">
                                    <div>
                                        <Label className="mb-2 block">Selecciona Sucursal</Label>
                                        <select
                                            value={selectedBranch}
                                            onChange={e => setSelectedBranch(e.target.value)}
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-[#006CFA] outline-none transition-shadow"
                                        >
                                            {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                            <MapPin className="w-4 h-4 inline mr-1 -mt-0.5" />
                                            {BRANCHES.find(b => b.id === selectedBranch)?.address}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">Teléfono de contacto (10 dígitos)</Label>
                                        <Input
                                            value={pickupPhone}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setPickupPhone(val);
                                            }}
                                            placeholder="Ej. 7771234567"
                                            className="bg-white dark:bg-gray-700"
                                        />
                                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Te contactaremos a este número cuando el pedido esté listo.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── PASO 3: PAGO ── */}
                {currentStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                            <DollarSign className="text-[#FBCC13]" /> Facturación y Pago
                        </h2>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 mb-6">
                            <div className="flex items-center justify-between mb-4 cursor-pointer select-none p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors" onClick={() => setRequiresInvoice(!requiresInvoice)}>
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
                                                <Label className="mb-2 block">RFC (Personas: 13, Empresas: 12)</Label>
                                                <Input value={invoiceRfc} onChange={e => setInvoiceRfc(e.target.value.toUpperCase())} placeholder="XAXX010101000" className="uppercase bg-white dark:bg-gray-700 font-mono" maxLength={13} />
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">Constancia de Situación Fiscal (PDF)</Label>
                                                <div className="mt-1 flex items-center gap-3">
                                                    <Input type="file" accept=".pdf" onChange={e => setInvoiceFile(e.target.files?.[0] || null)} className="bg-white dark:bg-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#006CFA] file:text-white hover:file:bg-[#0055b3]" />
                                                    {invoicePath && <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" />}
                                                </div>
                                                {invoiceUploading && <p className="text-xs text-blue-500 mt-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Subiendo archivo...</p>}
                                            </div>
                                            {invoiceError && <p className="text-red-500 text-sm mt-3 font-bold bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2"><X className="w-4 h-4" /> {invoiceError}</p>}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-lg dark:text-white mb-4">Método de Pago</h3>
                            <div className="flex items-center gap-4 p-4 border border-[#006CFA] bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                                <CreditCard className="w-6 h-6 text-[#006CFA]" />
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-white">Tarjeta de Crédito / Débito</p>
                                    <p className="text-sm text-gray-500">Procesado de forma segura por OpenPay</p>
                                </div>
                                <CheckCircle className="w-6 h-6 text-[#006CFA] ml-auto" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── PASO 4: CONFIRMACIÓN ── */}
                {currentStep === 4 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-800 dark:text-white">¡Todo listo!</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Revisa los detalles antes de finalizar tu compra.</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 mb-20">
                            <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                <h3 className="font-bold text-lg dark:text-white mb-4">Resumen de Totales</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Subtotal ({totalUnits} productos):</span>
                                        <span className="font-bold dark:text-white">{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Envío ({pickupAtStore ? 'Recolección' : 'DHL Estándar'}):</span>
                                        <span className="font-bold dark:text-white">
                                            {pickupAtStore ? 'GRATIS' : (shipping?.free_shipping ? 'GRATIS' : formatPrice(shipping?.price || 0))}
                                        </span>
                                    </div>
                                    <div className="my-2 border-t border-gray-200 dark:border-gray-600"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-gray-800 dark:text-white text-lg">Total a Pagar:</span>
                                        <span className="font-black text-[#006CFA] dark:text-[#FBCC13] text-2xl">{formatPrice(finalTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold dark:text-white mb-2 text-sm uppercase tracking-wide text-gray-500">Detalles de Entrega</h4>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {pickupAtStore ? (
                                                <>
                                                    <span className="font-bold block text-[#006CFA] mb-1">Recoger en Sucursal</span>
                                                    {BRANCHES.find(b => b.id === selectedBranch)?.name}<br />
                                                    <span className="text-xs text-gray-500">{BRANCHES.find(b => b.id === selectedBranch)?.address}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-bold block text-[#006CFA] mb-1">Envío a Domicilio</span>
                                                    {addresses.find(a => a.id.toString() === selectedAddress)?.street} {addresses.find(a => a.id.toString() === selectedAddress)?.exteriorNumber}<br />
                                                    {addresses.find(a => a.id.toString() === selectedAddress)?.colony}, {addresses.find(a => a.id.toString() === selectedAddress)?.city}
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold dark:text-white mb-2 text-sm uppercase tracking-wide text-gray-500">Datos de Facturación</h4>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                        {requiresInvoice ? (
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-bold block text-green-600 mb-1">Factura Solicitada</span>
                                                RFC: <span className="font-mono">{invoiceRfc}</span><br />
                                                <span className="text-xs text-gray-500">Constancia adjuntada correctamente</span>
                                            </p>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No se requiere factura</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {paymentError && (
                            <div className="mt-4 mb-20 p-4 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500 shadow-sm flex items-start gap-3">
                                <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Error en el pago</p>
                                    <p className="text-sm">{paymentError}</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── FOOTER DE ACCIONES ── */}
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        {currentStep > 1 ? (
                            <Button variant="outline" onClick={handlePrevStep} className="cursor-pointer border-gray-300 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800">
                                Atrás
                            </Button>
                        ) : <div className="w-20"></div>}

                        <div className="flex-1 text-center sm:hidden">
                            <p className="font-black text-sm dark:text-white">Total: {formatPrice(finalTotal)}</p>
                        </div>

                        <Button
                            className={`flex-1 sm:max-w-xs font-bold text-lg shadow-lg transition-transform active:scale-95 ${currentStep === 4
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200 dark:shadow-none'
                                : 'bg-[#006CFA] dark:bg-[#FBCC13] text-white dark:text-black hover:bg-blue-700 dark:hover:bg-[#e0b610]'
                                }`}
                            onClick={currentStep === 4 ? handleCheckout : handleNextStep}
                            disabled={isSyncing || paymentProcessing || (currentStep === 1 && cartItems.length === 0)}
                        >
                            {paymentProcessing ? (
                                <><Loader2 className="animate-spin mr-2" /> Procesando...</>
                            ) : (
                                currentStep === 4 ? (
                                    <span className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Pagar Ahora</span>
                                ) : 'Siguiente'
                            )}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}