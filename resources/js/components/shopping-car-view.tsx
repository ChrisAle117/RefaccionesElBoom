import React, { useState, useEffect } from 'react';
import { useShoppingCart } from './shopping-car-context';
import { Trash2, ShoppingCart, CreditCard, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TbTruckDelivery } from 'react-icons/tb';
import { router } from '@inertiajs/react';
import { Address } from './address';
import { Button } from './ui/button';

type AddressDto = {
    id_direccion: number;
    calle: string;
    colonia: string;
    codigo_postal: string;
    ciudad: string;
    estado: string;
};

const toInt = (v: unknown, fallback = 0) => {
    const n = Number.parseInt(String(v), 10);
    return Number.isFinite(n) ? n : fallback;
};

const AddressModal: React.FC<{ isOpen: boolean; onClose: () => void; onAddressAdded: () => void; }> = ({ isOpen, onClose, onAddressAdded }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto flex flex-col relative p-6">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    <X size={24} />
                </button>
                {/* Formulario embebido para registrar dirección */}
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
                    initial={{
                        opacity: 1,
                        x: '50vw',
                        y: '50vh',
                        scale: Math.random() * 0.5 + 0.5,
                        rotate: 0
                    }}
                    animate={{
                        x: `${Math.random() * 100}vw`,
                        y: `${Math.random() * 100}vh`,
                        rotate: Math.random() * 360,
                        opacity: 0
                    }}
                    transition={{
                        duration: Math.random() * 2 + 1,
                        ease: "easeOut"
                    }}
                    className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-sm"
                    style={{ backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}
                />
            ))}
        </div>
    );
};

export function ShoppingCarView() {
    const { cartItems, totalPrice, removeFromCart, updateItem } = useShoppingCart();
    const [showDeleteMsg, setShowDeleteMsg] = useState(false);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [inputValues, setInputValues] = useState<Record<number, string>>({});
    const [showMaxAlert, setShowMaxAlert] = useState<boolean>(false);
    const [showShippingOptions, setShowShippingOptions] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [addresses, setAddresses] = useState<AddressDto[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [shipping, setShipping] = useState<{ price: number; eta: string, free_shipping?: boolean, original_price?: number } | null>(null);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [shippingError, setShippingError] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasReachedThreshold, setHasReachedThreshold] = useState(false);

    const finalTotal = totalPrice + (shipping?.price || 0);

    //envío gratis
    const MIN_PURCHASE_FOR_FREE_SHIPPING = 1000;

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

        // Lógica de confeti por primera vez al llegar al umbral
        if (totalPrice >= MIN_PURCHASE_FOR_FREE_SHIPPING && !hasReachedThreshold && cartItems.length > 0) {
            setHasReachedThreshold(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        } else if (totalPrice < MIN_PURCHASE_FOR_FREE_SHIPPING) {
            setHasReachedThreshold(false);
        }
    }, [cartItems, totalPrice, hasReachedThreshold]);

    useEffect(() => {
        fetch('/addresses', {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
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
                }));
                setAddresses(mapped);
            })
            .catch(err => {
                console.error('Error fetching addresses:', err);
            })
            .finally(() => setLoadingAddresses(false));
    }, []);

    const handleAddressAdded = () => {
        // Recargar la lista de direcciones desde el servidor
        setLoadingAddresses(true);
        fetch('/addresses', {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            credentials: 'include'
        })
            .then(res => res.json())
            .then(body => {
                const mapped = body.map((a: AddressDto) => ({ id: a.id_direccion, street: a.calle, colony: a.colonia, postalCode: a.codigo_postal, city: a.ciudad, state: a.estado }));
                setAddresses(mapped);
                // Seleccionar la dirección recién agregada (la última de la lista)
                if (mapped.length > 0) {
                    const newAddressId = mapped[mapped.length - 1].id.toString();
                    setSelectedAddress(newAddressId);
                    handleAddressChange({ target: { value: newAddressId } } as React.ChangeEvent<HTMLSelectElement>);
                }
            })
            .finally(() => setLoadingAddresses(false));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const addrId = e.target.value;
        setSelectedAddress(addrId);
        setShipping(null);
        setShippingError(null);
        if (!addrId || cartItems.length === 0) return;

        setLoadingShipping(true);
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
                }
            })
            .catch(() => setShippingError('Error al conectar con el servicio de envío.'))
            .finally(() => setLoadingShipping(false));
    };

    // Calcular el total de unidades de productos en el carrito
    const totalUnits = cartItems.reduce((sum, item) => sum + toInt(item.quantity, 0), 0);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
    };

    return (
        <div className="relative w-full mx-auto bg-white dark:bg-gray-900 min-h-screen pb-20">
            <AnimatePresence>
                {showConfetti && <Confetti />}
            </AnimatePresence>
            {/* Mensaje de producto eliminado */}
            {showDeleteMsg && (
                <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-6 py-3 rounded-xl shadow-lg z-50 pointer-events-none transition-opacity duration-700 ${showDeleteMsg ? 'opacity-100' : 'opacity-0'}`}>
                    Producto eliminado
                </div>
            )}

            {/* Alerta de cantidad máxima */}
            {showMaxAlert && (
                <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-6 py-3 rounded-xl shadow-lg z-50 pointer-events-none transition-opacity duration-700 ${showMaxAlert ? 'opacity-100' : 'opacity-0'}`}>
                    Has alcanzado el límite máximo de unidades disponibles
                </div>
            )}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-white to-transparent dark:from-gray-900 dark:to-gray-800 backdrop-blur-md p-6 border-b-2 border-[#FBCC13] dark:border-gray-700 shadow-lg rounded-b-xl hidden sm:block w-full">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-2xl font-extrabold text-black dark:text-white flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6" /> Carrito de compras
                    </h2>
                    <span className="text-lg font-bold text-black dark:text-white  px-4 py-2 rounded shadow border-none">Cantidad: {totalUnits}</span>
                    <h3 className="text-lg font-bold text-black dark:text-white px-4 py-2 rounded shadow">Total: {formatPrice(finalTotal)}</h3>
                    <button
                        onClick={() => setShowShippingOptions(!showShippingOptions)}
                        className="flex items-center gap-2 text-lg font-bold text-black dark:text-white px-4 py-2 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border-none"
                    >
                        <TbTruckDelivery className="h-6 w-6 text-blue-500 cursor-pointer" />
                        Mis direcciones para envío
                        <ChevronDown className={`h-5 w-5 transition-transform ${showShippingOptions ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Opciones de envío desplegables */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showShippingOptions ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
                        {loadingAddresses ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">Cargando direcciones...</p>
                        ) : addresses.length > 0 ? (
                            <select
                                className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                                value={selectedAddress}
                                onChange={handleAddressChange}
                            >
                                <option value="">Selecciona una dirección para cotizar envío</option>
                                {addresses.map(a => (
                                    <option key={a.id} value={a.id.toString()}>
                                        {a.street}, {a.colony}, {a.postalCode}, {a.city}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400">No tienes direcciones guardadas. <button onClick={() => setIsAddressModalOpen(true)} className="text-blue-600 hover:underline font-semibold cursor-pointer">Agrega una</button> para cotizar el envío.</p>
                        )}

                        {loadingShipping && <p className="mt-3 text-sm text-blue-600 dark:text-blue-400 animate-pulse">Calculando envío...</p>}
                        {shippingError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{shippingError}</p>}

                        {shipping && (
                            <p className="mt-3 text-sm text-gray-800 dark:text-gray-200">
                                Costo de envío: {shipping.free_shipping ? <span className="font-bold text-green-600 dark:text-green-400">¡GRATIS!</span> : formatPrice(shipping.price)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Barra de progreso para envío gratis*/}
                <div className="mt-16 w-full">
                    {/* Camión sobre la barra */}
                    <div className="relative w-full mb-6">
                        <div
                            className="absolute z-10"
                            style={{
                                left: `${Math.max(Math.min(totalPrice / MIN_PURCHASE_FOR_FREE_SHIPPING * 100, 100), 7)}%`,
                                bottom: '100%',
                                transform: 'translateX(-50%)'
                            }}
                        >
                            <img
                                src="/images/trailer.png"
                                width="100"
                                height="100"
                                alt="Camión de entrega"
                                className={`${totalPrice >= MIN_PURCHASE_FOR_FREE_SHIPPING ? 'animate-bounce' : ''}`}
                                style={{ marginBottom: '4px' }}
                            />
                        </div>
                        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#FBCC13] to-[#006CFA] dark:from-[#006CFA] dark:to-[#FBCC13] rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(totalPrice / MIN_PURCHASE_FOR_FREE_SHIPPING * 100, 100)}%` }}
                            >
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 text-sm">
                            <span className="text-black dark:text-white font-medium">
                                {totalPrice >= MIN_PURCHASE_FOR_FREE_SHIPPING
                                    ? '¡Felicidades! Tienes envío gratis'
                                    : `Faltan ${formatPrice(MIN_PURCHASE_FOR_FREE_SHIPPING - totalPrice)} para envío gratis`
                                }
                            </span>
                            <span className="text-black dark:text-white font-semibold">{formatPrice(MIN_PURCHASE_FOR_FREE_SHIPPING)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sticky top-0 z-10 bg-gradient-to-b from-white to-transparent dark:from-gray-900 dark:to-gray-800 backdrop-blur-md p-4 border-b-2 border-[#FBCC13] dark:border-gray-700 shadow-lg rounded-b-xl sm:hidden w-full">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl font-extrabold text-black dark:text-white flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Carrito</span>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                        <span className="text-base font-bold text-black dark:text-white bg-[#FBCC13] dark:bg-[#006CFA] px-3 py-1 rounded shadow">Cantidad: {totalUnits}</span>
                        <span className="text-base font-bold text-[#006CFA] dark:text-[#FBCC13] bg-[#FBCC13] dark:bg-[#006CFA] px-3 py-1 rounded shadow">Total: {formatPrice(finalTotal)}</span>
                    </div>
                    <div className="mt-3">
                        <button
                            onClick={() => setShowShippingOptions(!showShippingOptions)}
                            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-black dark:text-white px-3 py-2 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600"
                        >
                            <TbTruckDelivery className="h-5 w-5 text-blue-500" />
                            Mis direcciones para envío
                            <ChevronDown className={`h-4 w-4 transition-transform ${showShippingOptions ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
                {/* Opciones de envío desplegables (móvil) */}
                <div className={`sm:hidden transition-all duration-300 ease-in-out overflow-hidden ${showShippingOptions ? 'max-h-96 pt-3' : 'max-h-0'}`}>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
                        {loadingAddresses ? (
                            <p className="text-xs text-gray-600 dark:text-gray-400">Cargando direcciones...</p>
                        ) : addresses.length > 0 ? (
                            <select
                                className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                                value={selectedAddress}
                                onChange={handleAddressChange}
                            >
                                <option value="">Selecciona una dirección</option>
                                {addresses.map(a => (
                                    <option key={a.id} value={a.id.toString()}>{a.street}, {a.postalCode}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-xs text-gray-600 dark:text-gray-400">No tienes direcciones. <button onClick={() => setIsAddressModalOpen(true)} className="text-blue-600 hover:underline font-semibold cursor-pointer">Agrega una</button></p>
                        )}
                        {loadingShipping && <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 animate-pulse">Calculando envío...</p>}
                        {shippingError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{shippingError}</p>}
                        {shipping && <p className="mt-2 text-xs text-gray-800 dark:text-gray-200">Costo: {shipping.free_shipping ? <span className="font-bold text-green-600 dark:text-green-400">¡GRATIS!</span> : formatPrice(shipping.price)}</p>}
                    </div>
                </div>
            </div>
            <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} onAddressAdded={handleAddressAdded} />
            {cartItems.length === 0 ? (
                <div className="p-8 text-center text-black dark:text-white flex flex-col items-center justify-center">
                    <ShoppingCart className="h-24 w-24 mb-4 text-gray-400" />
                    <p className="text-lg font-semibold">No hay productos en el carrito.</p>
                </div>
            ) : (
                <ul className="mt-4 flex flex-col gap-6 px-4">
                    {cartItems.map((item) => (
                        <li key={item.id_product} className="">
                            <div className="flex flex-row p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-[#FBCC13] dark:border-[#006CFA] max-sm:hidden w-full transition-transform hover:scale-[1.01] items-center gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <img className="w-24 h-24 object-contain rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" src={item.image || (document.documentElement.classList.contains('dark') ? '/images/logotipo-claro.png' : '/images/logotipo.png')} alt={item.name} />
                                    <div>
                                        <h3 className="text-lg font-bold text-black dark:text-white mb-1">
                                            {item.name} <span className="text-gray-500 dark:text-gray-400">(x{item.quantity})</span>
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Precio unidad: <span className="font-bold">{formatPrice(Number(item.price))}</span></p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Disponibles: <span className="font-bold">{item.disponibility}</span></p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2 justify-center">
                                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 shadow min-w-[140px] justify-center">
                                        <button
                                            onClick={() => {
                                                const currentQuantity = toInt(quantities[item.id_product] ?? item.quantity, 1);
                                                if (currentQuantity > 1) {
                                                    const newQuantity = currentQuantity - 1;
                                                    setQuantities({
                                                        ...quantities,
                                                        [item.id_product]: newQuantity
                                                    });
                                                    setInputValues({
                                                        ...inputValues,
                                                        [item.id_product]: newQuantity.toString()
                                                    });
                                                    updateItem(item.id_product, newQuantity).catch(() => {
                                                        alert('No se pudo actualizar la cantidad del producto. Inténtalo de nuevo.');
                                                        setQuantities({
                                                            ...quantities,
                                                            [item.id_product]: currentQuantity
                                                        });
                                                        setInputValues({
                                                            ...inputValues,
                                                            [item.id_product]: currentQuantity.toString()
                                                        });
                                                    });
                                                }
                                            }}
                                            className="px-3 py-2 text-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-red-300 dark:hover:bg-red-500 hover:text-black dark:hover:text-white rounded-l-lg transition-colors duration-200 cursor-pointer flex items-center"
                                            aria-label="Disminuir cantidad"
                                        >
                                            <span>-</span>
                                        </button>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={inputValues[item.id_product] || item.quantity.toString()}
                                            onClick={(e) => {
                                                e.currentTarget.select();
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.select();
                                            }}
                                            onChange={(e) => {
                                                const newValue = e.target.value.replace(/[^0-9]/g, '');
                                                setInputValues({
                                                    ...inputValues,
                                                    [item.id_product]: newValue
                                                });
                                                const newQuantity = parseInt(newValue, 10);
                                                if (!isNaN(newQuantity)) {
                                                    if (newQuantity > item.disponibility) {
                                                        setShowMaxAlert(true);
                                                        setTimeout(() => setShowMaxAlert(false), 3000);
                                                    } else {
                                                        setQuantities({
                                                            ...quantities,
                                                            [item.id_product]: newQuantity || 1
                                                        });
                                                        if (newQuantity >= 1 && newQuantity <= item.disponibility) {
                                                            updateItem(item.id_product, newQuantity);
                                                        }
                                                    }
                                                }
                                            }}
                                            onBlur={() => {
                                                const currentValue = inputValues[item.id_product] || '1';
                                                let newQuantity = parseInt(currentValue, 10);
                                                if (isNaN(newQuantity) || newQuantity < 1) {
                                                    newQuantity = 1;
                                                }
                                                if (newQuantity > item.disponibility) {
                                                    newQuantity = item.disponibility;
                                                    setShowMaxAlert(true);
                                                    setTimeout(() => setShowMaxAlert(false), 3000);
                                                }
                                                setInputValues({
                                                    ...inputValues,
                                                    [item.id_product]: newQuantity.toString()
                                                });
                                                setQuantities({
                                                    ...quantities,
                                                    [item.id_product]: newQuantity
                                                });
                                                updateItem(item.id_product, newQuantity);
                                            }}
                                            className="w-16 px-2 py-2 text-lg font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 text-center border-none focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                                            aria-label="Cantidad"
                                        />
                                        <button
                                            onClick={() => {
                                                const currentQuantity = toInt(quantities[item.id_product] ?? item.quantity, 1);
                                                if (currentQuantity < item.disponibility) {
                                                    const newQuantity = currentQuantity + 1;
                                                    setQuantities({
                                                        ...quantities,
                                                        [item.id_product]: newQuantity
                                                    });
                                                    setInputValues({
                                                        ...inputValues,
                                                        [item.id_product]: newQuantity.toString()
                                                    });
                                                    updateItem(item.id_product, newQuantity).catch(() => {
                                                        alert('No se pudo actualizar la cantidad del producto. Inténtalo de nuevo.');
                                                        setQuantities({
                                                            ...quantities,
                                                            [item.id_product]: currentQuantity
                                                        });
                                                        setInputValues({
                                                            ...inputValues,
                                                            [item.id_product]: currentQuantity.toString()
                                                        });
                                                    });
                                                } else {
                                                    setShowMaxAlert(true);
                                                    setTimeout(() => setShowMaxAlert(false), 3000);
                                                }
                                            }}
                                            className="px-3 py-2 text-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-green-300 dark:hover:bg-green-500 hover:text-black dark:hover:text-white rounded-r-lg transition-colors duration-200 cursor-pointer flex items-center"
                                            aria-label="Aumentar cantidad"
                                        >
                                            <span>+</span>
                                        </button>
                                    </div>
                                    <p className="text-base font-bold text-[#006CFA] dark:text-[#FBCC13] mt-2">{formatPrice(Number(item.price) * toInt(item.quantity, 1))}</p>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        onClick={() => {
                                            removeFromCart(item.id_product);
                                            setShowDeleteMsg(true);
                                            setTimeout(() => setShowDeleteMsg(false), 1500);
                                        }}
                                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600 cursor-pointer bg-red-100 dark:bg-red-900 p-2 rounded-full shadow transition-colors duración-200"
                                        aria-label="Eliminar producto"
                                    >
                                        <Trash2 className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-[#FBCC13] dark:border-[#006CFA] sm:hidden w-full transición-transform hover:scale-[1.01]">
                                <div className="flex items-center gap-4">
                                    <img className="w-16 h-16 object-contain rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" src={item.image || (document.documentElement.classList.contains('dark') ? '/images/logotipo-claro.png' : '/images/logotipo.png')} alt={item.name} />
                                    <div>
                                        <h3 className="text-base font-bold uppercase text-black dark:text-white mb-1">{item.name} <span className="text-gray-500 dark:text-gray-400">(x{item.quantity})</span></h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Precio: <span className="font-bold">{formatPrice(Number(item.price))}</span></p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Disponibles: <span className="font-bold">{item.disponibility}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 justify-center mt-2">
                                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 shadow min-w-[140px] justify-center">
                                        <button
                                            onClick={() => {
                                                const currentQuantity = toInt(quantities[item.id_product] ?? item.quantity, 1);
                                                if (currentQuantity > 1) {
                                                    const newQuantity = currentQuantity - 1;
                                                    setQuantities({
                                                        ...quantities,
                                                        [item.id_product]: newQuantity
                                                    });
                                                    setInputValues({
                                                        ...inputValues,
                                                        [item.id_product]: newQuantity.toString()
                                                    });
                                                    updateItem(item.id_product, newQuantity).catch(() => {
                                                        alert('No se pudo actualizar la cantidad del producto. Inténtalo de nuevo.');
                                                        setQuantities({
                                                            ...quantities,
                                                            [item.id_product]: currentQuantity
                                                        });
                                                        setInputValues({
                                                            ...inputValues,
                                                            [item.id_product]: currentQuantity.toString()
                                                        });
                                                    });
                                                }
                                            }}
                                            className="px-3 py-2 text-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-red-300 dark:hover:bg-red-500 hover:text-black dark:hover:text-white rounded-l-lg transition-colors duration-200 cursor-pointer flex items-center"
                                            aria-label="Disminuir cantidad"
                                        >
                                            <span>-</span>
                                        </button>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={inputValues[item.id_product] || item.quantity.toString()}
                                            onClick={(e) => {
                                                e.currentTarget.select();
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.select();
                                            }}
                                            onChange={(e) => {
                                                const newValue = e.target.value.replace(/[^0-9]/g, '');
                                                setInputValues({
                                                    ...inputValues,
                                                    [item.id_product]: newValue
                                                });
                                                const newQuantity = parseInt(newValue, 10);
                                                // Solo actualizar la cantidad si es un número válido
                                                if (!isNaN(newQuantity)) {
                                                    // Comprobar si excede el límite
                                                    if (newQuantity > item.disponibility) {
                                                        setShowMaxAlert(true);
                                                        setTimeout(() => setShowMaxAlert(false), 3000);
                                                    } else {
                                                        // Actualizar estado local
                                                        setQuantities({
                                                            ...quantities,
                                                            [item.id_product]: newQuantity || 1
                                                        });
                                                        // Actualizar servidor si es válido
                                                        if (newQuantity >= 1 && newQuantity <= item.disponibility) {
                                                            updateItem(item.id_product, newQuantity);
                                                        }
                                                    }
                                                }
                                            }}
                                            onBlur={() => {
                                                // Validar y corregir cuando el usuario termina de editar
                                                const currentValue = inputValues[item.id_product] || '1';
                                                let newQuantity = parseInt(currentValue, 10);
                                                if (isNaN(newQuantity) || newQuantity < 1) {
                                                    newQuantity = 1;
                                                }
                                                // Limitar al máximo disponible
                                                if (newQuantity > item.disponibility) {
                                                    newQuantity = item.disponibility;
                                                    setShowMaxAlert(true);
                                                    setTimeout(() => setShowMaxAlert(false), 3000);
                                                }
                                                setInputValues({
                                                    ...inputValues,
                                                    [item.id_product]: newQuantity.toString()
                                                });
                                                setQuantities({
                                                    ...quantities,
                                                    [item.id_product]: newQuantity
                                                });
                                                updateItem(item.id_product, newQuantity);
                                            }}
                                            className="w-16 px-2 py-2 text-lg font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 text-center border-none focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                                            aria-label="Cantidad"
                                        />
                                        <button
                                            onClick={() => {
                                                const currentQuantity = toInt(quantities[item.id_product] ?? item.quantity, 1);
                                                if (currentQuantity < item.disponibility) {
                                                    const newQuantity = currentQuantity + 1;
                                                    setQuantities({
                                                        ...quantities,
                                                        [item.id_product]: newQuantity
                                                    });
                                                    setInputValues({
                                                        ...inputValues,
                                                        [item.id_product]: newQuantity.toString()
                                                    });
                                                    updateItem(item.id_product, newQuantity).catch(() => {
                                                        alert('No se pudo actualizar la cantidad del producto. Inténtalo de nuevo.');
                                                        setQuantities({
                                                            ...quantities,
                                                            [item.id_product]: currentQuantity
                                                        });
                                                        setInputValues({
                                                            ...inputValues,
                                                            [item.id_product]: currentQuantity.toString()
                                                        });
                                                    });
                                                } else {
                                                    setShowMaxAlert(true);
                                                    setTimeout(() => setShowMaxAlert(false), 3000);
                                                }
                                            }}
                                            className="px-3 py-2 text-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-green-300 dark:hover:bg-green-500 hover:text-black dark:hover:text-white rounded-r-lg transition-colors duration-200 cursor-pointer flex items-center"
                                            aria-label="Aumentar cantidad"
                                        >
                                            <span>+</span>
                                        </button>
                                    </div>
                                    <span className="text-base font-bold text-[#006CFA] dark:text-[#FBCC13]">{formatPrice(Number(item.price) * toInt(item.quantity, 1))}</span>
                                    <button
                                        onClick={() => {
                                            removeFromCart(item.id_product);
                                            setShowDeleteMsg(true);
                                            setTimeout(() => setShowDeleteMsg(false), 1500);
                                        }}
                                        className="text-red-500 dark:text-red-400 hover-text-red-700 dark:hover-text-red-600 cursor-pointer bg-red-100 dark:bg-red-900 p-2 rounded-full shadow transition-colors duration-200"
                                        title="Eliminar producto"
                                        aria-label="Eliminar producto"
                                    >
                                        <Trash2 className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {cartItems.length > 0 && (
                <div className="pb-24"></div>
            )}

            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-2 bg-gradient-to-t from-white via-white to-white/90 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/90 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <button
                        onClick={() => router.visit('/confirmation')} // This will now use the cart context
                        className="bg-[#006CFA] dark:bg-[#FBCC13] text-white dark:text-black font-bold py-3 px-6 rounded-lg hover:bg-[#0055c8] dark:hover:bg-[#e0b610] transition-all duration-300 cursor-pointer shadow-md text-base w-full flex items-center justify-center gap-2"
                    >
                        <CreditCard className="h-5 w-5" /> Continuar
                    </button>
                </div>
            )}
        </div>
    );
}
