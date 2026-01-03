import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Briefcase, MapPin, Mail, Phone, ChevronDown, CheckCircle2, Search, Filter } from 'lucide-react';

type VacancyRequirement = string | {
    title?: string;
    items?: string[];
};

type Vacancy = {
    id: number;
    title: string;
    department: string;
    location: string;
    description: string;
    requirements: VacancyRequirement[];
    benefits: VacancyRequirement[];
    contact_email: string;
    active: boolean;
};

export function Vacancies() {
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedVacancy, setExpandedVacancy] = useState<number | null>(null);
    const [filterDepartment, setFilterDepartment] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [highlightedVacancy, setHighlightedVacancy] = useState<number | null>(null);

    const WHATSAPP_NUMBER = '527775005017';
    const buildWhatsAppUrl = (title: string) =>
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, me interesa la vacante: ${title}`)}`;

    useEffect(() => {
        const fetchVacancies = async () => {
            try {
                const response = await axios.get('/api/vacancies');
                setVacancies(response.data);
                setLoading(false);
            } catch {
                setError('No se pudieron cargar las vacantes. Por favor, inténtalo más tarde.');
                setLoading(false);
            }
        };
        fetchVacancies();
    }, []);

    const departments = Array.from(new Set(vacancies.map(v => v.department)));

    const isNonEmptyText = (val: unknown) => typeof val === 'string' && val.trim() !== '';
    const hasListContent = (list: unknown[]) =>
        Array.isArray(list) &&
        list.some((item: unknown) => {
            if (isNonEmptyText(item)) return true;
            if (item && typeof item === 'object') {
                const obj = item as { title?: string; items?: unknown[] };
                const titleOk = isNonEmptyText(obj.title);
                const itemsOk =
                    Array.isArray(obj.items) &&
                    obj.items.map((s: unknown) => String(s).trim()).filter(Boolean).length > 0;
                return titleOk || itemsOk;
            }
            return false;
        });

    const filteredVacancies = vacancies.filter(vacancy => {
        const matchesSearch =
            searchQuery === '' ||
            vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vacancy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vacancy.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDepartment = filterDepartment === '' || vacancy.department === filterDepartment;

        return matchesSearch && matchesDepartment;
    });

    const toggleExpand = (id: number) => {
        setExpandedVacancy(prev => (prev === id ? null : id));
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-yellow-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-yellow-500 animate-spin"></div>
                </div>
                <span className="text-gray-500 dark:text-gray-400 mt-6 font-bold tracking-widest text-sm uppercase">Buscando oportunidades...</span>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="py-12 bg-white dark:bg-gray-950 min-h-screen">
            {/* Premium Header */}
            <div className="text-center mb-16 px-4">

                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter"
                >
                    BOLSA DE <span
                        className="text-yellow-500"
                        style={{ textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}
                    >TRABAJO</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 dark:text-gray-400 mt-6 text-xl max-w-2xl mx-auto leading-relaxed px-4"
                >
                    Únete a un equipo apasionado por el servicio y la excelencia. <span className="text-gray-900 dark:text-white font-bold underline decoration-yellow-500 decoration-4">Impulsa tu carrera</span> con nosotros.
                </motion.p>
            </div>

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 shadow-xl shadow-gray-200/50 dark:shadow-none">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por puesto o ciudad..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all shadow-sm text-gray-900 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-64 relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                        <select
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all shadow-sm appearance-none text-gray-900 dark:text-white font-medium"
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                        >
                            <option value="">Departamentos</option>
                            {departments.map((dept, index) => (
                                <option key={index} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Vacancies List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {filteredVacancies.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No hay vacantes disponibles</h3>
                        <p className="text-gray-500 mt-2">Intenta ajustar tus filtros de búsqueda.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {filteredVacancies.map((vacancy) => (
                            <motion.div
                                key={vacancy.id}
                                variants={itemVariants}
                                className={`group bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border transition-all duration-500 ${expandedVacancy === vacancy.id
                                    ? 'border-yellow-500 ring-4 ring-yellow-500/5 shadow-2xl'
                                    : 'border-gray-100 dark:border-gray-800 hover:border-yellow-500/50 hover:shadow-xl'
                                    }`}
                            >
                                <div
                                    className="p-8 cursor-pointer"
                                    onClick={() => toggleExpand(vacancy.id)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex gap-5 items-start">
                                            <div className={`p-4 rounded-3xl transition-colors duration-500 ${expandedVacancy === vacancy.id ? 'bg-yellow-500 text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-yellow-500/10 group-hover:text-yellow-500'
                                                }`}>
                                                <Briefcase className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{vacancy.title}</h3>
                                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                                    <span className="flex items-center gap-1.5 text-sm font-bold text-yellow-500 uppercase tracking-wider">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        {vacancy.department}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        <MapPin className="w-4 h-4" />
                                                        {vacancy.location}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="hidden sm:block text-right">
                                                <p className="text-xs font-black uppercase tracking-widest text-green-500 mb-1">Estatus</p>
                                                <p className="text-sm font-bold dark:text-white">Contratación inmediata</p>
                                            </div>
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${expandedVacancy === vacancy.id ? 'bg-yellow-500 text-black rotate-180' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'
                                                }`}>
                                                <ChevronDown className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedVacancy === vacancy.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: "circOut" }}
                                        >
                                            <div className="px-8 pb-8 pt-2 border-t border-gray-100 dark:border-gray-800">
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                                    <div className="lg:col-span-2 space-y-8">
                                                        <div>
                                                            <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Descripción del puesto</h4>
                                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                                                                {vacancy.description}
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            {hasListContent(vacancy.requirements) && (
                                                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl">
                                                                    <h4 className="flex items-center gap-2 font-black uppercase tracking-widest text-xs text-blue-500 mb-4">
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                        Requisitos
                                                                    </h4>
                                                                    <ul className="space-y-3">
                                                                        {vacancy.requirements.map((req, i) => (
                                                                            <li key={i} className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
                                                                                <div className="flex gap-3">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                                                                    <span className={typeof req === 'object' ? 'font-black text-gray-900 dark:text-white' : ''}>
                                                                                        {typeof req === 'string' ? req : req.title}
                                                                                    </span>
                                                                                </div>
                                                                                {typeof req === 'object' && req.items && req.items.length > 0 && (
                                                                                    <ul className="pl-8 space-y-1 mt-1 border-l-2 border-blue-100 dark:border-blue-900/30 ml-0.5">
                                                                                        {req.items.map((sub, si) => (
                                                                                            <li key={si} className="text-xs text-gray-500 dark:text-gray-400 pl-3 relative before:content-['-'] before:absolute before:left-0">
                                                                                                {sub}
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                )}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            {hasListContent(vacancy.benefits) && (
                                                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl">
                                                                    <h4 className="flex items-center gap-2 font-black uppercase tracking-widest text-xs text-green-500 mb-4">
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                        Beneficios
                                                                    </h4>
                                                                    <ul className="space-y-3">
                                                                        {vacancy.benefits.map((benefit, i) => (
                                                                            <li key={i} className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
                                                                                <div className="flex gap-3">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                                                                                    <span className={typeof benefit === 'object' ? 'font-black text-gray-900 dark:text-white' : ''}>
                                                                                        {typeof benefit === 'string' ? benefit : benefit.title}
                                                                                    </span>
                                                                                </div>
                                                                                {typeof benefit === 'object' && benefit.items && benefit.items.length > 0 && (
                                                                                    <ul className="pl-8 space-y-1 mt-1 border-l-2 border-green-100 dark:border-green-900/30 ml-0.5">
                                                                                        {benefit.items.map((sub, si) => (
                                                                                            <li key={si} className="text-xs text-gray-500 dark:text-gray-400 pl-3 relative before:content-['-'] before:absolute before:left-0">
                                                                                                {sub}
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                )}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="p-8 rounded-[2rem] bg-gray-950 text-white relative overflow-hidden shadow-2xl">
                                                            <div className="relative z-10">
                                                                <h4 className="text-lg font-black tracking-tight mb-2">¿LISTO PARA APLICAR?</h4>
                                                                <p className="text-gray-400 text-sm mb-8 leading-relaxed">Envíanos tu información y nos pondremos en contacto contigo lo antes posible.</p>

                                                                <div className="space-y-4">
                                                                    <a
                                                                        href={buildWhatsAppUrl(vacancy.title)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center justify-center gap-3 w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-green-500/20"
                                                                    >
                                                                        <MessageCircle className="w-5 h-5" />
                                                                        WHATSAPP RH
                                                                    </a>
                                                                    <a
                                                                        href={`mailto:${vacancy.contact_email}?subject=Postulación: ${vacancy.title}`}
                                                                        className="flex items-center justify-center gap-3 w-full py-4 bg-white hover:bg-gray-100 text-black rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-white/5"
                                                                    >
                                                                        <Mail className="w-5 h-5" />
                                                                        ENVIAR CV
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            {/* Background accent */}
                                                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
                                                        </div>

                                                        <div className="p-6 border border-gray-100 dark:border-gray-800 rounded-3xl">
                                                            <h5 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest">Atención Telefónica</h5>
                                                            <a href="tel:527775005017" className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-white hover:text-yellow-500 transition-colors">
                                                                <Phone className="w-5 h-5 text-yellow-500" />
                                                                777-500-5017
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* General CTA */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="mt-20 max-w-7xl mx-auto px-4"
            >
                <div className="p-10 rounded-[3rem] bg-gradient-to-br from-yellow-500 to-yellow-600 text-black flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-yellow-500/20">
                    <div className="text-center md:text-left">
                        <h3 className="text-3xl font-black tracking-tighter mb-2">¿NO ENCUENTRAS EL PUESTO IDEAL?</h3>
                        <p className="font-medium text-black/80">Envíanos tu CV y te avisaremos cuando surja una oportunidad para ti.</p>
                    </div>
                    <a
                        href="https://wa.me/527775005017?text=Hola,%20no%20encontré%20una%20vacante%20que%20se%20ajuste%20a%20mi%20perfil,%20pero%20me%20gustaría%20enviar%20mi%20CV"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-10 py-5 bg-black text-white font-black rounded-[2rem] hover:bg-white hover:text-black transition-all duration-500 shadow-2xl active:scale-95 whitespace-nowrap flex items-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        ENVIAR CV
                    </a>
                </div>
            </motion.div>
        </div>
    );
}

export default Vacancies;
