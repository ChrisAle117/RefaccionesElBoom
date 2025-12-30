import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    fullWidth?: boolean;
}

export default ({ children, breadcrumbs, fullWidth = false, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} fullWidth={fullWidth} {...props}>
        {children}
    </AppLayoutTemplate>
);
