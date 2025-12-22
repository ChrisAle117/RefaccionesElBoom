import React from 'react';
import { usePage } from '@inertiajs/react';

export default function CoachmarkTutorial() {
    const [showTutorial, setShowTutorial] = React.useState(false);
    const [spotlightRect, setSpotlightRect] = React.useState<{
        top: number; left: number; width: number; height: number;
    } | null>(null);
    const [productosRect, setProductosRect] = React.useState<{
        top: number; left: number; width: number; height: number;
    } | null>(null);

    const { auth } = usePage().props as any;

    const handleClose = () => {
        setShowTutorial(false);
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('boomTutorialSeen', '1');
            }
        } catch { }
    };

    React.useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            const isLoggedIn = !!(auth && auth.user);
            const params = new URLSearchParams(window.location.search);
            const tutorialParam = params.get('tutorial'); 

            if (tutorialParam === 'reset') {
                window.localStorage.removeItem('boomTutorialNeverShow');
                window.localStorage.removeItem('boomTutorialSeen');
            }

            if (isLoggedIn) {
                window.localStorage.setItem('boomTutorialNeverShow', '1');
                setShowTutorial(false);
                return;
            }

            const never = window.localStorage.getItem('boomTutorialNeverShow');
            if (never && tutorialParam !== '1') {
                setShowTutorial(false);
                return;
            }

            if (tutorialParam === '1') {
                setShowTutorial(true);
                return;
            }

            const seen = window.localStorage.getItem('boomTutorialSeen');
            setShowTutorial(!seen);
        } catch {
            const isLoggedIn = !!(auth && auth.user);
            setShowTutorial(!isLoggedIn);
        }
    }, [auth?.user]);

    
    React.useEffect(() => {
        if (!showTutorial) return;
        const compute = () => {
            const el = document.querySelector('[data-coachmark="tabnav"]') as HTMLElement | null;
            if (!el) {
                setSpotlightRect(null);
                return;
            }
            const r = el.getBoundingClientRect();
            
            setSpotlightRect({
                top: Math.max(0, r.top),
                left: r.left,
                width: r.width,
                height: r.height,
            });

            
            const productosBtn = document.querySelector('[data-tab-id="productos"]') as HTMLElement | null;
            if (productosBtn) {
                const pr = productosBtn.getBoundingClientRect();
                setProductosRect({
                    top: Math.max(0, pr.top),
                    left: pr.left,
                    width: pr.width,
                    height: pr.height,
                });
            } else {
                setProductosRect(null);
            }
        };
        compute();
        const onScroll = () => compute();
        const onResize = () => compute();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        const obs = new MutationObserver(compute);
        obs.observe(document.body, { attributes: true, childList: true, subtree: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            obs.disconnect();
        };
    }, [showTutorial]);

    // Bloquear scroll del body mientras está abierto
    React.useEffect(() => {
        if (!showTutorial) return;
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollBarWidth > 0) {
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        }
        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, [showTutorial]);

    if (!showTutorial) return null;

    // Layout
    return (
        <div
            className="fixed inset-0 z-[3000]"
            role="dialog"
            aria-modal="true"
            aria-label="Tutorial de navegación"
            onClick={handleClose}
        >
            <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                <defs>
                    <mask id="boom-spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {spotlightRect && (
                            <rect
                                x={spotlightRect.left}
                                y={spotlightRect.top}
                                width={spotlightRect.width}
                                height={spotlightRect.height}
                                rx="8"
                                ry="8"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#boom-spotlight-mask)" />
            </svg>

            <div className="absolute inset-0 pointer-events-none">
        {spotlightRect ? (
                    (() => {
            
            const navBottom = spotlightRect.top + spotlightRect.height;
                        const isSmall = window.innerWidth < 640; 
                        const isMedium = window.innerWidth >= 640 && window.innerWidth < 1024;
                        const margin = isSmall ? 6 : 8; 
                        const mascotWidth = 200; 
                        const rawLeft = productosRect
                            ? (productosRect.left + productosRect.width + margin) 
                            : (spotlightRect.left + spotlightRect.width / 2);

                        const sidePad = isSmall ? 12 : 16;
                        const mascotLeft = Math.min(
                            window.innerWidth - mascotWidth - sidePad,
                            Math.max(sidePad, rawLeft)
                        );
                        const mascotTop = productosRect
                            ? (productosRect.top + productosRect.height / 2) 
                            : (spotlightRect.top + spotlightRect.height / 2);

                        
                        const maxBubble = 520;
                        const bubbleWidth = Math.min(maxBubble, window.innerWidth - sidePad * 2);
                        const bubbleAnchor = productosRect
                            ? (productosRect.left + productosRect.width / 2)
                            : (spotlightRect.left + spotlightRect.width / 2);
                        const bubbleLeft = Math.min(
                            window.innerWidth - bubbleWidth - sidePad,
                            Math.max(sidePad, bubbleAnchor - bubbleWidth / 2)
                        );
            const bubbleTop = Math.max(isSmall ? 8 : 16, navBottom + (isSmall ? 8 : 16));

                        return (
                            <>
                                <img
                                    src="/images/ElBoomTutorial.webp"
                                    alt="Personaje El Boom señalando"
                                    className="absolute w-200 h-auto object-contain drop-shadow-2xl pointer-events-none z-50"
                                    style={{ top: mascotTop, left: mascotLeft, transform: 'translate(0, -50%)' }}
                                />
                                <div
                                    className="absolute pointer-events-auto rounded-xl bg-white text-gray-800 shadow-[0_12px_30px_rgba(0,0,0,0.25)] border border-gray-200 z-40"
                                    style={{ top: bubbleTop, left: bubbleLeft, width: bubbleWidth }}
                                >
                                    <div className="p-4 sm:p-5 md:p-6">
                                        <p className="text-sm sm:text-base md:text-lg leading-relaxed text-justify">
                                            <span className='font-bold'>¡Hola, soy El Boom!, y vengo a decirte que: </span><br />Puedes navegar por todo el sitio web dando clic o presionando sobre cualquiera de las opciones
                                                que ves en esta barra que tengo a mi derecha e izquierda. Y así conocer un poco de nosotros y todo lo que ofrecemos para ti.
                                        </p>
                                        <div className="mt-4 sm:mt-5 text-right">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                                                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 sm:px-4 sm:py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="pointer-events-auto max-w-2xl mx-auto rounded-xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center gap-6">
                                <img src="/images/ElBoomTutorial.webp" alt="El Boom" className="w-40 h-auto" />
                                <p className="text-base md:text-lg leading-relaxed text-justify">
                                    Usa los títulos del menú superior para navegar por el sitio.
                                </p>
                            </div>
                            <div className="mt-5 text-right">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleClose(); }}
                                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
