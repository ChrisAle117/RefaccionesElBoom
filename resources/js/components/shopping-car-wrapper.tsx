import React from 'react';
import { usePage } from '@inertiajs/react';
import { ShoppingCartProvider } from './shopping-car-context';

/**
 * Wrapper component that uses usePage to get auth status and passes it to ShoppingCartProvider
 * This allows the cart to react to authentication changes (login/logout)
 */
export const ShoppingCartWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pageProps = usePage().props as unknown as { auth?: { user?: { id: number; name: string; email: string } } };
    const isAuthenticated = !!pageProps?.auth?.user;

    return (
        <ShoppingCartProvider isAuthenticated={isAuthenticated}>
            {children}
        </ShoppingCartProvider>
    );
};
