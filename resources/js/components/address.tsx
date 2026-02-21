import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";

interface AddressProps {
    onRegisterSuccess?: () => void;
}

export function Address({ onRegisterSuccess }: AddressProps) {
    const [data, setDataState] = useState({
        calle: '',
        colonia: '',
        numero_exterior: '',
        numero_interior: '',
        codigo_postal: '',
        estado: '',
        ciudad: '',
        telefono: '',
        referencia: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState<string>('');

    const setData = (key: string, value: string) => {
        setDataState(prev => ({ ...prev, [key]: value }));
    };

    const [colonias, setColonias] = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setServerError('');
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await axios.post('/addresses', data, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                withCredentials: true,
            });
            if (response.data?.success) {
                if (onRegisterSuccess) onRegisterSuccess();
            } else {
                setServerError(response.data?.message || 'Error desconocido al guardar.');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 422) {
                    setErrors(err.response.data.errors ?? {});
                } else {
                    const msg = err.response?.data?.message || err.message || 'Error del servidor al guardar la dirección.';
                    setServerError(msg);
                    console.error('Address save error:', err.response?.data);
                }
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleCpChange = async (cp: string) => {
        setData('codigo_postal', cp);

        if (cp.length === 5) {
            try {
                const res = await axios.get(`/postal-info/${cp}`);
                setData('estado', res.data.estado);
                setData('ciudad', res.data.municipio);
                setColonias(res.data.colonias);
                setData('colonia', res.data.colonias[0] || '');
            } catch {
                setColonias([]);
                setData('estado', '');
                setData('ciudad', '');
                setData('colonia', '');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
                <h3 className="font-bold">Agregar una dirección</h3>
                {serverError && (
                    <div className="text-red-600 bg-red-50 border border-red-200 rounded p-3 text-sm">
                        ⚠️ {serverError}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="calle">Calle*</Label>
                        <Input type="text" id="calle" required value={data.calle} onChange={e => setData('calle', e.target.value)} />
                        {errors.calle && <div className="text-red-500 text-xs mt-1">{errors.calle}</div>}
                    </div>

                    <div>
                        <Label htmlFor="colonia">Colonia*</Label>
                        {colonias.length > 0 ? (
                            <select
                                id="colonia"
                                required
                                value={data.colonia}
                                onChange={e => setData('colonia', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            >
                                {colonias.map((col) => (
                                    <option className="cursor-pointer hover:bg-[#FBCC13] " key={col} value={col} style={{ cursor: 'pointer' }}>{col}</option>
                                ))}
                            </select>
                        ) : (
                            <Input type="text" id="colonia" required value={data.colonia} onChange={e => setData('colonia', e.target.value)} readOnly />
                        )}
                        {errors.colonia && <div className="text-red-500 text-xs mt-1">{errors.colonia}</div>}
                    </div>

                    <div>
                        <Label htmlFor="numero_exterior">Número exterior</Label>
                        <Input type="text" id="numero_exterior" placeholder="Opcional" value={data.numero_exterior} onChange={e => setData('numero_exterior', e.target.value)} />
                        {errors.numero_exterior && <div className="text-red-500 text-xs mt-1">{errors.numero_exterior}</div>}
                    </div>

                    <div>
                        <Label htmlFor="numero_interior">Número interior</Label>
                        <Input type="text" id="numero_interior" placeholder="Opcional" value={data.numero_interior} onChange={e => setData('numero_interior', e.target.value)} />
                        {errors.numero_interior && <div className="text-red-500 text-xs mt-1">{errors.numero_interior}</div>}
                    </div>

                    <div>
                        <Label htmlFor="codigo_postal">Código postal*</Label>
                        <Input
                            type="text"
                            id="codigo_postal"
                            required
                            value={data.codigo_postal}
                            onChange={e => handleCpChange(e.target.value)}
                        />
                        {errors.codigo_postal && <div className="text-red-500 text-xs mt-1">{errors.codigo_postal}</div>}
                    </div>

                    <div>
                        <Label htmlFor="estado">Estado*</Label>
                        <Input type="text" id="estado" required value={data.estado} onChange={e => setData('estado', e.target.value)} readOnly />
                        {errors.estado && <div className="text-red-500 text-xs mt-1">{errors.estado}</div>}
                    </div>

                    <div>
                        <Label htmlFor="ciudad">Ciudad o municipio*</Label>
                        <Input type="text" id="ciudad" required value={data.ciudad} onChange={e => setData('ciudad', e.target.value)} readOnly />
                        {errors.ciudad && <div className="text-red-500 text-xs mt-1">{errors.ciudad}</div>}
                    </div>

                    <div>
                        <Label htmlFor="telefono">Teléfono*</Label>
                        <Input type="text" id="telefono" required value={data.telefono} onChange={e => setData('telefono', e.target.value)} />
                        {errors.telefono && <div className="text-red-500 text-xs mt-1">{errors.telefono}</div>}
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="referencia">Referencia*</Label>
                        <Input type="text" id="referencia" placeholder="Opcional" value={data.referencia} onChange={e => setData('referencia', e.target.value)} />
                        {errors.referencia && <div className="text-red-500 text-xs mt-1">{errors.referencia}</div>}
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={processing}
                    className="w-auto px-8 h-11 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all"
                >
                    Guardar dirección
                </Button>
            </div>
        </form>
    );
}