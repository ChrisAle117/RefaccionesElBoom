import React, { useEffect, useRef, useState } from 'react';

function useMediaQuery(query: string) {
    const get = () =>
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false;
    const [matches, setMatches] = useState(get());

    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
        setMatches(mql.matches);
        if (mql.addEventListener) mql.addEventListener('change', onChange);
        else mql.addListener(onChange);
        return () => {
            if (mql.removeEventListener) mql.removeEventListener('change', onChange);
            else mql.removeListener(onChange);
        };
    }, [query]);

    return matches;
}

interface CarouselProps {
    images: string[];
    imagesMobile?: string[];
    interval?: number;
    className?: string;
}

const Carousel: React.FC<CarouselProps> = React.memo(({
    images,
    imagesMobile,
    interval = 8000,
    className,
}) => {
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const source = isDesktop || !imagesMobile?.length ? images : imagesMobile!;
    const count = source.length;

    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (currentIndex >= count) setCurrentIndex(0);
    }, [count, currentIndex]);

    useEffect(() => {
        if (!count) return;
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
            setCurrentIndex((i) => (i + 1) % count);
        }, interval);
        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, [currentIndex, count, interval]);

    const goToPrevious = () => setCurrentIndex((i) => (i - 1 + count) % count);
    const goToNext = () => setCurrentIndex((i) => (i + 1) % count);

    if (!count) return null;

    const MAX_VH_DESKTOP = 60; // Aumentado de 42 a 60 para mostrar más imagen
    const MAX_VH_MOBILE = 60;  // Aumentado de 50 a 60

    const containerHeight = isDesktop
        ? `min(calc(100vw * 9 / 21), ${MAX_VH_DESKTOP}vh)`
        : `min(calc(100vw * 9 / 16), ${MAX_VH_MOBILE}vh)`;

    return (
        <div className={`relative w-full ${className || ''}`}>
            <div className="relative w-full overflow-hidden" style={{ height: containerHeight }}>
                {source.map((src, index) => (
                    <div
                        key={`${src}-${index}`}
                        className={`absolute inset-0 transition-opacity duration-700 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                        aria-hidden={index !== currentIndex}
                    >
                        <img
                            src={src}
                            sizes="100vw"
                            alt={`Imagen del carrusel ${index + 1} - Refaccionaria El Boom`}
                            className="w-full h-full object-cover object-center"
                            loading={index === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            fetchPriority={index === 0 ? 'high' : undefined}
                            draggable={false}
                        />
                    </div>
                ))}
            </div>

            {/* Flechas */}
            <button
                onClick={goToPrevious}
                aria-label="Anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-black hover:text-white text-black p-4 rounded-full z-30 cursor-pointer touch-manipulation"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={goToNext}
                aria-label="Siguiente"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-black hover:text-white text-black p-4 rounded-full z-30 cursor-pointer touch-manipulation"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {source.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        aria-label={`Ir a la imagen ${i + 1}`}
                        className={`w-6 h-6 flex items-center justify-center cursor-pointer`}
                    >
                        <div className={`w-3 h-3 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-gray-400/70'} transition-colors`} />
                    </button>
                ))}
            </div>
        </div>
    );
});

export default Carousel;
