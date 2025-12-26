import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    placeholder?: string;
}

export function SearchBar({ placeholder = 'Buscar por nombre, código o tipo...' }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const query = searchQuery.trim();

        if (!query) {
            setError('Para buscar algún producto, debe de ingresar una palabra.');
            setTimeout(() => setError(''), 3500);
            return;
        }

        setError('');
        setIsSearching(true);

        try {
            // Buscar por código exacto primero (API call)
            const response = await fetch(`/api/products/search-by-code?code=${encodeURIComponent(query)}`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();

                // Si encontró producto por código exacto, ir directo al detalle
                if (data.success && data.product) {
                    // Redirigir a home con el parámetro que abrirá el detalle del producto
                    router.visit(`/?openProduct=${data.product.id_product}`);
                    setSearchQuery(''); // Limpiar la búsqueda
                    setIsSearching(false);
                    return;
                }
            }
        } catch (err) {
            console.error('Error buscando por código:', err);
        }

        // Si no encontró por código exacto, buscar por nombre/descripción
        // Redirigir a / (home) con parámetro de búsqueda
        // TabNavigation activará automáticamente la tab de productos
        // ProductCatalog mostrará vista de grid con productos filtrados
        router.visit(`/?search=${encodeURIComponent(query)}`);
        setIsSearching(false);
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-gray-400">
                <Search className="h-5 w-5" />
            </div>
            <div className="relative w-full">
                <input
                    type="text"
                    placeholder={placeholder}
                    className={`pl-12 w-full h-12 rounded-full shadow-sm text-gray-900 border transition-all duration-300
                        ${error ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-200 bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none'}
                    `}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isSearching}
                />

                {isSearching && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}

                {error && (
                    <div className="absolute top-full left-4 mt-2 bg-white border border-red-200 rounded-lg p-3 shadow-xl z-20 animate-in fade-in slide-in-from-top-2">
                        <div className="relative">
                            <div className="absolute -top-5 left-4 border-8 border-transparent border-b-white"></div>
                            <p className="text-red-500 text-sm font-medium">
                                {error}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}

