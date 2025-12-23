import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { router } from "@inertiajs/react";

// Interfaz para los ítems del carrito
interface CartItem {
    id_product: number;
    name: string;
    price: number;
    disponibility: number; // Cantidad total del artículo disponible en la base de datos
    quantity: number; // Cantidad seleccionada por el usuario en el carrito
    image: string
}

// Interfaz para las propiedades del contexto
interface ShoppingCartContextProps {
    cartItems: CartItem[]; // Lista de ítems en el carrito
    addToCart: (item: CartItem) => Promise<void>; // Función para agregar ítems al carrito
    removeFromCart: (id_product: number) => Promise<void>; // Función para eliminar ítems del carrito
    updateItem: (id_product: number, quantity: number) => Promise<void>; // Función para actualizar la cantidad seleccionada
    totalItems: number; // Total de ítems en el carrito
    totalPrice: number; // Precio total del carrito
    fetchCart: () => Promise<void>; // Función para forzar la carga del carrito
    isProductInCart: (id_product: number) => boolean; // Función para verificar si un producto ya está en el carrito
}

const toInt = (v: unknown, fallback = 0) => {
    const n = Number.parseInt(String(v), 10);
    return Number.isFinite(n) ? n : fallback;
};
const toFloat = (v: unknown, fallback = 0) => {
    const n = Number.parseFloat(String(v));
    return Number.isFinite(n) ? n : fallback;
};

const ShoppingCartContext = createContext<ShoppingCartContextProps | undefined>(undefined);

export const ShoppingCartProvider: React.FC<{ children: React.ReactNode; isAuthenticated?: boolean }> = ({ children, isAuthenticated = false }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

    // Sync isLoggedIn with isAuthenticated prop on mount
    useEffect(() => {
        setIsLoggedIn(isAuthenticated);
    }, [isAuthenticated]);

    // Clear cart when user is not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            setCartItems([]);
        }
    }, [isLoggedIn]);

    // Función para cargar el carrito desde el backend
    const fetchCart = async (force = false) => {
        // Skip if user is not logged in
        if (!isLoggedIn) {
            setCartItems([]);
            return;
        }

        // Evitar múltiples solicitudes simultáneas
        if (isLoading && !force) return;

        const isLoginPage = window.location.pathname.includes('login');
        if (isLoginPage) return;

        setIsLoading(true);

        try {
            if (force) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Evitar problemas de caché
            const timestamp = new Date().getTime();
            const response = await fetch(`/cart?t=${timestamp}`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                // If 401, user session expired
                if (response.status === 401) {
                    setIsLoggedIn(false);
                    setCartItems([]);
                }
                return;
            }

            const data = await response.json();

            if (data.items) {
                setCartItems(
                    data.items.map((it: any) => ({
                        id_product: toInt(it.id_product),
                        name: String(it.name ?? ''),
                        price: toFloat(it.price),
                        disponibility: toInt(it.disponibility),
                        quantity: toInt(it.quantity, 1),
                        image: String(it.image ?? '')
                    }))
                );
            } else {
                setCartItems([]);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load and navigation handling
    useEffect(() => {
        const isLoginPage = window.location.pathname.includes('login');
        if (!isLoginPage && isLoggedIn && cartItems.length === 0) {
            fetchCart();
        }

        const handleInertiaNavigate = (event: any) => {
            if (!event?.detail?.page?.props) return;

            const newAuth = !!event.detail.page.props?.auth?.user;
            const wasLoggedIn = isLoggedIn;

            if (wasLoggedIn !== newAuth) {
                setIsLoggedIn(newAuth);

                if (!wasLoggedIn && newAuth) {
                    // Just logged in, fetch immediately
                    setTimeout(() => fetchCart(true), 100);
                } else {
                    // Just logged out
                    setCartItems([]);
                }
            }
        };

        const handleInertiaFinish = () => {
            // Always check after navigation finishes
            if (isLoggedIn && cartItems.length === 0 && !window.location.pathname.includes('login')) {
                fetchCart(true);
            }
        };

        const handleLogin = () => {
            setIsLoggedIn(true);
            setTimeout(() => fetchCart(true), 100);
        };

        document.addEventListener('user-logged-in', handleLogin);
        document.addEventListener('inertia:navigate', handleInertiaNavigate);
        document.addEventListener('inertia:finish', handleInertiaFinish);

        return () => {
            document.removeEventListener('user-logged-in', handleLogin);
            document.removeEventListener('inertia:navigate', handleInertiaNavigate);
            document.removeEventListener('inertia:finish', handleInertiaFinish);
        };
    }, [isLoggedIn]); // Removido cartItems.length para evitar refrescos redundantes y race conditions

    // Función para agregar un ítem al carrito
    const addToCart = async (item: CartItem) => {
        // Check authentication before allowing cart operations
        if (!isLoggedIn) {
            router.visit('/login');
            return;
        }

        try {
            // Normaliza antes de enviar y guardar
            const normalized = {
                ...item,
                id_product: toInt(item.id_product),
                quantity: toInt(item.quantity, 1),
                price: toFloat(item.price),
                disponibility: toInt(item.disponibility),
                image: String(item.image ?? '')
            };

            const response = await fetch('/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    id_product: normalized.id_product,
                    quantity: normalized.quantity,
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Error al agregar el producto al carrito');
            }

            await response.json();

            // Actualiza el estado del carrito 
            setCartItems((prevItems) => {
                const existingItem = prevItems.find((cartItem) => cartItem.id_product === normalized.id_product);
                if (existingItem) {
                    return prevItems.map((cartItem) =>
                        cartItem.id_product === normalized.id_product
                            ? { ...cartItem, quantity: toInt(cartItem.quantity) + normalized.quantity }
                            : cartItem
                    );
                }
                return [...prevItems, normalized];
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    // Función para eliminar un ítem del carrito
    const removeFromCart = async (id_product: number) => {
        try {
            const response = await fetch(`/cart/remove/${id_product}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el producto del carrito');
            }

            // Actualiza el estado del carrito eliminando el producto
            setCartItems((prevItems) => prevItems.filter((cartItem) => cartItem.id_product !== id_product));
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    };

    // Función para actualizar la cantidad seleccionada de un ítem en el carrito
    const updateItem = async (id_product: number, quantity: number) => {
        try {
            const response = await fetch('/cart/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    id_product,
                    quantity: toInt(quantity, 1),
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    throw new Error('Error inesperado del servidor.');
                }

                throw new Error(errorData.message || 'Error al actualizar la cantidad del producto');
            }

            // Actualiza el estado del carrito con la nueva cantidad
            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.id_product === id_product ? { ...item, quantity: toInt(quantity, 1) } : item
                )
            );

        } catch (error) {
            console.error('Error updating cart item:', error);
            alert('No se pudo actualizar la cantidad del producto. Inténtalo de nuevo.');
        }
    };

    // Calcular el total de ítems en el carrito 
    const totalItems = cartItems.reduce((sum, item) => sum + toInt(item.quantity), 0);

    // Calcular el precio total del carrito 
    const totalPrice = cartItems.reduce((sum, item) => sum + toFloat(item.price) * toInt(item.quantity), 0);

    // Verificar si un producto está en el carrito
    const isProductInCart = (id_product: number): boolean => {
        // Always return false if user is not logged in
        if (!isLoggedIn) {
            return false;
        }
        return cartItems.some(item => item.id_product === id_product);
    };

    return (
        <ShoppingCartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateItem,
                totalItems,
                totalPrice,
                fetchCart: () => fetchCart(true),
                isProductInCart
            }}
        >
            {children}
        </ShoppingCartContext.Provider>
    );
};

export const useShoppingCart = () => {
    const context = useContext(ShoppingCartContext);
    if (!context) {
        throw new Error("useShoppingCart must be used within a ShoppingCartProvider");
    }
    return context;
};
