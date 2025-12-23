import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import { SharedData } from '@/types';

interface LocationSelectorProps {
    className?: string;
}

export function LocationSelector({ className = '' }: LocationSelectorProps) {
    const { auth } = usePage<SharedData>().props;
    const [postalCode, setPostalCode] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Función para cargar el código postal
        const loadUserPostalCode = async () => {
            try {
                if (!auth?.user?.id) {
                    setLoading(false);
                    return;
                }

                // Intentar obtener la dirección primero mediante la relación
                const userWithAddress = auth?.user as (SharedData['auth']['user'] & { address?: { codigo_postal?: string } }) | undefined;
                if (userWithAddress?.address?.codigo_postal) {
                    setPostalCode(userWithAddress.address.codigo_postal ?? "");
                    setLoading(false);
                    return;
                }

                // Si no está en auth, hacer una petición al servidor
                const response = await fetch('/api/user/address', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin'
                });

                if (!response.ok) {
                    throw new Error(`Error al obtener la dirección: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.address) {
                    setPostalCode(data.address.codigo_postal || '');
                } else {
                    /* ignore */
                }
            } catch {
                /* ignore */
            } finally {
                setLoading(false);
            }
        };

        loadUserPostalCode();
    }, [auth]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Función para actualizar el código postal del usuario
    const handleUpdateLocation = async (newPostalCode: string) => {
        if (!newPostalCode || newPostalCode.length !== 5) {
            alert('Por favor, ingresa un código postal válido de 5 dígitos');
            return;
        }

        setIsModalOpen(false);

        try {
            // Mostrar el código postal
            setPostalCode(newPostalCode);

            // Enviar la actualización al backend
            const response = await fetch('/api/user/update-address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    codigo_postal: newPostalCode
                }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error al actualizar el código postal');
            }


        } catch {
            /* ignore */
        }
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 text-white px-3 py-2 hover:text-[#FBCC13] transition-colors w-full cursor-pointer rounded-none"
            >
                <MapPin className="h-6 w-6 flex-shrink-0" />
                <div className="flex flex-col text-center w-full">
                    <span className="text-sm font-medium leading-tight">Cotización de envío:</span>
                    <span className="text-sm font-normal">
                        {loading ? 'Cargando...' : ` C.P: ${postalCode || 'No seleccionado'}`}
                    </span>
                </div>
            </button>

            {/* Modal para cambiar ubicación */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Cotización de envío</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ingresa tu código postal
                            </label>
                            <input
                                type="text"
                                placeholder="Ej. 62785"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006CFA]"
                                value={postalCode}
                                onChange={(e) => {
                                    // Solo permitir dígitos
                                    const value = e.target.value.replace(/\D/g, '');
                                    setPostalCode(value);
                                }}
                                maxLength={5}
                                pattern="[0-9]{5}"
                                inputMode="numeric"
                            />
                            {postalCode && postalCode.length < 5 && (
                                <p className="text-xs text-red-500 mt-1">
                                    El código postal debe tener 5 dígitos
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleUpdateLocation(postalCode)}
                                className="px-4 py-2 bg-[#006CFA] text-white rounded-md hover:bg-[#0055b3]"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
