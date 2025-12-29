import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : undefined,
    },
    build: {
        sourcemap: false,
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // React Icons - separar por familia para lazy loading efectivo
                    if (id.includes('react-icons/tb')) {
                        return 'icons-tb';
                    }
                    if (id.includes('react-icons/si')) {
                        return 'icons-si';
                    }
                    if (id.includes('react-icons/fa')) {
                        return 'icons-fa';
                    }
                    if (id.includes('react-icons/io')) {
                        return 'icons-io';
                    }
                    if (id.includes('react-icons/fi')) {
                        return 'icons-fi';
                    }
                    // Lucide React (usado frecuentemente)
                    if (id.includes('lucide-react')) {
                        return 'lucide-vendor';
                    }
                    // Framer Motion
                    if (id.includes('framer-motion')) {
                        return 'framer-vendor';
                    }
                    // Date libraries
                    if (id.includes('date-fns')) {
                        return 'date-vendor';
                    }
                    // Radix UI components
                    if (id.includes('@radix-ui')) {
                        return 'radix-vendor';
                    }
                },
            },
        },
        // Aumentar el límite de advertencia de chunk
        chunkSizeWarningLimit: 1000,
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
});
