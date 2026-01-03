
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { TabNavigation } from '@/components/TabNavigation';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="El Boom Tractopartes" />

            {/* Componente de navegación por tabs */}
            <TabNavigation stickyOffset="top-[72px]" showPurchases={true} fullWidth={true} />
        </AppLayout>
    );
}