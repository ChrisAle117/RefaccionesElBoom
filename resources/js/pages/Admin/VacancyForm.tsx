import React, { useMemo, useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import {
    Briefcase, Save, X, Info,
    Mail, CheckCircle2, GripVertical, Plus,
    Trash2, FolderPlus, Ungroup, ArrowLeft,
    Clock
} from 'lucide-react';

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

    const handleRequirementChange = (index: number, value: string) => {
        const arr = [...data.requirements];
        const current = arr[index];
        arr[index] = isGroup(current) ? { ...current, title: value } : value;
        setData('requirements', arr);
    };

    const addRequirement = () => setData('requirements', [...data.requirements, '']);
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

    const startDrag = (type: 'requirements' | 'benefits', index: number) => setDragging({ type, index });
    const startDragSub = (type: 'req-sub' | 'ben-sub', index: number, subIndex: number) => setDragging({ type, index, subIndex });

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

    // Benefits helpers
    const handleBenefitChange = (index: number, value: string) => {
        const arr = [...data.benefits];
        const current = arr[index];
        arr[index] = isGroup(current) ? { ...current, title: value } : value;
        setData('benefits', arr);
    };

    const addBenefit = () => setData('benefits', [...data.benefits, '']);
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

    const dropOnBenefit = (toIndex: number) => {
        if (!dragging || dragging.type !== 'benefits') return;
        if (dragging.index === toIndex) return setDragging(null);
        setData('benefits', moveItem(data.benefits, dragging.index, toIndex));
        setDragging(null);
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
        <AdminLayout title={isEditMode ? 'Editar Vacante' : 'Nueva Vacante'}>
            <Head title={isEditMode ? 'Editar Vacante' : 'Nueva Vacante'} />

            <div className="container mx-auto p-2 sm:p-4 max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-sky-100">
                            <Briefcase className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black font-title text-gray-900 leading-none">
                                {isEditMode ? 'Editar Vacante' : 'Nueva Vacante'}
                            </h1>
                            <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5">Talento y Cultura</p>
                        </div>
                    </div>

                    <Link
                        href={route('admin.vacancies.index')}
                        className="h-11 w-11 flex items-center justify-center bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-gray-900 hover:shadow-md transition-all"
                    >
                        <X className="w-6 h-6" />
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Columna Principal - Info General */}
                        <div className="lg:col-span-2 space-y-6">
                            <section className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                                <h3 className="text-[10px] font-black text-sky-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                    <Info className="w-3 h-3" /> Ficha de Identificación
                                </h3>

                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">TÍTULO DEL PUESTO</label>
                                        <input
                                            type="text"
                                            className={`w-full h-14 px-6 border-2 rounded-2xl bg-gray-50/50 hover:bg-white hover:border-sky-100 focus:bg-white focus:border-sky-600 focus:outline-none transition-all text-sm font-black shadow-inner ${errors.title ? 'border-red-200 bg-red-50' : 'border-gray-50'}`}
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Ej: Auxiliar de Almacén Nocturno"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Departamento Selector */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3 ml-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DEPARTAMENTO</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setInputMode(m => ({ ...m, department: !m.department }))}
                                                    className="text-[9px] font-black text-sky-600 uppercase"
                                                >
                                                    {inputMode.department ? 'VER LISTA' : '+ NUEVO'}
                                                </button>
                                            </div>
                                            {inputMode.department ? (
                                                <input
                                                    type="text"
                                                    className="w-full h-12 px-5 border-2 border-sky-100 rounded-xl bg-sky-50/30 focus:border-sky-600 text-sm font-bold"
                                                    value={data.department}
                                                    onChange={(e) => setData('department', e.target.value)}
                                                    placeholder="Nuevo departamento..."
                                                />
                                            ) : (
                                                <select
                                                    className="w-full h-12 px-5 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:border-sky-600 text-sm font-black"
                                                    value={data.department}
                                                    onChange={(e) => setData('department', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Selecciona...</option>
                                                    {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
                                                </select>
                                            )}
                                        </div>

                                        {/* Ubicación Selector */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3 ml-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">UBICACIÓN / SUCURSAL</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setInputMode(m => ({ ...m, location: !m.location }))}
                                                    className="text-[9px] font-black text-sky-600 uppercase"
                                                >
                                                    {inputMode.location ? 'VER LISTA' : '+ NUEVA'}
                                                </button>
                                            </div>
                                            {inputMode.location ? (
                                                <input
                                                    type="text"
                                                    className="w-full h-12 px-5 border-2 border-sky-100 rounded-xl bg-sky-50/30 focus:border-sky-600 text-sm font-bold"
                                                    value={data.location}
                                                    onChange={(e) => setData('location', e.target.value)}
                                                    placeholder="Nueva ubicación..."
                                                />
                                            ) : (
                                                <select
                                                    className="w-full h-12 px-5 border-2 border-gray-50 rounded-xl bg-gray-50/50 focus:border-sky-600 text-sm font-black"
                                                    value={data.location}
                                                    onChange={(e) => setData('location', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Selecciona...</option>
                                                    {locations.map((l, i) => <option key={i} value={l}>{l}</option>)}
                                                </select>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">DESCRIPCIÓN BREVE DEL PUESTO</label>
                                        <textarea
                                            rows={4}
                                            className="w-full p-6 border-2 border-gray-50 rounded-[2rem] bg-gray-50/50 hover:bg-white focus:bg-white focus:border-sky-600 focus:outline-none transition-all text-sm font-medium shadow-inner leading-relaxed"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Resume el propósito del cargo y sus responsabilidades principales..."
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                                <h3 className="text-[10px] font-black text-sky-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Requisitos y Perfil
                                </h3>

                                <div className="space-y-4">
                                    {data.requirements.map((item, index) => (
                                        <DynamicItemRow
                                            key={index}
                                            item={item}
                                            index={index}
                                            type="requirements"
                                            groups={requirementGroupOptions}
                                            onChange={handleRequirementChange}
                                            onRemove={() => removeRequirement(index)}
                                            onConvertToGroup={() => convertRequirementToGroup(index)}
                                            onAssignToGroup={(gi) => assignRequirementToGroup(index, gi)}
                                            onFlatten={() => flattenRequirementGroup(index)}
                                            onStartDrag={() => startDrag('requirements', index)}
                                            onDrop={() => dropOnRequirement(index)}
                                            onSubChange={(si, val) => handleReqSubChange(index, si, val)}
                                            onSubRemove={(si) => removeReqSub(index, si)}
                                            onSubAdd={() => addReqSub(index)}
                                            onSubStartDrag={(si) => startDragSub('req-sub', index, si)}
                                            onSubDrop={(si) => dropOnReqSub(index, si)}
                                        />
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addRequirement}
                                        className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 hover:border-sky-200 hover:text-sky-600 transition-all"
                                    >
                                        <Plus className="w-4 h-4" /> Añadir Requisito
                                    </button>
                                </div>
                            </section>

                            <section className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3" /> Compensación y Beneficios
                                </h3>

                                <div className="space-y-4">
                                    {data.benefits.map((item, index) => (
                                        <DynamicItemRow
                                            key={index}
                                            item={item}
                                            index={index}
                                            type="benefits"
                                            groups={benefitGroupOptions}
                                            onChange={handleBenefitChange}
                                            onRemove={() => removeBenefit(index)}
                                            onConvertToGroup={() => convertBenefitToGroup(index)}
                                            onAssignToGroup={(gi) => assignBenefitToGroup(index, gi)}
                                            onFlatten={() => flattenBenefitGroup(index)}
                                            onStartDrag={() => startDrag('benefits', index)}
                                            onDrop={() => dropOnBenefit(index)}
                                            onSubChange={(si, val) => handleBenSubChange(index, si, val)}
                                            onSubRemove={(si) => removeBenSub(index, si)}
                                            onSubAdd={() => addBenSub(index)}
                                            onSubStartDrag={(si) => startDragSub('ben-sub', index, si)}
                                            onSubDrop={(si) => dropOnBenSub(index, si)}
                                        />
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addBenefit}
                                        className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 hover:border-emerald-200 hover:text-emerald-600 transition-all"
                                    >
                                        <Plus className="w-4 h-4" /> Añadir Beneficio
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* Columna Lateral - Config y Contacto */}
                        <div className="space-y-6">
                            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full opacity-50 -mr-16 -mt-16 group-hover:scale-110 transition-transform" />

                                <div className="relative z-10">
                                    <h3 className="text-[10px] font-black text-sky-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> Canales de Recepción
                                    </h3>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">EMAIL DE CONTACTO</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="email"
                                                    className="w-full h-12 pl-12 pr-4 bg-gray-50/50 border-2 border-gray-50 rounded-2xl text-sm font-bold text-gray-900 focus:border-sky-600 focus:bg-white focus:outline-none transition-all shadow-inner"
                                                    value={data.contact_email}
                                                    onChange={(e) => setData('contact_email', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-50">
                                            <label className="flex items-center gap-4 cursor-pointer group/toggle">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={data.active}
                                                        onChange={(e) => setData('active', e.target.checked)}
                                                    />
                                                    <div className="w-12 h-6 bg-gray-200 rounded-full peer-checked:bg-emerald-500 transition-colors shadow-inner" />
                                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform shadow-sm" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest group-hover/toggle:text-emerald-600 transition-colors">VACANTE ACTIVA</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">Visible en portal de empleo</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </section>


                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-4 z-20 flex flex-col sm:flex-row items-center gap-3 mt-8">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:flex-1 h-16 bg-sky-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-sky-200 hover:bg-sky-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:bg-sky-400"
                        >
                            <Save className={`${processing ? 'animate-pulse' : ''} w-5 h-5`} />
                            {processing ? 'GUARDANDO...' : (isEditMode ? 'ACTUALIZAR VACANTE' : 'PUBLICAR VACANTE')}
                        </button>

                        <Link
                            href={route('admin.vacancies.index')}
                            className="w-full sm:w-auto h-16 px-10 bg-white text-gray-400 border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> CANCELAR
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

// Sub-componente para filas dinámicas (Requirements/Benefits)
interface DynamicRowProps {
    item: Item;
    index: number;
    type: string;
    groups: { i: number; g: Group | null }[];
    onChange: (i: number, val: string) => void;
    onRemove: () => void;
    onConvertToGroup: () => void;
    onAssignToGroup: (gi: number) => void;
    onFlatten: () => void;
    onStartDrag: () => void;
    onDrop: () => void;
    onSubChange: (si: number, v: string) => void;
    onSubRemove: (si: number) => void;
    onSubAdd: () => void;
    onSubStartDrag: (si: number) => void;
    onSubDrop: (si: number) => void;
}

const DynamicItemRow: React.FC<DynamicRowProps> = (props) => {
    const { item, index, groups, onChange, onRemove, onConvertToGroup, onAssignToGroup, onFlatten, onStartDrag, onDrop } = props;

    return (
        <div
            className={`group/row p-2 sm:p-4 border-2 rounded-2xl transition-all ${isGroup(item) ? 'bg-gray-50/50 border-gray-100' : 'bg-white border-gray-50 hover:border-sky-100'}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
        >
            {isGroup(item) ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button type="button" className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-900" draggable onDragStart={onStartDrag}>
                            <GripVertical className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            className="flex-1 h-12 px-5 bg-white border border-gray-200 rounded-xl text-sm font-black uppercase text-sky-600 focus:border-sky-600"
                            value={item.title}
                            onChange={(e) => onChange(index, e.target.value)}
                            placeholder="TÍTULO DEL GRUPO..."
                        />
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={onFlatten} title="Desagrupar" className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-sky-600 transition-all"><Ungroup className="w-4 h-4" /></button>
                            <button type="button" onClick={onRemove} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-300 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="pl-6 sm:pl-10 space-y-3">
                        {item.items.map((sub, sidx) => (
                            <div key={sidx} className="flex items-center gap-3" onDragOver={(e) => e.preventDefault()} onDrop={() => props.onSubDrop(sidx)}>
                                <button type="button" className="cursor-grab active:cursor-grabbing text-gray-200" draggable onDragStart={() => props.onSubStartDrag(sidx)}>
                                    <GripVertical className="w-4 h-4" />
                                </button>
                                <input
                                    type="text"
                                    className="flex-1 h-10 px-4 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:border-sky-600 shadow-sm"
                                    value={sub}
                                    onChange={(e) => props.onSubChange(sidx, e.target.value)}
                                    placeholder="Sub-ítem..."
                                />
                                <button type="button" onClick={() => props.onSubRemove(sidx)} className="text-gray-300 hover:text-rose-500"><X className="w-4 h-4" /></button>
                            </div>
                        ))}
                        <button type="button" onClick={props.onSubAdd} className="text-[9px] font-black text-sky-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline px-7">
                            <Plus className="w-3 h-3" /> Añadir ítem al grupo
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 sm:gap-4">
                    <button type="button" className="cursor-grab active:cursor-grabbing text-gray-200 group-hover/row:text-gray-400" draggable onDragStart={onStartDrag}>
                        <GripVertical className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        className="flex-1 h-12 px-5 bg-transparent border-none rounded-xl text-sm font-medium focus:bg-gray-50 focus:ring-0"
                        value={item as string}
                        onChange={(e) => onChange(index, e.target.value)}
                        placeholder="Añadir ítem..."
                    />

                    <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <select
                            className="h-9 px-2 bg-white border border-gray-100 rounded-lg text-[9px] font-black uppercase text-gray-400 focus:text-sky-600 outline-none"
                            onChange={(e) => { const gi = parseInt(e.target.value); if (!isNaN(gi)) onAssignToGroup(gi); e.target.selectedIndex = 0; }}
                        >
                            <option value="">AGRUPAR</option>
                            {groups.map((opt) => (
                                <option key={opt.i} value={opt.i}>{opt.g!.title || `GRUPO ${opt.i + 1}`}</option>
                            ))}
                        </select>
                        <button type="button" onClick={onConvertToGroup} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-sky-600" title="Crear Grupo"><FolderPlus className="w-4 h-4" /></button>
                        <button type="button" onClick={onRemove} className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VacancyForm;