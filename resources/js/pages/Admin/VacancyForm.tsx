
import React, { useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

// Tipos de entrada: item simple o grupo con subitems
type Group = { title: string; items: string[] };
type Item = string | Group;

const isGroup = (x: Item): x is Group => typeof x === 'object' && x !== null && 'title' in x && Array.isArray((x as Group).items);

interface VacancyFormProps {
    vacancy?: {
        id: number;
        title: string;
        department: string;
        location: string;
        description: string;
        requirements: Item[];
        benefits: Item[];
        contact_email: string;
        active: boolean;
    };
    departments: string[];
    locations: string[];
}

const VacancyForm: React.FC<VacancyFormProps> = ({ vacancy, departments, locations }) => {
    const [inputMode, setInputMode] = useState({
        department: false,
        location: false
    });

    // Estado para manejar arrastre
    const [dragging, setDragging] = useState<
        | { type: 'requirements' | 'benefits'; index: number }
        | { type: 'req-sub' | 'ben-sub'; index: number; subIndex: number }
        | null
    >(null);

    const isEditMode = !!vacancy;

    const { data, setData, errors, post, put, processing } = useForm({
        title: vacancy?.title || '',
        department: vacancy?.department || '',
        location: vacancy?.location || '',
        description: vacancy?.description || '',
        requirements: vacancy?.requirements || [''],
        benefits: vacancy?.benefits || [''],
        contact_email: vacancy?.contact_email || 'capitalhumano@refaccioneselboom.com',
        active: vacancy?.active ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode) {
            put(route('admin.vacancies.update', vacancy.id));
        } else {
            post(route('admin.vacancies.store'));
        }
    };

    // Manejar requisitos como array dinámico
    const handleRequirementChange = (index: number, value: string) => {
        const arr = [...data.requirements];
        const current = arr[index];
        arr[index] = isGroup(current) ? { ...current, title: value } : value;
        setData('requirements', arr);
    };

    const addRequirement = () => {
        setData('requirements', [...data.requirements, '']);
    };

    const removeRequirement = (index: number) => {
        const arr = [...data.requirements];
        if (arr.length <= 1) return;
        arr.splice(index, 1);
        setData('requirements', arr);
    };

    const convertRequirementToGroup = (index: number) => {
        const arr = [...data.requirements];
        const val = arr[index];
        const title = isGroup(val) ? val.title : (typeof val === 'string' ? val : '');
        arr[index] = { title, items: [] } as Group;
        setData('requirements', arr);
    };

    const assignRequirementToGroup = (index: number, groupIndex: number) => {
        const arr = [...data.requirements];
        const val = arr[index];
        const grp = arr[groupIndex];
        if (typeof val !== 'string' || !isGroup(grp)) return;
        grp.items = [...grp.items, val];
        arr.splice(index, 1);
        setData('requirements', arr);
    };

    const flattenRequirementGroup = (index: number) => {
        const arr = [...data.requirements];
        const grp = arr[index];
        if (!isGroup(grp)) return;
        arr.splice(index, 1, grp.title, ...grp.items);
        setData('requirements', arr);
    };

    // Drag & Drop helpers - requisitos/beneficios
    const startDrag = (type: 'requirements' | 'benefits', index: number) => setDragging({ type, index });
    const startDragSub = (type: 'req-sub' | 'ben-sub', index: number, subIndex: number) => setDragging({ type, index, subIndex });

    const onDragOver = (e: React.DragEvent) => {
        // Necesario para permitir drop
        e.preventDefault();
    };

    const moveItem = <T,>(list: T[], from: number, to: number) => {
        const updated = [...list];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        return updated;
    };

    const dropOnRequirement = (toIndex: number) => {
        if (!dragging || dragging.type !== 'requirements') return;
        if (dragging.index === toIndex) return setDragging(null);
        setData('requirements', moveItem(data.requirements, dragging.index, toIndex));
        setDragging(null);
    };

    const dropOnBenefit = (toIndex: number) => {
        if (!dragging || dragging.type !== 'benefits') return;
        if (dragging.index === toIndex) return setDragging(null);
        setData('benefits', moveItem(data.benefits, dragging.index, toIndex));
        setDragging(null);
    };

    // Subitems de requisitos
    const handleReqSubChange = (groupIndex: number, subIndex: number, value: string) => {
        const arr = [...data.requirements];
        const grp = arr[groupIndex];
        if (!isGroup(grp)) return;
        const items = [...grp.items];
        items[subIndex] = value;
        arr[groupIndex] = { ...grp, items };
        setData('requirements', arr);
    };

    const addReqSub = (groupIndex: number) => {
        const arr = [...data.requirements];
        const grp = arr[groupIndex];
        if (!isGroup(grp)) return;
        arr[groupIndex] = { ...grp, items: [...grp.items, ''] };
        setData('requirements', arr);
    };

    const removeReqSub = (groupIndex: number, subIndex: number) => {
        const arr = [...data.requirements];
        const grp = arr[groupIndex];
        if (!isGroup(grp)) return;
        const items = [...grp.items];
        if (items.length <= 1) items[0] = '';
        else items.splice(subIndex, 1);
        arr[groupIndex] = { ...grp, items };
        setData('requirements', arr);
    };

    const dropOnReqSub = (groupIndex: number, toSubIndex: number) => {
        if (!dragging || dragging.type !== 'req-sub') return;
        if (dragging.index !== groupIndex) return;
        const arr = [...data.requirements];
        const grp = arr[groupIndex] as Group;
        const items = moveItem(grp.items, dragging.subIndex, toSubIndex);
        arr[groupIndex] = { ...grp, items };
        setData('requirements', arr);
        setDragging(null);
    };

    // Manejar beneficios como array dinámico
    const handleBenefitChange = (index: number, value: string) => {
        const arr = [...data.benefits];
        const current = arr[index];
        arr[index] = isGroup(current) ? { ...current, title: value } : value;
        setData('benefits', arr);
    };

    const addBenefit = () => {
        setData('benefits', [...data.benefits, '']);
    };

    const removeBenefit = (index: number) => {
        const arr = [...data.benefits];
        if (arr.length <= 1) return;
        arr.splice(index, 1);
        setData('benefits', arr);
    };

    const convertBenefitToGroup = (index: number) => {
        const arr = [...data.benefits];
        const val = arr[index];
        const title = isGroup(val) ? val.title : (typeof val === 'string' ? val : '');
        arr[index] = { title, items: [] } as Group;
        setData('benefits', arr);
    };

    const assignBenefitToGroup = (index: number, groupIndex: number) => {
        const arr = [...data.benefits];
        const val = arr[index];
        const grp = arr[groupIndex];
        if (typeof val !== 'string' || !isGroup(grp)) return;
        grp.items = [...grp.items, val];
        arr.splice(index, 1);
        setData('benefits', arr);
    };

    const flattenBenefitGroup = (index: number) => {
        const arr = [...data.benefits];
        const grp = arr[index];
        if (!isGroup(grp)) return;
        arr.splice(index, 1, grp.title, ...grp.items);
        setData('benefits', arr);
    };

    const handleBenSubChange = (groupIndex: number, subIndex: number, value: string) => {
        const arr = [...data.benefits];
        const grp = arr[groupIndex];
        if (!isGroup(grp)) return;
        const items = [...grp.items];
        items[subIndex] = value;
        arr[groupIndex] = { ...grp, items };
        setData('benefits', arr);
    };

    const addBenSub = (groupIndex: number) => {
        const arr = [...data.benefits];
        const grp = arr[groupIndex];
        if (!isGroup(grp)) return;
        arr[groupIndex] = { ...grp, items: [...grp.items, ''] };
        setData('benefits', arr);
    };

    const removeBenSub = (groupIndex: number, subIndex: number) => {
        const arr = [...data.benefits];
        const grp = arr[groupIndex];
        if (!isGroup(grp)) return;
        const items = [...grp.items];
        if (items.length <= 1) items[0] = '';
        else items.splice(subIndex, 1);
        arr[groupIndex] = { ...grp, items };
        setData('benefits', arr);
    };

    const dropOnBenSub = (groupIndex: number, toSubIndex: number) => {
        if (!dragging || dragging.type !== 'ben-sub') return;
        if (dragging.index !== groupIndex) return;
        const arr = [...data.benefits];
        const grp = arr[groupIndex] as Group;
        const items = moveItem(grp.items, dragging.subIndex, toSubIndex);
        arr[groupIndex] = { ...grp, items };
        setData('benefits', arr);
        setDragging(null);
    };

    const requirementGroupOptions = useMemo(() => (data.requirements).map((x, i) => ({ i, g: isGroup(x) ? x : null })).filter(x => x.g), [data.requirements]);
    const benefitGroupOptions = useMemo(() => (data.benefits).map((x, i) => ({ i, g: isGroup(x) ? x : null })).filter(x => x.g), [data.benefits]);

    return (
        <AdminLayout>
            <Head title={isEditMode ? 'Editar Vacante' : 'Crear Vacante'} />

            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{isEditMode ? 'Editar Vacante' : 'Crear Nueva Vacante'}</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit}>
                        {/* Título de la vacante */}
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Título de la vacante *
                            </label>
                            <input
                                id="title"
                                type="text"
                                className="w-full rounded-md border border-gray-300 focus:border-[#006CFA] focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                    Departamento *
                                </label>
                                <div className="mb-1 flex items-center">
                                    <label className="flex items-center text-sm text-gray-600 mr-4">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-[#006CFA]"
                                            checked={!inputMode.department}
                                            onChange={() => setInputMode({ ...inputMode, department: false })}
                                        />
                                        <span className="ml-1">Seleccionar existente</span>
                                    </label>
                                    <label className="flex items-center text-sm text-gray-600">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-[#006CFA]"
                                            checked={inputMode.department}
                                            onChange={() => setInputMode({ ...inputMode, department: true })}
                                        />
                                        <span className="ml-1">Nuevo departamento</span>
                                    </label>
                                </div>

                                {!inputMode.department && departments.length > 0 ? (
                                    <select
                                        id="department"
                                        className="w-full rounded-md border border-gray-300 focus:border-[#006CFA] focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                                        value={data.department}
                                        onChange={(e) => setData('department', e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccione un departamento</option>
                                        {departments.map((dept, index) => (
                                            <option key={index} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        id="department"
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 focus:border-[#006CFA] focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                                        value={data.department}
                                        onChange={(e) => setData('department', e.target.value)}
                                        placeholder="Ej: Ventas, Recursos Humanos, Logística"
                                        required
                                    />
                                )}
                                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    Ubicación *
                                </label>
                                <div className="mb-1 flex items-center">
                                    <label className="flex items-center text-sm text-gray-600 mr-4">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-[#006CFA]"
                                            checked={!inputMode.location}
                                            onChange={() => setInputMode({ ...inputMode, location: false })}
                                        />
                                        <span className="ml-1">Seleccionar existente</span>
                                    </label>
                                    <label className="flex items-center text-sm text-gray-600">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-[#006CFA]"
                                            checked={inputMode.location}
                                            onChange={() => setInputMode({ ...inputMode, location: true })}
                                        />
                                        <span className="ml-1">Nueva ubicación</span>
                                    </label>
                                </div>

                                {!inputMode.location && locations.length > 0 ? (
                                    <select
                                        id="location"
                                        className="w-full rounded-md border border-gray-300 focus:border-[#006CFA] focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccione una ubicación</option>
                                        {locations.map((loc, index) => (
                                            <option key={index} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        id="location"
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 focus:border-[#006CFA] focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="Ej: Cuernavaca, Morelos"
                                        required
                                    />
                                )}
                                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción *
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                className="w-full rounded-md border border-gray-300 focus:border-[#006CFA] focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                required
                            ></textarea>
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* Requisitos */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Requisitos *
                            </label>
                            {data.requirements.map((requirement: Item, index: number) => (
                                <div key={index} className="mb-2" onDragOver={onDragOver} onDrop={() => dropOnRequirement(index)}>
                                    {isGroup(requirement) ? (
                                        <div className="border rounded-md p-2 bg-gray-50">
                                            <div className="flex items-center mb-2">
                                                <span className="cursor-move text-gray-400 hover:text-gray-600 mr-2 px-1" draggable onDragStart={() => startDrag('requirements', index)}>☰</span>
                                                <input type="text" className="w-full rounded-md border border-gray-300 focus:border-[#006CFA] focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2" value={requirement.title} onChange={(e) => handleRequirementChange(index, e.target.value)} placeholder="Título del grupo (ej. Conocimiento básico en áreas como:)" required />
                                                <button type="button" className="ml-2 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-300" onClick={() => flattenRequirementGroup(index)}>Desagrupar</button>
                                                <button type="button" className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded border border-red-600 hover:bg-red-600" onClick={() => removeRequirement(index)} disabled={data.requirements.length <= 1}>-</button>
                                            </div>
                                            {(requirement.items || []).map((sub: string, sidx: number) => (
                                                <div key={sidx} className="flex items-center mb-2 ml-6" onDragOver={onDragOver} onDrop={() => dropOnReqSub(index, sidx)}>
                                                    <span className="cursor-move text-gray-400 hover:text-gray-600 mr-2 px-1" draggable onDragStart={() => startDragSub('req-sub', index, sidx)}>☰</span>
                                                    <input type="text" className="w-full rounded-md border border-gray-300 focus:border-[#006CFA] focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2" value={sub} onChange={(e) => handleReqSubChange(index, sidx, e.target.value)} placeholder="Ítem del grupo" required />
                                                    <button type="button" className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded border border-red-600 hover:bg-red-600" onClick={() => removeReqSub(index, sidx)}>-</button>
                                                </div>
                                            ))}
                                            <div className="ml-6">
                                                <button type="button" className="bg-[#006CFA] text-white text-xs px-2 py-1.5 rounded border border-blue-700 hover:bg-blue-600" onClick={() => addReqSub(index)}>+ Añadir ítem</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <span className="cursor-move text-gray-400 hover:text-gray-600 mr-2 px-1" draggable onDragStart={() => startDrag('requirements', index)}>☰</span>
                                            <input type="text" className="w-full rounded-md border border-gray-300 focus:border-[#006CFA] focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2" value={requirement as string} onChange={(e) => handleRequirementChange(index, e.target.value)} placeholder="Añadir requisito" required />
                                            <select className="ml-2 text-xs border rounded px-1 py-1" onChange={(e) => { const gi = parseInt(e.target.value); if (!isNaN(gi)) assignRequirementToGroup(index, gi); (e.target as HTMLSelectElement).selectedIndex = 0; }}>
                                                <option value="">→ Grupo</option>
                                                {requirementGroupOptions.map((opt) => (
                                                    <option key={opt.i} value={opt.i}>{opt.g!.title || `Grupo ${opt.i + 1}`}</option>
                                                ))}
                                            </select>
                                            <button type="button" className="ml-2 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-300" onClick={() => convertRequirementToGroup(index)}>Hacer grupo</button>
                                            <button type="button" className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded border border-red-600 hover:bg-red-600" onClick={() => removeRequirement(index)} disabled={(data.requirements as Item[]).length <= 1}>-</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                className="mt-2 bg-[#006CFA] text-white text-sm px-3 py-1.5 rounded border border-blue-700 hover:bg-blue-600 transition-colors"
                                onClick={addRequirement}
                            >
                                + Añadir requisito
                            </button>
                            {errors.requirements && <p className="text-red-500 text-sm mt-1">{errors.requirements}</p>}
                        </div>

                        {/* Beneficios */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Beneficios *
                            </label>
                            {data.benefits.map((benefit: Item, index: number) => (
                                <div key={index} className="mb-2" onDragOver={onDragOver} onDrop={() => dropOnBenefit(index)}>
                                    {isGroup(benefit) ? (
                                        <div className="border rounded-md p-2 bg-gray-50">
                                            <div className="flex items-center mb-2">
                                                <span className="cursor-move text-gray-400 hover:text-gray-600 mr-2 px-1" draggable onDragStart={() => startDrag('benefits', index)}>☰</span>
                                                <input type="text" className="w-full rounded-md border border-gray-300 focus:border-[#006CFA] focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2" value={benefit.title} onChange={(e) => handleBenefitChange(index, e.target.value)} placeholder="Título del grupo" required />
                                                <button type="button" className="ml-2 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-300" onClick={() => flattenBenefitGroup(index)}>Desagrupar</button>
                                                <button type="button" className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded border border-red-600 hover:bg-red-600" onClick={() => removeBenefit(index)} disabled={data.benefits.length <= 1}>-</button>
                                            </div>
                                            {(benefit.items || []).map((sub: string, sidx: number) => (
                                                <div key={sidx} className="flex items-center mb-2 ml-6" onDragOver={onDragOver} onDrop={() => dropOnBenSub(index, sidx)}>
                                                    <span className="cursor-move text-gray-400 hover:text-gray-600 mr-2 px-1" draggable onDragStart={() => startDragSub('ben-sub', index, sidx)}>☰</span>
                                                    <input type="text" className="w-full rounded-md border border-gray-300 focus:border-[#006CFA] focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2" value={sub} onChange={(e) => handleBenSubChange(index, sidx, e.target.value)} placeholder="Ítem del grupo" required />
                                                    <button type="button" className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded border border-red-600 hover:bg-red-600" onClick={() => removeBenSub(index, sidx)}>-</button>
                                                </div>
                                            ))}
                                            <div className="ml-6">
                                                <button type="button" className="bg-[#006CFA] text-white text-xs px-2 py-1.5 rounded border border-blue-700 hover:bg-blue-600" onClick={() => addBenSub(index)}>+ Añadir ítem</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <span className="cursor-move text-gray-400 hover:text-gray-600 mr-2 px-1" draggable onDragStart={() => startDrag('benefits', index)}>☰</span>
                                            <input type="text" className="w-full rounded-md border border-gray-300 focus:border-[#006CFA] focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2" value={benefit as string} onChange={(e) => handleBenefitChange(index, e.target.value)} placeholder="Añadir beneficio" required />
                                            <select className="ml-2 text-xs border rounded px-1 py-1" onChange={(e) => { const gi = parseInt(e.target.value); if (!isNaN(gi)) assignBenefitToGroup(index, gi); (e.target as HTMLSelectElement).selectedIndex = 0; }}>
                                                <option value="">→ Grupo</option>
                                                {benefitGroupOptions.map((opt) => (
                                                    <option key={opt.i} value={opt.i}>{opt.g!.title || `Grupo ${opt.i + 1}`}</option>
                                                ))}
                                            </select>
                                            <button type="button" className="ml-2 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-300" onClick={() => convertBenefitToGroup(index)}>Hacer grupo</button>
                                            <button type="button" className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded border border-red-600 hover:bg-red-600" onClick={() => removeBenefit(index)} disabled={(data.benefits as Item[]).length <= 1}>-</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                className="mt-2 bg-[#006CFA] text-white text-sm px-3 py-1.5 rounded border border-blue-700 hover:bg-blue-600 transition-colors"
                                onClick={addBenefit}
                            >
                                + Añadir beneficio
                            </button>
                            {errors.benefits && <p className="text-red-500 text-sm mt-1">{errors.benefits}</p>}
                        </div>

                        {/* Email de contacto */}
                        <div className="mb-4">
                            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email de contacto *
                            </label>
                            <input
                                id="contact_email"
                                type="email"
                                className="w-full rounded-md border border-gray-300 focus:border-[#006CFA] focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2"
                                value={data.contact_email}
                                onChange={(e) => setData('contact_email', e.target.value)}
                                required
                            />
                            {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>}
                        </div>

                        {/* Estado activo */}
                        <div className="mb-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    checked={data.active}
                                    onChange={(e) => setData('active', e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-gray-700">Vacante Activa</span>
                            </label>
                            <p className="text-sm text-gray-500 mt-1">
                                Las vacantes inactivas no se mostrarán en el sitio web.
                            </p>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-end space-x-2">
                            <a
                                href={route('admin.vacancies.index')}
                                className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded border border-gray-300 hover:bg-gray-300 transition-colors"
                            >
                                Cancelar
                            </a>
                            <button
                                type="submit"
                                className="px-4 py-1.5 bg-[#006CFA] cursor-pointer text-white text-sm rounded border border-blue-700 hover:bg-blue-600 transition-colors flex items-center"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {isEditMode ? 'Guardando...' : 'Creando...'}
                                    </>
                                ) : (
                                    isEditMode ? 'Guardar Cambios' : 'Crear Vacante'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default VacancyForm;