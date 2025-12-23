import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { ShoppingCartProvider } from '@/components/shopping-car-context';

const appName = import.meta.env.VITE_APP_NAME;

createInertiaApp({
    title: (title) => `${title}  ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Global listener for auth changes
        // When the user logs in or out, we force a full page reload to sync CSRF tokens and cart state
        let lastUserId = (props.initialPage.props as any).auth?.user?.id || null;

        router.on('success', (event) => {
            const userId = (event.detail.page.props as any).auth?.user?.id || null;
            if (userId !== lastUserId) {
                window.location.reload();
            }
        });

        const isAuthenticated = !!(props.initialPage.props as any)?.auth?.user;

        root.render(
            <ShoppingCartProvider isAuthenticated={isAuthenticated}>
                <App {...props} />
            </ShoppingCartProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();