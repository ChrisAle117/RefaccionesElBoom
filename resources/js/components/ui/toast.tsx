import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Style map ────────────────────────────────────────────────────────────────

const toastConfig: Record<ToastType, { icon: React.ReactNode; bg: string; border: string; text: string; iconColor: string }> = {
    success: {
        icon: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
        bg: 'bg-white dark:bg-gray-900',
        border: 'border-l-4 border-l-green-500',
        text: 'text-gray-800 dark:text-white',
        iconColor: 'text-green-500',
    },
    error: {
        icon: <XCircle className="w-5 h-5 flex-shrink-0" />,
        bg: 'bg-white dark:bg-gray-900',
        border: 'border-l-4 border-l-red-500',
        text: 'text-gray-800 dark:text-white',
        iconColor: 'text-red-500',
    },
    warning: {
        icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
        bg: 'bg-white dark:bg-gray-900',
        border: 'border-l-4 border-l-yellow-400',
        text: 'text-gray-800 dark:text-white',
        iconColor: 'text-yellow-500',
    },
    info: {
        icon: <Info className="w-5 h-5 flex-shrink-0" />,
        bg: 'bg-white dark:bg-gray-900',
        border: 'border-l-4 border-l-blue-500',
        text: 'text-gray-800 dark:text-white',
        iconColor: 'text-blue-500',
    },
};

// ─── Single Toast Item ─────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const cfg = toastConfig[toast.type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className={`
                flex items-start gap-3 w-[340px] max-w-[90vw] px-4 py-3.5 rounded-xl shadow-2xl
                ${cfg.bg} ${cfg.border} ${cfg.text}
                ring-1 ring-black/5 dark:ring-white/10
            `}
        >
            {/* Icon */}
            <span className={`mt-0.5 ${cfg.iconColor}`}>{cfg.icon}</span>

            {/* Message */}
            <p className="flex-1 text-sm font-semibold leading-snug">{toast.message}</p>

            {/* Dismiss button */}
            <button
                onClick={() => onDismiss(toast.id)}
                className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Cerrar"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) { clearTimeout(timer); timers.current.delete(id); }
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev.slice(-4), { id, type, message, duration }]); // max 5 toasts
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
    }, [dismiss]);

    const helpers: ToastContextValue = {
        showToast,
        success: (m, d) => showToast(m, 'success', d),
        error: (m, d) => showToast(m, 'error', d),
        warning: (m, d) => showToast(m, 'warning', d),
        info: (m, d) => showToast(m, 'info', d),
    };

    return (
        <ToastContext.Provider value={helpers}>
            {children}

            {/* Toast container — fixed bottom-right */}
            <div
                className="fixed bottom-6 right-4 z-[99999] flex flex-col gap-2 items-end pointer-events-none"
                aria-live="polite"
                aria-atomic="true"
            >
                <AnimatePresence initial={false}>
                    {toasts.map(t => (
                        <div key={t.id} className="pointer-events-auto">
                            <ToastItem toast={t} onDismiss={dismiss} />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
}
