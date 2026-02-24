import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

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

interface CarouselImage {
    src: string;
    title?: string;
    description?: string;
    ctaText?: string;
    ctaHref?: string;
}

interface CarouselProps {
    images: string[] | CarouselImage[];
    imagesMobile?: string[] | CarouselImage[];
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

    const MAX_VH_DESKTOP = 42;
    const MAX_VH_MOBILE = 60;

    const containerHeight = isDesktop
        ? `min(calc(100vw * 9 / 21), ${MAX_VH_DESKTOP}vh)`
        : `min(calc(100vw * 9 / 16), ${MAX_VH_MOBILE}vh)`;

    return (
        <div className={`relative w-full ${className || ''}`}>
            <div className="relative w-full overflow-hidden" style={{ height: containerHeight }}>
                {source.map((item, index) => {
                    const isObject = typeof item !== 'string';
                    const src = isObject ? (item as CarouselImage).src : (item as string);
                    const data = isObject ? (item as CarouselImage) : null;

                    return (
                        <div
                            key={`${src}-${index}`}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                            aria-hidden={index !== currentIndex}
                        >
                            <img
                                src={src}
                                width={1920}
                                height={1080}
                                sizes="100vw"
                                alt={data?.title || `Imagen del carrusel ${index + 1} - Refaccionaria El Boom`}
                                className="w-full h-full object-cover object-center"
                                loading={index === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                                fetchPriority={index === 0 ? 'high' : undefined}
                                draggable={false}
                            />
                            {/* Overlay con Botón en la esquina inferior izquierda */}
                            {index === currentIndex && data && data.ctaText && data.ctaHref && (
                                <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-start p-6 sm:p-12 z-20 pointer-events-none">
                                    <div className="flex flex-col items-start pointer-events-auto">
                                        <Link
                                            href={data.ctaHref}
                                            className="group/cta px-6 py-3 sm:px-10 sm:py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black text-sm sm:text-xl rounded-full shadow-[0_0_20px_rgba(251,204,19,0.3)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 border-2 border-black/10 relative overflow-hidden"
                                        >
                                            <span className="relative z-10">{data.ctaText}</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-6 sm:h-6 transition-transform group-hover/cta:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/cta:translate-y-0 transition-transform duration-300" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
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

            {/* Indicadores modernos */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-3 z-30 w-full max-w-[90vw] px-4">
                {source.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        aria-label={`Ir a la imagen ${i + 1}`}
                        className={`group relative h-1.5 flex items-center justify-center cursor-pointer transition-all duration-300 ${i === currentIndex ? 'w-8' : 'w-4 hover:w-6'
                            }`}
                    >
                        <div className={`w-full h-full rounded-full ${i === currentIndex
                            ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                            : 'bg-white/40 group-hover:bg-white/60'
                            } transition-all duration-300`} />
                    </button>
                ))}
            </div>
        </div>
    );
});

export default Carousel;
