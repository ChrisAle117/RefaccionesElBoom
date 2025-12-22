import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useForm } from '@inertiajs/react';
import axios from "axios";

interface AddressProps {
    onRegisterSuccess?: () => void;
}

export function Address({ onRegisterSuccess }: AddressProps) {
    const { data, setData, post, processing, errors } = useForm({
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

    const [colonias, setColonias] = useState<string[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('addresses.store'), {
            onSuccess: () => {
                if (onRegisterSuccess) onRegisterSuccess();
            },
        });
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
            } catch (error) {
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
                                    <option className="cursor-pointer hover:bg-[#FBCC13] " key={col} value={col} style={{cursor: 'pointer'}}>{col}</option>
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
                    className="w-auto py-2 px-4 cursor-pointer bg-[#006CFA] text-white font-medium rounded-md shadow-sm hover:bg-[#FBCC13] hover:text-black"
                >
                    Guardar datos de dirección
                </Button>
            </div>
        </form>
    );
}