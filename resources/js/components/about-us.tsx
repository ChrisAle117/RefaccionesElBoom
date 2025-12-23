import React from "react";
import { Compass, Eye } from 'lucide-react';



export default function AboutUs() {
    return (

        <div className="p-4 border-b-2 border-[#FBCC13]">
            <h1 className="text-3xl font-bold mb-4">Acerca de nosotros.</h1>
            {/* Video Section */}
            {/* <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">¡Nuestra marca!</h4>
                <div className="aspect-w-16 aspect-h-9">
                    <iframe
                        className="w-full h-100 rounded-sm mb-5"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Video Institucional"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div> */}

                {/* Contenedor flex para los dos primeros párrafos */}
                <div className="flex gap-4">
                    
                    <div className="flex-1">
                        <p className="mb-2 text-justify">
                            Refaccionaria El Boom es su destino integral para todo lo relacionado con refacciones para camiones.
                            Desde tornillos hasta camiones completos, nuestra misión es proporcionar a nuestros clientes productos de alta calidad que
                            satisfagan sus necesidades específicas. Somos una empresa 100% mexicana, comprometida con la comercialización y distribución de
                            refacciones para camiones de carga y pasaje, tractocamiones y camiones pesados.
                        </p>
                    </div>
                    
                    <div className="flex-1">
                        <p className="mb-2 text-justify">
                            En Refaccionaria El Boom, entendemos la importancia de cada pieza en el funcionamiento de su vehículo. Por ello,
                            nos especializamos en ofrecer una amplia variedad de tractopartes, partes y piezas usadas, así como accesorios y
                            autopartes para camiones. Nuestro enfoque está en garantizar la satisfacción total del cliente, a través de productos
                            de alta calidad y un servicio excepcional. Nos enorgullece nuestra capacidad para adaptarnos a las necesidades del mercado,
                            siempre con un estricto apego a los lineamientos aprobados.
                        </p>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="mb-2 text-justify">
                        Nuestra empresa fomenta la responsabilidad personal, la comunicación interna y la mejora continua en todos nuestros procesos.
                        Creemos que estos valores son esenciales para ofrecer un servicio de excelencia y para sentirnos orgullosos de nuestro trabajo.
                        Cada miembro de nuestro equipo está comprometido con estos principios, asegurando que cada cliente reciba la atención y el producto que merece.
                    </p>
                    <br />
                </div>
                <div className="flex gap-4">
                    {/* Misión */}
                    <div className="flex-1">
                        <h4 className="flex items-center gap-2 text-lg font-semibold">
                            <Compass className="h-8 w-8 text-blue-500" />
                            Misión
                        </h4>
                        <p className="mb-2 text-justify">
                            Somos una empresa líder, en la comercialización de refacciones y productos para camiones de carga y pasaje,
                            competitiva en las condiciones del mercado y enfocada en estar a la vanguardia, satisfaciendo la necesidad de
                            los clientes basados en nuestro factor humano, un servicio de calidad y en procesos de mejora continua.
                        </p>
                    </div>
                    {/* Visión */}
                    <div className="flex-1">
                        <h4 className="flex items-center gap-2 text-lg font-semibold">
                            <Eye className="h-8 w-8 text-green-500" />
                            Visión
                        </h4>
                        <p className="mb-2 text-justify">
                            Ser una empresa que esté posicionada dentro de los primeros 10 proveedores de refacciones para camiones de carga
                            y pasaje en México. Innovadora en un sistema de mercadeo logrando su propia rentabilidad y la de sus socios comerciales.
                        </p>
                    </div>
                </div>
        </div>
    );
}
