import '../css/app.css';
import { PageProps } from '@/types';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { ShoppingCartProvider } from '@/components/shopping-car-context';

createInertiaApp({
    title: (title) => {
        const fallback = 'Refaccionaria El Boom';
        if (!title) return fallback;
        // If the title is just 'Laravel', replace it with something better or just use fallback
        if (title === 'Laravel') return fallback;
        return title;
    },
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Global listener for auth changes
        // When the user logs in or out, we force a full page reload to sync CSRF tokens and cart state
        const lastUserId = (props.initialPage.props as unknown as PageProps).auth?.user?.id || null;

        router.on('success', (event) => {
            const userId = (event.detail.page.props as unknown as PageProps).auth?.user?.id || null;
            if (userId !== lastUserId) {
                window.location.reload();
            }
        });

        const isAuthenticated = !!(props.initialPage.props as unknown as PageProps)?.auth?.user;

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