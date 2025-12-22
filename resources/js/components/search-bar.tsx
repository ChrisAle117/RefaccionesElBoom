import React, { useState } from 'react';
import { router } from '@inertiajs/react';

interface SearchBarProps {
    placeholder?: string;
}

export function SearchBar({ placeholder = 'Buscar por nombre o tipo...' }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);

    // Función para manejar los errores con animación
    const handleError = (message: string) => {
        setError(message);
        setShowError(true);
        setTimeout(() => {
            setShowError(false);
            setError('');
        }, 3500);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const query = searchQuery.trim();

        // Validación: campo vacío
        if (!query) {
            handleError('Para buscar algún producto, debe de ingresar una palabra.');
            return;
        }

        setShowError(false);
        setError('');

        router.get(window.location.pathname, { search: query });
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <img
                    src="https://images.icon-icons.com/561/PNG/512/search-circular-symbol_icon-icons.com_53800.png"
                    alt="Buscar"
                    className="h-6 w-auto opacity-60"
                />
            </div>
            <div className="relative w-full">
                <input
                    type="text"
                    placeholder={placeholder}
                    className={`pl-14 w-full h-12 bg-white rounded-full text-black shadow-md focus:outline-none ${error ? 'border-2 border-red-500' : 'focus:border-[#006CFA]'} transition-colors duration-300`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {error && showError && (
                    <div className="absolute top-[calc(100%+1rem)] left-4 bg-white border-2 border-red-500 rounded-lg p-2 shadow-lg transform transition-all duration-500 animate-slideUpAndFade">
                        <div className="relative">
                            <div className="absolute -top-4 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
                            <p className="text-red-500 text-sm">
                                {error}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );

    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUpAndFade {
            0% { 
                opacity: 0; 
                transform: translateY(-5px);
            }
            5% {
                opacity: 1;
                transform: translateY(0);
            }
            75% {
                opacity: 1;
                transform: translateY(0);
            }
            85% {
                opacity: 0.8;
                transform: translateY(2px);
            }
            90% {
                opacity: 0.6;
                transform: translateY(3px);
            }
            95% {
                opacity: 0.3;
                transform: translateY(4px);
            }
            100% { 
                opacity: 0;
                transform: translateY(5px);
            }
        }
        .animate-slideUpAndFade {
            animation: slideUpAndFade 3s ease-in-out forwards;
        }
    `;
    document.head.appendChild(style);
}
