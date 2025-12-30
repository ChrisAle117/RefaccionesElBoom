import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
    fullWidth?: boolean;
}

export function AppContent({ variant = 'header', fullWidth = false, children, ...props }: AppContentProps) {
    if (variant === 'sidebar') {
        return <SidebarInset {...props}>{children}</SidebarInset>;
    }

    return (
        <main
            className={cn(
                "flex h-full w-full flex-1 flex-col gap-4",
                !fullWidth && "mx-auto max-w-7xl rounded-xl",
                props.className
            )}
            {...props}
        >
            {children}
        </main>
    );
}
