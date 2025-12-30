import React from 'react';
import { motion } from 'framer-motion';

const IG_POST_URL = 'https://www.instagram.com/p/DNtJjIeZDcK/';
const FB_REEL_URL = 'https://www.facebook.com/reel/1337334244009484/';

function SocialCard({ title, headerClass, ctaHref, ctaLabel, children }: { title: string; headerClass: string; ctaHref: string; ctaLabel: string; children: React.ReactNode }) {
    return (
        <article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
            <header className={`${headerClass} text-white py-3 text-lg font-semibold text-center`}>{title}</header>
            <div className="p-4">
                <div className="relative mx-auto w-full max-w-sm aspect-[9/16] h-[560px] rounded-xl overflow-hidden bg-black">{children}</div>
            </div>
            <footer className="px-4 pb-5 mt-auto">
                <a href={ctaHref} target="_blank" rel="noreferrer" className="inline-block w-full text-center bg-gray-900 text-white font-medium py-2.5 rounded-xl hover:bg-black transition">
                    {ctaLabel}
                </a>
            </footer>
        </article>
    );
}

function FacebookEmbed({ reelUrl }: { reelUrl: string }) {
    const src = React.useMemo(() => {
        const base = 'https://www.facebook.com/plugins/video.php';
        const href = encodeURIComponent(reelUrl);
        return `${base}?href=${href}&show_text=false&width=360&height=640`;
    }, [reelUrl]);

    return <iframe title="Facebook" className="absolute inset-0 w-full h-full" src={src} style={{ border: 0 }} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" scrolling="no" />;
}

function IGEmbedScaled({ postUrl }: { postUrl: string }) {
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const [scale, setScale] = React.useState(1);
    const BASE_W = 400;
    const BASE_H = 585;

    React.useLayoutEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            const s = Math.min(w / BASE_W, h / BASE_H);
            setScale(s > 1 ? 1 : s);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div ref={wrapperRef} className="absolute inset-0 overflow-hidden rounded-xl">
            <div
                className="origin-top-left"
                style={{
                    width: BASE_W,
                    height: BASE_H,
                    transform: `scale(${scale}) translateY(-20px)`,
                    clipPath: 'inset(0 0 60px 0)',
                }}
            >
                <iframe
                    title="Instagram"
                    width={BASE_W}
                    height={BASE_H}
                    style={{ border: 0, overflow: 'hidden' }}
                    loading="lazy"
                    src={`${postUrl.replace(/\/?$/, '')}/embed`}
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            </div>
        </div>
    );
}

export default function SocialFeeds() {
    return (
        <section className="w-full bg-gray-50 dark:bg-gray-950 py-20">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-yellow-500 uppercase bg-yellow-500/10 rounded-full border border-yellow-500/20"
                    >
                        SÍGUENOS EN NUESTRAS REDES
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter"
                    >
                        CONTENIDO <span
                            className="text-yellow-500"
                            style={{ textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}
                        >EXCLUSIVO</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 dark:text-gray-400 mt-6 text-xl max-w-2xl mx-auto leading-relaxed"
                    >
                        Descubre las últimas noticias y el día a día de <span className="font-bold text-gray-900 dark:text-white">Refaccionaria El Boom</span>.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 justify-center">
                    <SocialCard title="Facebook" headerClass="bg-blue-600" ctaHref="https://facebook.com/elboomtractopartes" ctaLabel="Ver más en Facebook">
                        <FacebookEmbed reelUrl={FB_REEL_URL} />
                    </SocialCard>
                    <SocialCard title="Instagram" headerClass="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500" ctaHref="https://instagram.com/elboomtractopartes" ctaLabel="Ver más en Instagram">
                        <IGEmbedScaled postUrl={IG_POST_URL} />
                    </SocialCard>
                </div>
            </div>
        </section>
    );
}
