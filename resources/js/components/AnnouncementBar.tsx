import React from 'react';





export default function AnnouncementBar() {
    const message = "REFACCIONES DE CALIDAD PARA TU TRACTOCAMIÓN · EN TU TIENDA EN LINEA DE CONFIANZA · ENVÍO GRATIS APARTIR DE $1999 · DESDE UN TORNILLO HASTA UN CAMIÓN · ¡LLAMA O ESCRIBE AHORA! ·";

    return (
        <div
            className="relative w-full flex items-center overflow-hidden shadow-md"
            style={{
                background: '#111827',
                height: '38px',
                minHeight: '38px',
            }}
        >

            <div className="flex-1 overflow-hidden pointer-events-none select-none">
                <div
                    className="whitespace-nowrap text-white font-extrabold text-[10px] sm:text-[11.5px] uppercase tracking-[0.15em] opacity-95"
                    style={{
                        display: 'inline-block',
                        animation: 'marqueeScroll 65s linear infinite',
                        paddingLeft: '100%',
                    }}
                >

                    {message}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {message}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {message}
                </div>
            </div>



            <style>{`
                @keyframes marqueeScroll {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-66.6%); }
                }
            `}</style>
        </div>
    );
}
