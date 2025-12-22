import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { DetailsPurchase, ProductData } from '@/components/details-purchase';
import { BreadcrumbItem } from '@/types';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Confirmación de compra',
        href: '/confirmation',
    },
];
const Confirmation: React.FC = () => {
    const { url } = usePage();
    useEffect(() => {
        const isFromOpenpay = () => {
            try {
                const ref = document.referrer || '';
                return /openpay\./i.test(ref) || /openpay\b/i.test(ref);
            } catch { return false; }
        };
        const redirectIfExpectBack = () => {
            try {
                const expect = sessionStorage.getItem('boom_openpay_expect_back');
                const orderId = sessionStorage.getItem('boom_openpay_order_id');
                if (expect === '1' && orderId) {
                    sessionStorage.removeItem('boom_openpay_expect_back');
                    const url = `${window.location.origin}/payment-back-handler?order_id=${encodeURIComponent(orderId)}`;
                    window.location.replace(url);
                }
            } catch {}
        };
        redirectIfExpectBack();
        if (isFromOpenpay()) {
            redirectIfExpectBack();
        }
        const onPageShow = (ev: PageTransitionEvent) => {
            if ((ev as any).persisted) redirectIfExpectBack();
        };
        const onVisibility = () => {
            if (!document.hidden) {
                try {
                    const navEntries: any = (performance as any).getEntriesByType?.('navigation') || [];
                    const nav = navEntries[0];
                    if (nav && nav.type === 'back_forward') {
                        redirectIfExpectBack();
                    }
                } catch {}
            }
        };
        window.addEventListener('pageshow', onPageShow);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('pageshow', onPageShow);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, []);
    const searchParams = new URLSearchParams(url?.split('?')[1] || '');
    const productParam = searchParams.get('product');
    let product: ProductData | undefined;
    if (productParam) {
        try {
            product = JSON.parse(productParam);
        } catch (e) {
            // console.error('Error al parsear el producto:', e);
        }
    }
    return (
        <div>
            <Head title="Confirmación de compra" />
            <DetailsPurchase product={product} />
        </div>
    );
};

export default Confirmation;