import React, { useState } from "react";
import { motion } from "framer-motion";

type Brand = {
    id: string;
    name: string;
    logo: string;
    nameImage?: string;
    description: string;
};

const BRANDS: Brand[] = [
    {
        id: "ACP",
        name: "ACP",
        logo: "https://www.wixfilters.com/adobe/dynamicmedia/deliver/dm-aid--a34dee6b-8561-4841-91f1-7f7bb84a253b/wix-oil-overviewhero-800x537.jpg?preferwebp=true&quality=82",
        nameImage: "https://refaccioneselboom.com/images/logos/ACP.webp",
        description: `
            En el mundo del transporte pesado, donde cada kilómetro cuenta y la durabilidad es esencial, ACP se ha consolidado como una de las marcas más confiables en refacciones para frenos y suspensión. Sus productos son reconocidos por combinar tecnología de precisión, materiales de alta resistencia y un estricto control de calidad, factores que garantizan un rendimiento superior en cualquier tipo de terreno.
            En El Boom Tractopartes, confiamos en ACP porque ofrece una gama completa de componentes diseñados para camiones, tractocamiones, remolques y autobuses de carga pesada. Desde zapatas y balatas hasta bujes y resortes, cada pieza ACP está fabricada para soportar las condiciones más exigentes del trabajo diario. Su ingeniería asegura una excelente disipación del calor y una fricción constante, lo que se traduce en frenadas más seguras y una mayor estabilidad del vehículo.
            Además, ACP es una marca que entiende la importancia del mantenimiento preventivo. Su enfoque está orientado a brindar refacciones que prolonguen la vida útil del sistema de frenos y suspensión, evitando fallas inesperadas y costos innecesarios. Gracias a su experiencia en el sector automotriz, ACP ha ganado la confianza de miles de transportistas y talleres especializados en México y Latinoamérica.
            En El Boom Tractopartes respaldamos esa confianza ofreciendo productos ACP originales, garantizados y con disponibilidad inmediata. Porque sabemos que en el camino, la seguridad no se negocia. Con ACP, tu camión frena con precisión, soporta con fuerza y trabaja con la resistencia que el transporte pesado exige.`,
    },
    {
        id: "DONALDSON",
        name: "DONALDSON",
        logo: "https://refaccioneselboom.com/images/logos/DONALDSON-IMG.webp",
        nameImage: "https://refaccioneselboom.com/images/logos/DONALDSON.webp",
        description: `Donaldson es sinónimo de tecnología en filtración avanzada. Con más de un siglo de experiencia, esta marca ha transformado la forma en que los motores diésel respiran, se lubrican y funcionan. En El Boom Tractopartes, trabajamos con la línea completa de filtros Donaldson originales, diseñados para ofrecer protección total y máximo rendimiento en camiones, maquinaria pesada y vehículos industriales.
            La calidad de los filtros Donaldson se basa en su capacidad para eliminar impurezas sin limitar el flujo de aire o combustible. Esto garantiza que los motores mantengan una combustión limpia, evitando el desgaste prematuro y reduciendo los costos de mantenimiento. Su tecnología de microfiltración ofrece una eficiencia superior incluso en ambientes polvorientos o de trabajo extremo, algo indispensable para quienes operan camiones de carga pesada o tractocamiones de larga distancia.
            Donaldson se ha convertido en una marca de confianza global gracias a su compromiso con la innovación. Sus filtros están presentes en flotas de transporte, maquinaria agrícola, equipos mineros y vehículos de construcción en todo el mundo. Cada filtro Donaldson es el resultado de años de investigación y pruebas de resistencia, garantizando una protección real para motores diésel modernos.
            En El Boom Tractopartes, sabemos que un motor limpio es sinónimo de productividad. Por eso recomendamos Donaldson a todos nuestros clientes que buscan confiabilidad y durabilidad. Ya sea que necesites un filtro de aire, combustible o aceite, Donaldson ofrece el equilibrio perfecto entre eficiencia, rendimiento y protección. Con Donaldson, cada kilómetro recorrido se convierte en una inversión segura para tu motor.`
    },
    {
        id: "GABRIEL",
        name: "GABRIEL",
        logo: "https://www.wixfilters.com/adobe/dynamicmedia/deliver/dm-aid--a34dee6b-8561-4841-91f1-7f7bb84a253b/wix-oil-overviewhero-800x537.jpg?preferwebp=true&quality=82",
        nameImage: "https://refaccioneselboom.com/images/logos/GABRIEL.webp",
        description: `Cuando se trata de amortiguadores y sistemas de suspensión, Gabriel es sinónimo de tradición, innovación y confianza. Desde hace más de un siglo, la marca ha desarrollado tecnología especializada para ofrecer mayor estabilidad, control y confort en todo tipo de vehículo, desde autos ligeros hasta tractocamiones de carga pesada.
            En El Boom Tractopartes, trabajamos con la línea original de amortiguadores Gabriel, porque sabemos que cada componente cumple con los más altos estándares de desempeño. Estos amortiguadores están diseñados para mantener un contacto constante entre las llantas y el suelo, ofreciendo una conducción más segura y reduciendo el desgaste prematuro de los neumáticos. Su estructura robusta, combinada con materiales de larga duración, garantiza un funcionamiento confiable incluso en caminos irregulares o bajo condiciones extremas de carga.
            Gabriel utiliza tecnología de gas presurizado y válvulas de control preciso, lo que permite una respuesta más rápida ante impactos y una absorción de vibraciones superior. Esto no solo mejora la comodidad del conductor, sino que también protege la integridad del camión, reduciendo el esfuerzo sobre la suspensión y el chasis.
            La marca ha ganado la confianza de transportistas, talleres y fabricantes en todo el mundo por su compromiso con la calidad. En El Boom Tractopartes, recomendamos Gabriel a quienes buscan amortiguadores resistentes, duraderos y con desempeño probado. Con Gabriel, cada viaje se siente más firme, más controlado y, sobre todo, más seguro.`
    },
    {
        id: "GONHER",
        name: "GONHER",
        logo: "https://www.wixfilters.com/adobe/dynamicmedia/deliver/dm-aid--a34dee6b-8561-4841-91f1-7f7bb84a253b/wix-oil-overviewhero-800x537.jpg?preferwebp=true&quality=82",
        nameImage: "https://refaccioneselboom.com/images/logos/GONHER.webp",
        description: `Gonher es una marca mexicana de prestigio internacional, reconocida por su liderazgo en lubricantes, aceites y filtros para motores diésel y de gasolina. Durante décadas, ha sido el aliado preferido de transportistas, mecánicos y flotilleros que buscan productos de calidad comprobada. En El Boom Tractopartes, somos distribuidores oficiales de aceites Gonher, una marca que representa confianza, protección y desempeño en cada motor.
            Los aceites Gonher están formulados con aditivos de alto rendimiento que protegen el motor contra la fricción, la oxidación y el desgaste, incluso en condiciones severas de operación. Su línea de productos cubre una amplia gama de necesidades: desde motores de carga ligera hasta tractocamiones, maquinaria agrícola e industrial. Además, sus filtros complementan perfectamente su tecnología, garantizando que cada parte del motor trabaje de manera limpia y eficiente.
            Gonher no solo ofrece calidad; también representa innovación. La marca invierte constantemente en investigación y desarrollo para cumplir con las normas internacionales más exigentes, incluyendo API y ACEA. Gracias a su compromiso con la sostenibilidad, Gonher fabrica lubricantes más limpios que ayudan a reducir emisiones contaminantes y mejorar el rendimiento energético.
            En El Boom Tractopartes, confiamos en Gonher porque entendemos que el motor es el corazón del camión, y protegerlo significa prolongar su vida útil y mejorar su rendimiento. Con Gonher, cada litro de aceite se convierte en un seguro de vida para tu motor.`
    },
    {
        id: "GOODYEAR",
        name: "GOODYEAR",
        logo: "https://www.wixfilters.com/adobe/dynamicmedia/deliver/dm-aid--a34dee6b-8561-4841-91f1-7f7bb84a253b/wix-oil-overviewhero-800x537.jpg?preferwebp=true&quality=82",
        nameImage: "https://refaccioneselboom.com/images/logos/GOODYEAR.webp",
        description: `La calidad y resistencia de Goodyear trascienden más allá de sus llantas. En su división de bolsas de aire para suspensión neumática, la marca ha logrado posicionarse como líder global gracias a su tecnología, durabilidad y desempeño superior. En El Boom Tractopartes, distribuimos bolsas de aire Goodyear que ofrecen una combinación perfecta entre flexibilidad, soporte y larga vida útil.
            Estas bolsas están diseñadas con compuestos de caucho reforzado y materiales de alta densidad, capaces de soportar las cargas más pesadas sin perder su forma ni elasticidad. Su ingeniería avanzada reduce las vibraciones, mejora la estabilidad del vehículo y brinda un manejo más suave, protegiendo los componentes del chasis y la carga transportada.
            Goodyear fabrica sus bolsas bajo estrictos estándares internacionales, asegurando un rendimiento para quienes operan camiones de carga pesada o tractocamiones de larga distancia. Al instalar bolsas de aire Goodyear, los camiones logran un equilibrio ideal entre comodidad y capacidad de carga, lo que se traduce en un menor desgaste de neumáticos y una conducción más segura.`
    },
    {
        id: "MANNFILTER",
        name: "MANNFILTER",
        logo: "https://www.wixfilters.com/adobe/dynamicmedia/deliver/dm-aid--a34dee6b-8561-4841-91f1-7f7bb84a253b/wix-oil-overviewhero-800x537.jpg?preferwebp=true&quality=82",
        nameImage: "https://refaccioneselboom.com/images/logos/MANNFILTER.webp",
        description: `Cuando se trata de mantener un motor limpio y eficiente, MANN-FILTER es la referencia mundial en sistemas de filtración premium. Con tecnología alemana y décadas de experiencia, la marca ofrece filtros de aire, aceite, combustible y cabina diseñados para motores diésel e industriales de alto rendimiento.
            En El Boom Tractopartes, trabajamos con filtros MANN-FILTER originales, conocidos por su precisión y confiabilidad. Cada producto está diseñado para capturar incluso las partículas más finas, evitando que contaminantes dañen las piezas internas del motor. Esto no solo mejora la eficiencia del combustible, sino que también prolonga la vida útil del motor y reduce los costos de mantenimiento.
            Los filtros MANN-FILTER son elegidos por fabricantes de camiones, tractocamiones y maquinaria pesada en todo el mundo por su desempeño comprobado. Su estructura multicapa y materiales de alta resistencia garantizan una filtración superior y una larga durabilidad, incluso en condiciones severas de trabajo.
            En El Boom Tractopartes, recomendamos MANN-FILTER porque sabemos que un motor limpio es un motor productivo. Con esta marca, los transportistas obtienen protección, rendimiento y tranquilidad, sabiendo que su equipo trabaja con la máxima eficiencia.`
    },
    {
        id: "MORESA",
        name: "MORESA",
        logo: "https://www.wixfilters.com/adobe/dynamicmedia/deliver/dm-aid--a34dee6b-8561-4841-91f1-7f7bb84a253b/wix-oil-overviewhero-800x537.jpg?preferwebp=true&quality=82",
        nameImage: "https://refaccioneselboom.com/images/logos/MORESA.webp",
        description: `Moresa es una marca mexicana con una gran trayectoria en la fabricación de componentes internos para motores diésel y gasolina, reconocida por su calidad, precisión y durabilidad. En El Boom Tractopartes, confiamos plenamente en su ingeniería, ya que ofrece pistones, anillos, válvulas y kits de reparación diseñados para brindar máximo desempeño incluso en condiciones de trabajo extremo.
            Cada pieza Moresa está fabricada con aleaciones de alta resistencia y procesos de control que aseguran un ajuste perfecto. Esto se traduce en motores más potentes, eficientes y duraderos, ideales para camiones, tractocamiones y maquinaria pesada. Su tecnología de precisión reduce la fricción y mejora la compresión del motor, optimizando el consumo de combustible y prolongando su vida útil.
            Moresa ha logrado posicionarse como una de las marcas más confiables del mercado gracias a su compromiso con la innovación y la calidad mexicana. En El Boom Tractopartes, recomendamos Moresa a todos los clientes que buscan reconstruir motores o realizar mantenimientos preventivos con refacciones originales. Con Moresa, tu motor recupera fuerza, potencia y rendimiento, garantizando el trabajo continuo de tu unidad.`

    },
    {
        id: "SAKURA",
        name: "SAKURA",
        logo: "https://www.wixfilters.com/adobe/dynamicmedia/deliver/dm-aid--a34dee6b-8561-4841-91f1-7f7bb84a253b/wix-oil-overviewhero-800x537.jpg?preferwebp=true&quality=82",
        nameImage: "https://refaccioneselboom.com/images/logos/SAKURA.webp",
        description: `Sakura Filter es una marca de origen asiático que ha ganado reconocimiento mundial por su excelencia en sistemas de filtración para motores diésel y de gasolina. En El Boom Tractopartes, trabajamos con filtros Sakura originales, fabricados bajo estándares internacionales de calidad que garantizan un flujo constante de aire y aceite, protegiendo los componentes internos del motor.
            Los filtros Sakura se destacan por su construcción robusta y materiales de alta densidad que aseguran una filtración eficiente y prolongada, incluso en ambientes con polvo, humedad o temperaturas extremas. Ideales para camiones, tractocamiones y maquinaria industrial, estos filtros ayudan a mantener la potencia del motor y reducen los tiempos de inactividad.
            Sakura se ha convertido en sinónimo de rendimiento y confiabilidad, siendo una excelente alternativa para quienes buscan calidad a un precio competitivo. En El Boom Tractopartes, recomendamos Sakura a los transportistas que desean proteger su motor sin comprometer su economía, obteniendo resultados de nivel premium.`
    },
    {
        id: "TIMKEN",
        name: "TIMKEN",
        logo: "https://www.wixfilters.com/adobe/dynamicmedia/deliver/dm-aid--a34dee6b-8561-4841-91f1-7f7bb84a253b/wix-oil-overviewhero-800x537.jpg?preferwebp=true&quality=82",
        nameImage: "https://refaccioneselboom.com/images/logos/TIMKEN.webp",
        description: `Timken es una de las marcas más reconocidas en el mundo por su especialización en rodamientos, baleros y componentes de transmisión. Su nombre es sinónimo de ingeniería de precisión y resistencia extrema. En El Boom Tractopartes, contamos con una amplia gama de rodamientos Timken originales, diseñados para ofrecer mayor durabilidad y desempeño constante en camiones, remolques y maquinaria pesada.
            Cada producto Timken está fabricado con acero tratado térmicamente y tecnología de vanguardia que garantiza un ajuste perfecto y un funcionamiento suave. Esto permite reducir la fricción, soportar altas cargas y prolongar la vida útil de los sistemas de rodamiento y transmisión.
            La marca es utilizada por fabricantes líderes en el sector automotriz e industrial por su fiabilidad comprobada. En El Boom Tractopartes, recomendamos Timken a quienes buscan componentes que soporten las condiciones más exigentes del transporte pesado. Con Timken, obtienes precisión, resistencia y tranquilidad en cada kilómetro.`
    },
    {
        id: "WIX",
        name: "WIX",
        logo: "https://refaccioneselboom.com/images/logos/WIX-IMG.webp",
        nameImage: "https://refaccioneselboom.com/images/logos/WIX.webp",
        description: `WIX Filters es una marca líder en soluciones de filtración automotriz e industrial, reconocida por su compromiso con la innovación y la calidad. En El Boom Tractopartes, distribuimos filtros WIX originales, diseñados para ofrecer máxima protección y rendimiento en motores diésel, camiones y tractocamiones.
            Los filtros WIX están fabricados con materiales de alta eficiencia que capturan hasta las partículas más finas sin afectar el flujo del fluido. Esto garantiza un motor más limpio, una combustión más eficiente y mayor durabilidad de las piezas internas. Su tecnología se aplica en filtros de aire, aceite, combustible y cabina, ofreciendo soluciones integrales para cualquier tipo de vehículo pesado.
            Gracias a su constante innovación, WIX es la elección preferida de talleres y flotillas que buscan rendimiento confiable y mantenimiento prolongado. En El Boom Tractopartes, confiamos en WIX porque entendemos que cada filtro es una inversión en protección, eficiencia y productividad.`
    },
];

const BLUE_BG = "bg-[#006CFA]/10";
const YELLOW_BG = "bg-[#FBCC13]/20";

interface DeshuesaderoProps {
    brands?: Brand[];
}

export default function Deshuesadero({ brands }: DeshuesaderoProps) {
    const items = brands ?? BRANDS;
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    // const heroSrc = heroImageUrl ?? "https://refaccioneselboom.com/images/Camion.webp";

    return (
        <section className="pt-6 md:pt-10">
            <div className="text-center mb-16">

                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter"
                >
                    TRACTOPARTES <span
                        className="text-yellow-500"
                        style={{ textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}
                    >NUEVAS Y USADAS</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 dark:text-gray-400 mt-6 text-xl max-w-2xl mx-auto leading-relaxed"
                >
                    Explora nuestra amplia selección de <span className="font-bold text-gray-900 dark:text-white">marcas líderes</span>. Calidad garantizada para mantener tu flota en movimiento.
                </motion.p>
            </div>
            <div className="space-y-6">
                {items.map((brand, idx) => {
                    const bg = idx % 2 === 0 ? BLUE_BG : YELLOW_BG;
                    const isEven = idx % 2 === 0;
                    const imageBase = "https://refaccioneselboom.com/images/logos";
                    const logoUrl = `${imageBase}/${brand.id}-IMG.webp`;
                    const nameImageUrl = `${imageBase}/${brand.id}.webp`;

                    return (
                        <motion.article
                            key={brand.id}
                            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className={`w-screen -mx-[calc(50vw-50%)] ${bg} border-y border-gray-300 dark:border-gray-800 shadow-sm`}
                        >
                            <div
                                className={`flex flex-col md:flex-row ${isEven ? "" : "md:flex-row-reverse"} items-center`}
                            >
                                {/* Imagen lateral optimizada */}
                                <div className="relative w-full md:w-[35%] h-[220px] md:h-[280px] max-h-[280px] flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <img
                                        src={logoUrl}
                                        alt={brand.name}
                                        width={400}
                                        height={280}
                                        className={`h-full w-full object-cover ${isEven ? "object-left" : "object-right"
                                            }`}
                                        style={{
                                            WebkitMaskImage: isEven
                                                ? "linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)"
                                                : "linear-gradient(to left, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
                                            maskImage: isEven
                                                ? "linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)"
                                                : "linear-gradient(to left, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
                                        }}
                                    />
                                </div>

                                {/* Contenido más arriba */}
                                <div className="flex-1 px-6 py-4 md:py-4 flex flex-col justify-center">
                                    <div className={`${isEven ? "text-left" : "text-right"}`}>
                                        <img
                                            src={nameImageUrl}
                                            alt={brand.name}
                                            width={160}
                                            height={80}
                                            className="h-10 md:h-16 lg:h-20 w-auto object-contain inline-block mb-2"
                                        />
                                        {(() => {
                                            const isOpen = !!expanded[brand.id];
                                            const shouldToggle = (brand.description?.length || 0) > 220;
                                            return (
                                                <>
                                                    <motion.div
                                                        className={'relative mb-2 overflow-hidden'}
                                                        initial={false}
                                                        animate={{ height: isOpen ? 'auto' : 112, opacity: 1 }}
                                                        transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
                                                        style={
                                                            isOpen
                                                                ? undefined
                                                                : {
                                                                    WebkitMaskImage:
                                                                        'linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                                                                    maskImage:
                                                                        'linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                                                                }
                                                        }
                                                    >
                                                        <motion.p
                                                            className="text-gray-700 dark:text-gray-300 text-sm md:text-base text-justify"
                                                            initial={{ opacity: 0.92 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ duration: 0.24 }}
                                                        >
                                                            {brand.description}
                                                        </motion.p>
                                                    </motion.div>
                                                    {shouldToggle && (
                                                        <div className={`mt-1 flex ${isEven ? 'justify-start' : 'justify-end'}`}>
                                                            <button
                                                                type="button"
                                                                className="text-[#006CFA] hover:underline text-sm font-medium cursor-pointer"
                                                                onClick={() =>
                                                                    setExpanded((prev) => ({
                                                                        ...prev,
                                                                        [brand.id]: !isOpen,
                                                                    }))
                                                                }
                                                            >
                                                                {isOpen ? 'Ver menos' : 'Ver más'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </motion.article>
                    );
                })}
            </div>
        </section>
    );
}
