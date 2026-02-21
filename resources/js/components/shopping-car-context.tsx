import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface CartItem {
    id_product: number;
    name: string;
    price: number;
    disponibility: number;
    quantity: number;
    image: string;
}

interface ShoppingCartContextProps {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => Promise<void>;
    removeFromCart: (id_product: number) => Promise<void>;
    updateItem: (id_product: number, quantity: number) => Promise<void>;
    totalItems: number;
    totalPrice: number;
    fetchCart: () => Promise<void>;
    isProductInCart: (id_product: number) => boolean;
    isUpdating: boolean;
}

type RawCartItem = {
    id_product?: unknown;
    name?: unknown;
    price?: unknown;
    disponibility?: unknown;
    quantity?: unknown;
    image?: unknown;
};

const toInt = (v: unknown, fallback = 0) => {
    const n = Number.parseInt(String(v), 10);
    return Number.isFinite(n) ? n : fallback;
};

const toFloat = (v: unknown, fallback = 0) => {
    const n = Number.parseFloat(String(v));
    return Number.isFinite(n) ? n : fallback;
};

const mapItems = (items: RawCartItem[] | Record<string, RawCartItem>): CartItem[] => {
    const itemsArray = Array.isArray(items) ? items : Object.values(items ?? {});

    return itemsArray.map((it) => ({
        id_product: toInt(it.id_product),
        name: String(it.name ?? ""),
        price: toFloat(it.price),
        disponibility: toInt(it.disponibility),
        quantity: toInt(it.quantity, 1),
        image: String(it.image ?? ""),
    }));
};

const ShoppingCartContext = createContext<ShoppingCartContextProps | undefined>(undefined);

export const ShoppingCartProvider: React.FC<{ children: React.ReactNode; isAuthenticated?: boolean }> = ({
    children,
    isAuthenticated: initialIsAuthenticated = false,
}) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setIsAuthenticated(initialIsAuthenticated);
    }, [initialIsAuthenticated]);

    const fetchCart = useCallback(async (force = false) => {
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`/cart?t=${timestamp}`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401 && !isAuthenticated) {
                    setCartItems([]);
                }
                return;
            }

            const data = await response.json();
            if (data.items) {
                setCartItems(mapItems(data.items));
            } else {
                setCartItems([]);
            }
        } catch (error) {
            if (force) {
                console.error('Error fetching cart:', error);
            }
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const isLoginPage = window.location.pathname.includes('login');
        if (!isLoginPage) {
            fetchCart();
        }
    }, [fetchCart]);

    const addToCart = async (item: CartItem) => {
        try {
            const response = await fetch('/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    id_product: toInt(item.id_product),
                    quantity: toInt(item.quantity, 1),
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Error al agregar el producto al carrito');
            }

            const data = await response.json();
            if (data.items) {
                setCartItems(mapItems(data.items));
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const removeFromCart = async (id_product: number) => {
        const previousItems = [...cartItems];

        try {
            setCartItems((prev) => prev.filter((item) => item.id_product !== id_product));

            const response = await fetch(`/cart/remove/${id_product}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el producto del carrito');
            }

            const data = await response.json();
            if (data.items) {
                setCartItems(mapItems(data.items));
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            setCartItems(previousItems);
        }
    };

    const updateItem = async (id_product: number, quantity: number) => {
        setIsUpdating(true);
        const previousItems = [...cartItems];

        setCartItems((prev) =>
            prev.map((item) =>
                item.id_product === id_product ? { ...item, quantity: toInt(quantity, 1) } : item
            )
        );

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
                credentials: 'include',
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

            const data = await response.json();
            if (data.items) {
                setCartItems(mapItems(data.items));
            }
        } catch (error) {
            console.error('Error updating cart item:', error);
            setCartItems(previousItems); // revert visualmente
            // El carrito se restaura automáticamente — sin alert() nativo
        } finally {
            setIsUpdating(false);
        }
    };

    const totalItems = cartItems.reduce((sum, item) => sum + toInt(item.quantity), 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + toFloat(item.price) * toInt(item.quantity), 0);

    const isProductInCart = useCallback(
        (id_product: number): boolean => cartItems.some((item) => item.id_product === id_product),
        [cartItems]
    );

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
                isProductInCart,
                isUpdating,
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
