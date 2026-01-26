import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';
import { FileText, ChevronDown, CheckCircle, Download, Zap, Settings, ArrowRight, AlertCircle } from 'lucide-react';

const mexicanStates = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Coahuila",
    "Colima", "Chiapas", "Chihuahua", "Ciudad de México", "Durango", "Guanajuato",
    "Guerrero", "Hidalgo", "Jalisco", "Estado de México", "Michoacán", "Morelos",
    "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo",
    "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala",
    "Veracruz", "Yucatán", "Zacatecas"
];

export default function Fabrica() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className="w-full bg-slate-50 dark:bg-slate-900 font-sans text-gray-800 dark:text-gray-200 overflow-hidden relative"
            onMouseMove={handleMouseMove}
        >
            {/* Interactive Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Grid Pattern - More visible */}
                <div
                    className="absolute inset-0 opacity-[0.07] dark:opacity-[0.1]"
                    style={{
                        backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Mouse Follower Gradient - Spotlight Effect */}
                <motion.div
                    className="absolute -inset-px bg-gradient-to-r from-yellow-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition duration-300"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                600px circle at ${mouseX}px ${mouseY}px,
                                rgba(255, 215, 0, 0.15),
                                transparent 80%
                            )
                        `
                    }}
                />

                {/* Moving Ambient Blobs - Reacting slightly to mouse */}
                <motion.div
                    className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-400/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-color-dodge"
                    animate={{
                        x: [0, 20, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ x: useMotionTemplate`calc(${mouseX}px / 50)`, y: useMotionTemplate`calc(${mouseY}px / 50)` }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-blue-400/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-color-dodge"
                    style={{ x: useMotionTemplate`calc(${mouseX}px / -50)`, y: useMotionTemplate`calc(${mouseY}px / -50)` }}
                />
            </div>

            <div className="relative z-10 block">
                <HeroSection />

                <div className="container mx-auto px-4 md:px-8 py-16 space-y-32">
                    <QuoteSection />
                    <CapabilitiesSection />
                    <GallerySection />
                </div>

                <FooterNote />
            </div>
        </div>
    );
}

function HeroSection() {
    const images = [
        "/images/fabrica-hero.png",
        "/images/cnc-bending.png"
    ];

    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [images.length]);

    return (
        <div className="relative w-screen left-[50%] -translate-x-[50%] h-[500px] md:h-[700px] overflow-hidden group">
            <AnimatePresence mode='popLayout'>
                <motion.div
                    key={currentImage}
                    className="absolute inset-0 w-full h-full"
                    initial={{ scale: 1.15, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        opacity: { duration: 1.5 },
                        scale: { duration: 10, ease: "linear" }
                    }}
                >
                    <img
                        src={images[currentImage]}
                        alt="Fábrica Header"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent" />
        </div>
    );
}

function QuoteSection() {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        estado: '',
        servicio: '',
        descripcion: '',

        material: '',
        espesor: '',
        dimensiones: '',
        angulo: '',
        longitud: '',
        cantidad_dobleces: '',
        archivo: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateField = (name: string, value: string) => {
        let error = "";

        // Security check for code injection patterns (Script tags, event handlers, etc.)
        const hasScriptTags = /<script[\s\S]*?>[\s\S]*?<\/script>/gi.test(value);
        const hasHTMLTags = /<[^>]+>/g.test(value);
        const hasDangerousAttributes = /on\w+="[^"]*"/gi.test(value) || /javascript:/gi.test(value);

        if (hasScriptTags || hasHTMLTags || hasDangerousAttributes) {
            return "Contenido no permitido detectado (Posible inyección de código)";
        }

        switch (name) {
            case 'nombre':
            case 'apellido':
                if (!value.trim()) error = "Este campo es requerido";
                else if (value.length < 2) error = "Mínimo 2 caracteres";
                break;
            case 'email':
                if (!value) error = "Correo requerido";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Correo inválido";
                break;
            case 'telefono':
                if (!value) error = "Teléfono requerido";
                else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) error = "Ingresa 10 dígitos";
                break;
            case 'estado':
                if (!value || value === "Seleccionar estado...") error = "Selecciona un estado";
                break;
            case 'servicio':
                if (!value || value === "Sin especificar") error = "Selecciona un servicio";
                break;
            case 'descripcion':
                if (!value.trim()) error = "Descripción requerida";
                else if (value.length < 10) error = "Mínimo 10 caracteres";
                else if (/[<>{}]/.test(value)) error = "Caracteres especiales no permitidos (< > { })";
                break;
            // Dynamic Validations (OPTIONAL)
            /* 
            case 'material':
            case 'espesor':
            case 'dimensiones':
            case 'angulo':
            case 'longitud':
            case 'cantidad_dobleces':
                // Removed validation to make fields optional per user request
                break; 
            */
        }
        return error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        // Handle File Input
        if (type === 'file') {
            const fileInput = e.target as HTMLInputElement;
            const file = fileInput.files?.[0];

            if (file) {
                // Validate Extension (SolidWorks: .sldprt, .sldasm, .slddrw)
                const validExtensions = ['.sldprt', '.sldasm', '.slddrw'];
                const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

                if (!validExtensions.includes(fileExtension)) {
                    setErrors(prev => ({ ...prev, [name]: "Solo formatos SolidWorks (.sldprt, .sldasm, .slddrw)" }));
                    // Clear the input
                    fileInput.value = "";
                    setFormData(prev => ({ ...prev, [name]: "" }));
                    return;
                }

                // Valid File
                setFormData(prev => ({ ...prev, [name]: file.name }));
                setErrors(prev => ({ ...prev, [name]: "" })); // Clear error
            } else {
                setFormData(prev => ({ ...prev, [name]: "" }));
            }
            return;
        }

        // --- Strict Input Masking ---
        // 1. Phone: Numbers only, max 10 digits
        if (name === 'telefono') {
            if (!/^\d*$/.test(value)) return; // Prevent non-numeric input
            if (value.length > 10) return;    // Strict max length 10
        }

        // 2. Names: Letters, spaces, accents only (No numbers/symbols)
        if (name === 'nombre' || name === 'apellido') {
            if (!/^[a-zA-Z\u00C0-\u00FF\s]*$/.test(value)) return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const clearFile = () => {
        setFormData(prev => ({ ...prev, archivo: "" }));
        setErrors(prev => ({ ...prev, archivo: "" }));
        // Reset file input value manually if needed, but since we control it via key or ref, 
        // a simple way is to use a key on the input or a ref. 
        // For simplicity in this structure: handled via conditional rendering or key.
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key as keyof typeof formData]);
            if (error) newErrors[key] = error;
        });

        setErrors(newErrors);
        setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

        if (Object.keys(newErrors).length === 0) {
            alert("Formulario válido. Enviando cotización...");
            // Submit logic here
        }
    };

    const serviceType = formData.servicio;
    const isLaser = serviceType === 'Corte Láser';
    const isDobladora = serviceType === 'Dobladora';

    const isFormValid =
        Object.values(errors).every(err => !err) &&
        formData.nombre.trim() !== "" &&
        formData.apellido.trim() !== "" &&
        formData.telefono.length === 10 &&
        formData.email.trim() !== "" &&
        formData.estado !== "" && formData.estado !== "Seleccionar estado..." &&
        formData.servicio !== "" && formData.servicio !== "Sin especificar" &&
        formData.descripcion.trim() !== "";
    // Removed dynamic fields from required check as they are now optional

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            {/* Left Column */}
            <div className="lg:col-span-5 space-y-8 pt-4">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <motion.h2
                        className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] cursor-default"
                        whileHover={{ scale: 1.05, x: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                        Solicita tu <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-600 inline-block origin-left">
                            Cotización
                        </span>
                    </motion.h2>
                    <motion.p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl leading-relaxed">
                        Nuestro equipo de expertos está listo para analizar tu proyecto y proporcionar una cotización detallada en menos de 24 horas.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    whileHover={{ scale: 1.1, rotate: -2, boxShadow: "0px 10px 30px rgba(255, 215, 0, 0.3)" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="flex items-start gap-4 p-5 bg-white dark:bg-slate-800 border-l-8 border-[#FFD700] rounded-r-xl shadow-lg cursor-pointer max-w-sm"
                >
                    <div className="p-3 bg-yellow-50 dark:bg-slate-700 rounded-full shadow-inner text-[#FFD700]">
                        <Zap className="w-8 h-8 fill-current animate-bounce-slow" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xl">Respuesta Rápida</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                            Garantía de atención prioritaria.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Right Column: Form Card */}
            <motion.div
                className="lg:col-span-7"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-100 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-1000 ease-in-out z-0 pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700]" />

                    <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                name="nombre" label="Nombre" placeholder="Tu nombre"
                                value={formData.nombre} onChange={handleChange} onBlur={handleBlur} error={errors.nombre}
                            />
                            <InputField
                                name="apellido" label="Apellido" placeholder="Tu apellido"
                                value={formData.apellido} onChange={handleChange} onBlur={handleBlur} error={errors.apellido}
                            />
                        </div>

                        <InputField
                            name="telefono" label="Teléfono" placeholder="10 dígitos" type="tel"
                            value={formData.telefono} onChange={handleChange} onBlur={handleBlur} error={errors.telefono}
                        />
                        <InputField
                            name="email" label="Correo Electrónico" placeholder="ejemplo@empresa.com" type="email"
                            value={formData.email} onChange={handleChange} onBlur={handleBlur} error={errors.email}
                        />

                        <SelectField
                            name="estado" label="Estado de la República"
                            value={formData.estado} onChange={handleChange} onBlur={handleBlur} error={errors.estado}
                        >
                            <option value="">Seleccionar estado...</option>
                            {mexicanStates.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </SelectField>

                        <SelectField
                            name="servicio" label="Tipo de Servicio"
                            value={formData.servicio} onChange={handleChange} onBlur={handleBlur} error={errors.servicio}
                        >
                            <option value="Sin especificar">Seleccionar servicio...</option>
                            <option value="Dobladora">Dobladora CNC</option>
                            <option value="Corte Láser">Corte Láser</option>
                            <option value="Otro">Otro Proyecto</option>
                        </SelectField>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Descripción del Proyecto</label>
                            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-5 py-4 rounded-xl border-2 ${errors.descripcion ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50'} focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/10 outline-none transition-all min-h-[140px] resize-y text-gray-700 dark:text-gray-200 font-medium`}
                                    placeholder="Describe los detalles..."
                                />
                            </motion.div>
                            {errors.descripcion && <p className="text-red-500 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.descripcion}</p>}
                        </div>

                        <AnimatePresence>
                            {(serviceType === 'Dobladora' || serviceType === 'Corte Láser') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border-2 border-dashed border-[#FFD700]/50 space-y-4">
                                        <h4 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-[#FFD700]" /> Especificaciones Técnicas
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <SelectField
                                                name="material" label="Tipo de Material (Opcional)"

                                                value={formData.material} onChange={handleChange} onBlur={handleBlur} error={errors.material}
                                            >
                                                <option value="">Seleccionar material...</option>
                                                <option value="Acero Carbón">Acero Carbón</option>
                                                <option value="Acero Inoxidable">Acero Inoxidable</option>
                                                <option value="Aluminio">Aluminio</option>
                                                <option value="Otro">Otro</option>
                                            </SelectField>

                                            <InputField
                                                name="espesor" label="Calibre / Espesor" placeholder="Ej. 1/4, Calibre 10"
                                                value={formData.espesor} onChange={handleChange} onBlur={handleBlur} error={errors.espesor}
                                            />

                                            {serviceType === 'Corte Láser' && (
                                                <>
                                                    <InputField
                                                        name="dimensiones" label="Dimensiones (Opcional)" placeholder="Ej. 2000 x 1000 mm"
                                                        value={formData.dimensiones} onChange={handleChange} onBlur={handleBlur} error={errors.dimensiones}
                                                    />
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 mb-2">
                                                            Adjuntar Plano (SolidWorks .sldprt/.sldasm/.slddrw) <span className="text-gray-400 font-normal">(Opcional)</span>
                                                        </label>
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative flex-1">
                                                                <input
                                                                    key={formData.archivo ? "file-loaded" : "file-empty"} // Force remount to clear
                                                                    type="file"
                                                                    name="archivo"
                                                                    onChange={handleChange}
                                                                    accept=".sldprt,.sldasm,.slddrw"
                                                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FFD700] file:text-slate-900 hover:file:bg-yellow-400 transition-all cursor-pointer"
                                                                />
                                                            </div>
                                                            {formData.archivo && (
                                                                <button
                                                                    type="button"
                                                                    onClick={clearFile}
                                                                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                                                                    title="Eliminar archivo"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                        {errors.archivo && <p className="text-red-500 text-xs ml-1 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.archivo}</p>}
                                                    </div>
                                                </>
                                            )}

                                            {serviceType === 'Dobladora' && (
                                                <>
                                                    <InputField
                                                        name="angulo" label="Ángulo (Opcional)" placeholder="Ej. 90 grados"
                                                        value={formData.angulo} onChange={handleChange} onBlur={handleBlur} error={errors.angulo}
                                                    />
                                                    <InputField
                                                        name="longitud" label="Longitud (Opcional)" placeholder="Máx 6.1m"
                                                        value={formData.longitud} onChange={handleChange} onBlur={handleBlur} error={errors.longitud}
                                                    />
                                                    <InputField
                                                        name="cantidad_dobleces" label="Cant. Dobleces (Opcional)" placeholder="Ej. 4"
                                                        value={formData.cantidad_dobleces} onChange={handleChange} onBlur={handleBlur} error={errors.cantidad_dobleces}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            type="submit"
                            disabled={!isFormValid}
                            whileHover={isFormValid ? { scale: 1.02, boxShadow: "0px 10px 20px rgba(255, 215, 0, 0.4)" } : {}}
                            whileTap={isFormValid ? { scale: 0.95 } : {}}
                            className={`w-full py-5 font-black text-xl rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-wider relative overflow-hidden group ${isFormValid
                                ? "bg-[#FFD700] text-slate-900 shadow-lg cursor-pointer"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed"
                                }`}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Enviar Cotización <ArrowRight className={`w-6 h-6 ${isFormValid ? "" : "opacity-50"}`} />
                            </span>
                            {isFormValid && (
                                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            )}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

function InputField({ label, placeholder, type = "text", name, value, onChange, onBlur, error }: any) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
            <motion.div
                whileHover={{ scale: 1.03 }}
                whileFocus={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative"
            >
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={`w-full px-5 py-4 rounded-xl border-2 ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50'} focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/10 outline-none transition-all placeholder-gray-400 text-gray-700 dark:text-gray-200 font-medium`}
                    placeholder={placeholder}
                />
            </motion.div>
            {error && <p className="text-red-500 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
        </div>
    );
}

function SelectField({ label, children, name, value, onChange, onBlur, error }: any) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
            <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={`w-full px-5 py-4 rounded-xl border-2 ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50'} focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/10 outline-none transition-all appearance-none cursor-pointer text-gray-700 dark:text-gray-200 font-medium shadow-sm`}
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
            </motion.div>
            {error && <p className="text-red-500 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
        </div>
    );
}

function CapabilitiesSection() {
    const processes = [
        {
            title: "Corte Láser",
            subtitle: "Ultra Precisión",
            description: "Fibra óptica de última generación. Cortes limpios hasta 1 pulgada. Mesa de 2000m x 14000mm.",
            image: "/images/laser-cut.png",
            specs: ["Acero Inoxidable y Carbón", "Corte Complejo CNC", "Máx 14m de Largo"]
        },
        {
            title: "Dobladora CNC",
            subtitle: "Plegado Industrial",
            description: "Capacidad de 500 toneladas y 6.1m de largo. Multi-doblez en una sola operación.",
            image: "/images/cnc-bending.png",
            specs: ["500 Toneladas Fuerza", "Hasta 6.1 Metros", "Ángulos Perfectos"]
        }
    ];

    return (
        <div className="space-y-16">
            <div className="text-center space-y-4">
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white"
                >
                    Poder Industrial <span className="text-[#FFD700]">.</span>
                </motion.h3>
                <p className="text-gray-500 uppercase tracking-widest font-bold text-sm">Tecnología de Vanguardia</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {processes.map((proc, idx) => (
                    <motion.div
                        key={idx}
                        className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.2 }}
                        whileHover={{ scale: 1.02, y: -10 }}
                    >
                        <img
                            src={proc.image}
                            alt={proc.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                        <div className="absolute inset-0 p-10 flex flex-col justify-end transform transition-transform duration-500 group-hover:-translate-y-4">
                            <div className="mb-4">
                                <span className="bg-[#FFD700] text-black font-bold px-3 py-1 rounded text-xs uppercase tracking-wide mb-3 inline-block">
                                    {proc.subtitle}
                                </span>
                                <h4 className="text-4xl font-extrabold text-white mb-2">{proc.title}</h4>
                                <div className="w-20 h-1 bg-[#FFD700] transform origin-left transition-all duration-300 group-hover:w-full" />
                            </div>

                            <p className="text-gray-300 text-lg mb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                {proc.description}
                            </p>

                            <div className="flex flex-wrap gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200 mb-6">
                                {proc.specs.map((spec, i) => (
                                    <span key={i} className="border border-white/30 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                        {spec}
                                    </span>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{
                                    boxShadow: ["0px 0px 0px rgba(255,215,0,0)", "0px 0px 20px rgba(255,215,0,0.5)", "0px 0px 0px rgba(255,215,0,0)"]
                                }}
                                transition={{
                                    boxShadow: { duration: 2, repeat: Infinity }
                                }}
                                className="w-full py-4 bg-[#FFD700] text-slate-900 font-black uppercase rounded-xl shadow-lg hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-3 z-20 mt-4"
                            >
                                <Download className="w-6 h-6" />
                                <span className="tracking-widest">Descargar Ficha Técnica</span>
                            </motion.button>
                        </div>
                        <Settings className="absolute top-6 right-6 w-24 h-24 text-white/5 group-hover:rotate-180 transition-transform duration-1000" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function GallerySection() {
    const imagesRow1 = [
        "/images/laser-cut.png",
        "/images/fabrica-hero.png",
        "/images/cnc-bending.png",
        "/images/laser-cut.png",
        "/images/fabrica-hero.png",
    ];
    const imagesRow2 = [
        "/images/cnc-bending.png",
        "/images/laser-cut.png",
        "/images/fabrica-hero.png",
        "/images/cnc-bending.png",
        "/images/laser-cut.png",
    ];

    return (
        <div className="space-y-12">
            <div className="text-center">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                    Galería de Producción
                </h3>
            </div>

            <div className="relative w-screen left-[50%] -translate-x-[50%] overflow-hidden bg-white dark:bg-slate-800 py-16">
                <style>{`
                    @keyframes marquee-left {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    @keyframes marquee-right {
                        0% { transform: translateX(-50%); }
                        100% { transform: translateX(0); }
                    }
                    .animate-marquee-left {
                        animation: marquee-left 60s linear infinite;
                    }
                    .animate-marquee-right {
                        animation: marquee-right 60s linear infinite;
                    }
                    .group:hover .animate-marquee-left,
                    .group:hover .animate-marquee-right {
                        animation-play-state: paused;
                    }
                `}</style>
                <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white dark:from-slate-800 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white dark:from-slate-800 to-transparent z-10 pointer-events-none" />

                <div className="space-y-6">
                    <MarqueeRow images={imagesRow1} direction="left" />
                    <MarqueeRow images={imagesRow2} direction="right" />
                </div>
            </div>
        </div>
    );
}

function MarqueeRow({ images, direction }: { images: string[], direction: 'left' | 'right' }) {
    return (
        <div className="flex w-full overflow-hidden group">
            <div className={`flex gap-6 px-3 w-max ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'} will-change-transform`}>
                {[...images, ...images, ...images, ...images].map((src, idx) => (
                    <motion.div
                        key={`${idx}-${src}`}
                        className="relative w-[350px] h-[220px] rounded-2xl overflow-hidden cursor-pointer shadow-lg"
                        whileHover={{ scale: 1.1, zIndex: 10, filter: "brightness(1.1)" }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <img src={src} alt="Gallery" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function FooterNote() {
    return (
        <div className="w-full text-center py-8 text-xs font-bold uppercase tracking-widest text-gray-400 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[#FFD700] mr-2 text-lg">●</span>
            Precios sujetos a cambios
            <span className="text-[#FFD700] ml-2 text-lg">●</span>
        </div>
    );
}
