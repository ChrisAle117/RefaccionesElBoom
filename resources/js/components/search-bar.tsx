import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    placeholder?: string;
}

export function SearchBar({ placeholder = 'Buscar por nombre, código o tipo...' }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const query = searchQuery.trim();

        if (!query) {
            setError('Para buscar algún producto, debe de ingresar una palabra.');
            // Clear error after 3.5s
            setTimeout(() => setError(''), 3500);
            return;
        }

        setError('');
        router.get(window.location.pathname, { search: query });
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
                />

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

