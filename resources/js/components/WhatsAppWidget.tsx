import React from 'react';
import { X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

const Typewriter: React.FC<{ text: string; className?: string; delay?: number; speed?: number; onComplete?: () => void }> = ({
    text,
    className,
    delay = 0,
    speed = 0.05,
    onComplete,
}) => {
    const [displayedText, setDisplayedText] = React.useState('');
    const [isComplete, setIsComplete] = React.useState(false);

    React.useEffect(() => {
        setIsComplete(false);
        setDisplayedText('');
        let i = 0;

        const startTimeout = setTimeout(() => {
            const intervalId = setInterval(() => {
                if (i >= text.length) {
                    clearInterval(intervalId);
                    setIsComplete(true);
                    onComplete?.();
                    return;
                }
                setDisplayedText(text.substring(0, i + 1));
                i++;
            }, speed * 1000);

            return () => clearInterval(intervalId);
        }, delay * 1000);

        return () => clearTimeout(startTimeout);
    }, [text, delay, speed, onComplete]);

    return (
        <p className={`${className} whitespace-pre-wrap`}>
            {displayedText}
            {!isComplete && <span className="inline-block animate-blink w-[1px] h-4 bg-current ml-0.5" />}
        </p>
    );
};



export default function WhatsAppWidget({
    number,
    defaultMessage,
}: {

    number?: string;
    defaultMessage?: string;
}) {
    const [open, setOpen] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [isFirstMessageComplete, setIsFirstMessageComplete] = React.useState(false);
    const page = usePage();
    const props = (page?.props as unknown as Record<string, unknown>) ?? {};

    const resolvedNumber =
        number ||
        (typeof import.meta !== 'undefined' && (import.meta as unknown as { env: Record<string, string> }).env?.VITE_WHATSAPP_NUMBER) ||
        props.whatsAppNumber ||
        '527771810370';

    const message =
        defaultMessage ||
        'Hola, me gustaría recibir información. Vengo desde el sitio web.';

    const waUrl = `https://wa.me/${resolvedNumber}?text=${encodeURIComponent(message)}`;

    const label = open ? 'Cerrar chat de WhatsApp' : 'Abrir chat de WhatsApp';

    const handleFirstMessageComplete = React.useCallback(() => setIsFirstMessageComplete(true), []);

    React.useEffect(() => {
        if (open) {
            // Resetear la animación de texto al abrir
            setIsFirstMessageComplete(false);
        } else {
            return;
        }

        const intervalId = setInterval(() => {
            setIsAnimating(true);
            // La duración de la animación es de 0.5s
            setTimeout(() => {
                setIsAnimating(false);
            }, 500); // Duración de la animación
        }, 2000); // Cada 2 segundos

        return () => clearInterval(intervalId);
    }, [open]); // Solo depende de 'open'

    return (
        <div className="fixed z-[120] right-4 bottom-4">
            {!open && (
                <button
                    aria-label={label}
                    onClick={() => setOpen(true)}
                    className={`absolute bottom-0 right-0 shadow-xl rounded-full w-14 h-14 sm:w-16 sm:h-16 bg-white p-0 overflow-hidden border border-green-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 transition-transform duration-200 hover:scale-110 ${isAnimating ? 'animate-shake' : ''}`}
                    title="WhatsApp"
                >
                    <img
                        src="/images/WSPLOGO.webp"
                        alt="WhatsApp"
                        className="w-full h-full object-contain"
                        loading="lazy"
                    />
                </button>
            )}

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute bottom-0 right-0 w-[300px] sm:w-[360px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-500"
                    >
                        {/* Header */}
                        <div className="bg-[#25D366] text-white flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2">
                                <img src="/images/WSPLOGO.webp" alt="WhatsApp" className="w-7 h-7 rounded-full bg-white p-1" />
                                <span className="font-semibold">WhatsApp</span>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                aria-label={label}
                                className="p-1 rounded-full hover:bg-white/20 cursor-pointer"
                                title="Cerrar"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="bg-gray-50 px-3 py-4 space-y-3">
                            <div className="max-w-[90%] rounded-2xl rounded-tl-none bg-white border border-gray-200 p-3 text-sm text-gray-800 shadow text-justify">
                                <Typewriter
                                    text="¡Hola!, Si tienes alguna duda acerca de nuestros productos, refacciones, servicios o cualquier otra cosa, pregúntanos. ¡Con gusto te atendemos!"
                                    className="text-justify"
                                    onComplete={handleFirstMessageComplete}
                                />
                            </div>
                            {isFirstMessageComplete && (
                                <div className="max-w-[90%] rounded-2xl rounded-tl-none bg-white border border-gray-200 p-3 text-sm text-gray-800 shadow text-justify">
                                    <Typewriter text="Resolvemos tus preguntas por WhatsApp en segundos." className="text-justify" delay={0.5} />
                                </div>
                            )}
                        </div>

                        <div className="px-3 pb-4">
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold py-2.5 rounded-xl shadow cursor-pointer"
                            >
                                Abrir el chat
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>
                {`
              @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
              }
              .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
              @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
              }
              .animate-blink { animation: blink 1s step-end infinite; }
            `}
            </style>
        </div>
    );
}
