import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/toast';

export interface Notificacion {
    id: number;
    titulo: string;
    mensaje: string;
    leida: boolean;
    created_at: string;
}

export function useNotificaciones() {
    const { success } = useToast();
    const [notifications, setNotifications] = useState<Notificacion[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const shownIdsRef = useRef<Set<number>>(new Set());
    const successRef = useRef(success);


    useEffect(() => {
        try {
            const stored = sessionStorage.getItem('notificaciones_mostradas');
            if (stored) {
                const ids = JSON.parse(stored);
                if (Array.isArray(ids)) {
                    shownIdsRef.current = new Set(ids);
                }
            }
        } catch { /* silent */ }
    }, []);

    const persistShownIds = (id: number) => {
        shownIdsRef.current.add(id);
        try {
            sessionStorage.setItem('notificaciones_mostradas', JSON.stringify(Array.from(shownIdsRef.current)));
        } catch { /* silent */ }
    };


    useEffect(() => {
        successRef.current = success;
    }, [success]);

    const fetchNotifications = useCallback(async (all: boolean = false) => {
        try {

            let url = route('admin.notificaciones.index');
            if (all) {
                url += (url.includes('?') ? '&' : '?') + 'all=1';
            }

            console.log(`[useNotificaciones] Buscando: ${url} (all=${all})`);

            const res = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
            });

            if (!res.ok) {
                console.error(`[useNotificaciones] Error HTTP: ${res.status}`);
                return;
            }

            const data = await res.json();
            console.log('[useNotificaciones] Respuesta JSON:', data);

            if (data.success) {
                // NORMALIZACIÓN: Forzar leida a boolean sin importar si viene como 0, 1, "0", "1", true o false
                const normalizedData = (data.data || []).map((n: Record<string, unknown>) => ({
                    ...n,
                    id: Number(n.id),
                    titulo: String(n.titulo || ''),
                    mensaje: String(n.mensaje || ''),
                    created_at: String(n.created_at || ''),
                    leida: n.leida === true || n.leida === 1 || n.leida === '1'
                } as Notificacion));

                console.log('[useNotificaciones] Datos Normalizados:', normalizedData);
                setUnreadCount(Number(data.unreadCount) || 0);


                if (all || data.hayNuevas) {
                    setNotifications(normalizedData);
                }


                if (!all && data.hayNuevas) {
                    const nuevas = normalizedData.filter((n: Notificacion) => !shownIdsRef.current.has(n.id) && !n.leida);
                    console.log(`[useNotificaciones] ${nuevas.length} nuevas para avisar.`);

                    nuevas.forEach((n: Notificacion) => {
                        successRef.current(`${n.titulo}: ${n.mensaje}`, 8000);
                        persistShownIds(n.id);
                    });
                }
            }
        } catch (error) {
            console.error('[useNotificaciones] Error fatal fetch:', error);
        }
    }, []);
    const markAsRead = async (ids: number[]) => {
        try {
            if (!ids || ids.length === 0) return;

            console.log('[useNotificaciones] Marcando IDs:', ids);
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                || (window as unknown as { _token?: string })._token
                || document.querySelector('input[name="_token"]')?.getAttribute('value');


            const res = await fetch(route('admin.notificaciones.marcar-leidas'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'include',
                body: JSON.stringify({ ids }),
            });

            console.log('[useNotificaciones] Status de marcado:', res.status);

            if (res.ok) {
                setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, leida: true } : n));
                setUnreadCount(prev => Math.max(0, prev - ids.length));

                fetchNotifications(true);
            } else {
                const text = await res.text();
                console.error('[useNotificaciones] Respuesta no OK al marcar:', text.substring(0, 300));
            }
        } catch (error) {
            console.error('[useNotificaciones] Error fatal markAsRead:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        intervalRef.current = setInterval(() => fetchNotifications(false), 20000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
    };
}
