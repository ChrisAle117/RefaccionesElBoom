import React, { useState, KeyboardEvent, ChangeEvent } from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    currentItems: number;
    onPageChange: (pageNumber: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    itemsPerPageOptions?: number[];
    showItemsPerPageSelector?: boolean;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    currentItems,
    onPageChange,
    onItemsPerPageChange,
    itemsPerPageOptions = [10, 20, 30],
    showItemsPerPageSelector = true,
    className = ''
}: PaginationProps) {
    // Estado para el input de ir a página específica
    const [goToPage, setGoToPage] = useState<string>('');
    
    // Funciones de navegación
    const goToFirstPage = () => onPageChange(1);
    const goToLastPage = () => onPageChange(totalPages);
    const nextPage = () => currentPage < totalPages && onPageChange(currentPage + 1);
    const prevPage = () => currentPage > 1 && onPageChange(currentPage - 1);
    
    // Función para ir a una página específica
    const handleGoToPage = () => {
        const pageNumber = parseInt(goToPage);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            onPageChange(pageNumber);
            setGoToPage('');
        }
    };
    
    // Manejar el evento de tecla Enter
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleGoToPage();
        }
    };
    
    // Manejar cambios en el input
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        // Solo permitir números
        const value = e.target.value.replace(/[^0-9]/g, '');
        setGoToPage(value);
    };

    // Lógica para mostrar un número limitado de botones de página
    const getPageButtons = () => {
        const maxButtons = 5;
        let startPage = 1;
        let endPage = Math.min(maxButtons, totalPages);

        if (currentPage > totalPages - Math.floor(maxButtons / 2)) {
            startPage = Math.max(1, totalPages - maxButtons + 1);
            endPage = totalPages;
        } else if (currentPage > Math.floor(maxButtons / 2)) {
            startPage = currentPage - Math.floor(maxButtons / 2);
            endPage = startPage + maxButtons - 1;
            if (endPage > totalPages) {
                endPage = totalPages;
                startPage = Math.max(1, endPage - maxButtons + 1);
            }
        }

        return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
            const pageNum = startPage + i;
            return (
                <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-1 rounded border cursor-pointer transition-colors duration-200 ${
                        pageNum === currentPage
                            ? 'bg-[#FBCC13] text-black border-[#FBCC13]'
                            : 'border-gray-300 text-gray-700 hover:bg-[#FBCC13] hover:text-black dark:border-gray-600 dark:text-gray-300 dark:hover:bg-[#FBCC13] dark:hover:text-black'
                    }`}
                >
                    {pageNum}
                </button>
            );
        });
    };

    if (totalPages <= 1) return null;

    return (
        <div className={`flex flex-col items-center justify-between gap-4 mt-6 border-t border-gray-200 pt-4 w-full max-w-none mx-0 dark:border-gray-600 dark:text-white ${className}`}>
            {/* Info de items y página */}
            <div className="text-sm text-gray-700 mb-2 text-center w-full dark:text-gray-300">
                Mostrando {currentItems} de {totalItems} items
                <span className="ml-2 text-gray-500 font-light dark:text-gray-400">
                    Página {currentPage} de {totalPages}
                </span>
            </div>

            {/* Números de página*/}
            <div className="flex flex-wrap justify-center gap-1 mb-2 w-full">
                {getPageButtons()}
            </div>

            {/* Campo para ir a una página específica */}
            <div className="flex flex-row justify-center items-center gap-2 w-full mb-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Ir a página:</span>
                    <input
                        type="text"
                        value={goToPage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={currentPage.toString()}
                        className="border border-gray-300 rounded px-2 py-1 w-16 text-center text-black text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        aria-label="Ir a página"
                    />
                    <button
                        onClick={handleGoToPage}
                        className="px-2 py-1 rounded border border-gray-300 cursor-pointer text-black  text-sm font-semibold transition-colors duration-200 dark:bg-[#FBCC13] dark:text-black"
                    >
                        Ir
                    </button>
                </div>
            </div>

            {/* Botones de navegación abajo */}
            <div className="flex flex-row justify-center gap-2 w-full mb-2">
                <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className={`px-2 py-1 rounded border border-gray-300 text-sm font-semibold transition-colors duration-200 flex items-center justify-center ${
                        currentPage === 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                            : 'bg-white text-[#006CFA] hover:bg-[#F5F7FA] cursor-pointer dark:bg-gray-800 dark:text-[#FFFFFF] dark:hover:bg-gray-700'
                    }`}
                    title="Primera página"
                >
                    {/* Icono doble flecha izquierda */}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-1 rounded border border-gray-300 text-sm font-semibold transition-colors duration-200 flex items-center justify-center dark:text-[#FFFFFF] ${
                        currentPage === 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                            : 'bg-white text-[#006CFA] hover:bg-[#F5F7FA] cursor-pointer dark:bg-gray-800 dark:text-[#FFFFFF] dark:hover:bg-gray-700'
                    }`}
                >
                    {/* Icono flecha izquierda */}
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Atrás
                </button>
                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-1 rounded border border-gray-300 text-sm font-semibold transition-colors duration-200 flex items-center justify-center dark:bg-gray-800 dark:text-[#FFFFFF] ${
                        currentPage === totalPages
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-[#006CFA] hover:bg-[#F5F7FA] cursor-pointer'
                    }`}
                >
                    Siguiente
                    {/* Icono flecha derecha */}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <button
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className={`px-2 py-1 rounded border border-gray-300 text-sm font-semibold transition-colors duration-200 flex items-center justify-center ${
                        currentPage === totalPages
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-[#FFFFFF]'
                            : 'bg-white text-[#006CFA] hover:bg-[#F5F7FA] cursor-pointer dark:bg-gray-800 dark:text-[#FFFFFF] dark:hover:bg-gray-700'
                    }`}
                    title="Última página"
                >
                    {/* Icono doble flecha derecha */}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Selector de items por página */}
            {showItemsPerPageSelector && onItemsPerPageChange && (
                <div className="flex flex-col sm:flex-row justify-end items-center gap-2 w-full sm:w-auto">
                    <label htmlFor="itemsPerPage" className="text-sm text-black dark:text-gray-300">Items por página:</label>
                    <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={(e) => {
                            onItemsPerPageChange(Number(e.target.value));
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-black dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                        {itemsPerPageOptions.map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
