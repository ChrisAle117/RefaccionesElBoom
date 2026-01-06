import React from 'react';
import { motion } from 'framer-motion';

const IG_POST_URL = 'https://www.instagram.com/p/DNtJjIeZDcK/';
const FB_REEL_URL = 'https://www.facebook.com/reel/1337334244009484/';
const TT_VIDEO_ID = '7554482077643590924';
const YT_VIDEO_ID = 'D70y8NI7nrM';
const YT_CHANNEL_URL = 'https://www.youtube.com/@elboomtractopartes2528';

function SocialCard({ title, headerClass, ctaHref, ctaLabel, children, isWide = false, delay = 0 }: { title: string; headerClass: string; ctaHref: string; ctaLabel: string; children: React.ReactNode; isWide?: boolean; delay?: number }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full ring-1 ring-gray-200 dark:ring-gray-800"
        >
            <header className={`${headerClass} text-white py-4 text-xl font-bold text-center shadow-inner`}>{title}</header>
            <div className="p-4 flex-grow">
                <div className={`relative mx-auto w-full ${isWide ? 'aspect-video' : 'max-w-sm aspect-[9/16] h-[560px]'} rounded-xl overflow-hidden bg-black shadow-2xl`}>
                    {children}
                </div>
            </div>
            <footer className="px-4 pb-5 mt-auto">
                <a href={ctaHref} target="_blank" rel="noreferrer" className="inline-block w-full text-center bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black dark:hover:bg-gray-100 transition shadow-lg active:scale-95">
                    {ctaLabel}
                </a>
            </footer>
        </motion.article>
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

function YouTubeEmbed({ videoId }: { videoId: string }) {
    return (
        <iframe
            title="YouTube"
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            style={{ border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    );
}

function TikTokEmbed({ videoId }: { videoId: string }) {
    return (
        <iframe
            title="TikTok"
            className="absolute inset-0 w-full h-full"
            src={`https://www.tiktok.com/embed/v2/${videoId}`}
            style={{ border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    );
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
        <section className="w-full bg-slate-50 dark:bg-slate-950 py-24 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-block px-4 py-1.5 mb-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 font-bold text-sm tracking-widest uppercase"
                    >
                        Nuestra Comunidad
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter"
                    >
                        CONTENIDO <span
                            className="text-yellow-500"
                            style={{ textShadow: "3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}
                        >EXCLUSIVO</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-slate-500 dark:text-slate-400 mt-8 text-xl max-w-3xl mx-auto leading-relaxed"
                    >
                        Sigue de cerca el mundo de los tractocamiones. Tutoriales, ofertas y el día a día en <span className="font-bold text-slate-900 dark:text-white underline decoration-yellow-500 decoration-4">Refaccionaria El Boom</span>.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 justify-center mb-16">
                    <SocialCard title="Facebook" headerClass="bg-[#1877F2]" ctaHref="https://facebook.com/elboomtractopartes" ctaLabel="Ver más en Facebook" delay={0.1}>
                        <FacebookEmbed reelUrl={FB_REEL_URL} />
                    </SocialCard>
                    <SocialCard title="Instagram" headerClass="bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" ctaHref="https://instagram.com/elboomtractopartes" ctaLabel="Ver más en Instagram" delay={0.2}>
                        <IGEmbedScaled postUrl={IG_POST_URL} />
                    </SocialCard>
                    <SocialCard title="TikTok" headerClass="bg-black" ctaHref="https://www.tiktok.com/@elboomtractopartes" ctaLabel="Síguenos en TikTok" delay={0.3}>
                        <TikTokEmbed videoId={TT_VIDEO_ID} />
                    </SocialCard>
                </div>

                <div className="max-w-5xl mx-auto">
                    <SocialCard title="YouTube" headerClass="bg-[#FF0000]" ctaHref={YT_CHANNEL_URL} ctaLabel="Ver más en YouTube" isWide delay={0.4}>
                        <YouTubeEmbed videoId={YT_VIDEO_ID} />
                    </SocialCard>
                </div>
            </div>
        </section>
    );
}
