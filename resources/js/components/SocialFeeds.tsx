import React from 'react';

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
        <section className="w-full bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Redes sociales</h2>
                    <p className="text-gray-600 mt-1">Conoce más de Refaccionaria El Boom Tractopartes en nuestras redes.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
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
