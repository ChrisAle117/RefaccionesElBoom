import React, { useState } from 'react';
import { motion } from 'framer-motion';

type DocumentType = 'privacy' | 'terms' | 'returns';

export function LegalDocuments() {
    const [activeDocument, setActiveDocument] = useState<DocumentType>('privacy');

    const handleDocumentChange = (type: DocumentType) => {
        setActiveDocument(type);
    };

    // Función para imprimir el documento actual
    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = ""; // Quitar el título temporalmente para que no salga en la impresión
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 pb-12 print:p-0 print:bg-white">
            {/* Print-only Header */}
            <div className="hidden print:block mb-8 border-b-2 border-gray-900 pb-4">
                <h1 className="text-2xl font-black uppercase text-black">Refacciones El Boom</h1>
                <p className="text-sm text-gray-700">Carretera federal México - Acapulco Km. 29, Puente de Ixtla, Mor. 62660</p>
                <div className="mt-2 text-xs text-gray-500">Documento Oficial de la Plataforma Digital</div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 20mm; }
                    /* Hide everything outside the LegalDocuments component */
                    header, footer, nav, aside, .print-hidden, [role="navigation"], .sidebar, .app-header { 
                        display: none !important; 
                    }
                    /* Ensure the legal container is the only thing visible */
                    body { background: white !important; color: black !important; visibility: hidden; }
                    #legal-print-area, #legal-print-area * { visibility: visible; }
                    #legal-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    
                    .prose { max-width: none !important; color: black !important; }
                    h1, h2, h3, h4 { color: black !important; page-break-after: avoid; }
                    p { orphans: 3; widows: 3; color: black !important; }
                }
            `}} />

            <div id="legal-print-area">
                <div className="text-center mb-12 print:hidden">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-yellow-500 uppercase bg-yellow-500/10 rounded-full border border-yellow-500/20"
                    >
                        LEGALIDAD Y TRANSPARENCIA
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter"
                    >
                        AVISOS <span
                            className="text-yellow-500"
                            style={{ textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}
                        >LEGALES</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 dark:text-gray-400 mt-6 text-xl max-w-2xl mx-auto leading-relaxed"
                    >
                        Consulta nuestros términos, condiciones y políticas de privacidad para una <span className="font-bold text-gray-900 dark:text-white">navegación segura y transparente</span>.
                    </motion.p>
                </div>

                {/* Selector de documento */}
                <div className="flex mb-8 border-b border-gray-300 dark:border-gray-700 print:hidden">
                    <button
                        onClick={() => handleDocumentChange('privacy')}
                        className={`py-2 px-6 font-medium text-sm transition-colors cursor-pointer ${activeDocument === 'privacy'
                            ? 'text-red-600 dark:text-[#FBCC13] border-b-2 border-red-600 dark:border-[#FBCC13]'
                            : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-[#FBCC13]'
                            }`}
                    >
                        Términos y condiciones
                    </button>
                    <button
                        onClick={() => handleDocumentChange('terms')}
                        className={`py-2 px-6 font-medium text-sm transition-colors cursor-pointer ${activeDocument === 'terms'
                            ? 'text-red-600 dark:text-[#FBCC13] border-b-2 border-red-600 dark:border-[#FBCC13]'
                            : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-[#FBCC13]'
                            }`}
                    >
                        Aviso legal
                    </button>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end mb-4 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="flex items-center space-x-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-400"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span>Imprimir</span>
                    </button>
                </div>

                {/* Contenedor del documento */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 print:shadow-none print:p-0">
                    <motion.div
                        key={activeDocument}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="prose max-w-none text-black dark:text-white text-justify"
                    >
                        {activeDocument === 'privacy' ? (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Términos y condiciones</h3>
                                <p className="mb-4 text-justify">
                                    Los presentes términos y condiciones regulan el acceso y uso del sitio web www.refaccioneselboom.com (en adelante, "El Boom Tractopartes" o "el sitio web"),
                                    así como la aceptación de los mismos por parte del usuario (en adelante, "el usuario"). Al ingresar y utilizar esta plataforma, usted acepta quedar legalmente
                                    vinculado por lo establecido en este documento, lo cual constituye un acuerdo entre el usuario y El Boom Tractopartes.
                                </p>
                                <p className="mb-4 text-justify">
                                    El uso del sitio también implica su conformidad con los avisos legales, políticas, normas y condiciones específicas que apliquen a los distintos servicios ofrecidos.
                                    Si no está de acuerdo con alguno de los puntos aquí expuestos, deberá abstenerse de acceder o hacer uso del sitio y sus funcionalidades.
                                </p>
                                <h4 className="font-semibold mt-6 mb-2">Uso del sitio</h4>
                                <p className="mb-4 text-justify">
                                    Queda estrictamente prohibida la reproducción, copia, distribución, venta, reventa o explotación con fines comerciales de cualquier parte del sitio, sin el consentimiento
                                    expreso por escrito de El Boom Tractopartes.
                                    El Boom Tractopartes se reserva el derecho a negar el acceso al sitio, cancelar cuentas de usuario, rechazar pedidos o tomar cualquier otra acción necesaria si considera
                                    que la conducta del usuario infringe la normativa aplicable o afecta los intereses y funcionamiento de la empresa.
                                </p>
                                <h4 className="font-semibold mt-6 mb-2">Propiedad intelectual</h4>
                                <p className="mb-4 text-justify">
                                    Todo el contenido alojado en este sitio web —incluyendo pero no limitado a textos, gráficos, logotipos, iconos, imágenes, clips de audio, software y combinaciones de ellos— es
                                    propiedad exclusiva de El Boom Tractopartes o se encuentra bajo licencia autorizada para su uso, y está protegido por las leyes nacionales e internacionales de propiedad intelectual.
                                    La recopilación, diseño y organización de los contenidos también están protegidos y son propiedad exclusiva de El Boom Tractopartes. El uso no autorizado de cualquier elemento del sitio
                                    constituye una infracción y será sancionado conforme a derecho.
                                </p>
                                <p className="mb-4 text-justify">
                                    La información proporcionada podrá ser utilizada para intereses personales dentro de  El Boom Tractopartes tales como: Venta, promoción, seguimiento, etc.
                                    En cuanto a los información bancaria se refiere, El Boom Tractopartes no guarda ni procesa directamente ninguno de estos datos,
                                    toda esta información se maneja de manera segura a través de la plataforma de pagos con la que El Boom Tractopartes tiene convenio,
                                    con razón social: "Openpay" by BBVA, el cual establece sus propios términos y condiciones.
                                </p>
                                <h4 className="font-semibold mt-6 mb-2">Información de productos y servicios</h4>
                                <p className="mb-4 text-justify">
                                    En El Boom Tractopartes trabajamos continuamente para asegurar que la información sobre nuestros productos, precios, descripciones, disponibilidad y características sea lo más precisa posible.
                                    Sin embargo, no podemos garantizar que todos los datos sean exactos, actuales o estén libres de errores tipográficos o técnicos.
                                    Es posible que, debido a errores del sistema o humanos, un producto muestre información incorrecta o incompleta. En tales casos, El Boom Tractopartes se reserva el derecho de corregir la información,
                                    modificar precios o cancelar pedidos cuando lo considere necesario.
                                    Asimismo, todos los productos, servicios y precios ofrecidos en el sitio web pueden cambiar sin previo aviso.
                                </p>
                                <h4 className="font-semibold mt-6 mb-2">Disponibilidad de productos</h4>
                                <p className="mb-4">
                                    La cantidad de productos mostrada en el sitio es una estimación basada en el inventario al momento de la consulta. Si bien El Boom Tractopartes no pondrá a la venta intencionalmente productos
                                    que no se encuentren en existencia, pueden surgir errores debido a incidencias en los sistemas informáticos o a causas operativas no previstas.
                                    En caso de que un producto comprado no esté disponible, el equipo de atención al cliente tomará contacto con el usuario para brindar una solución adecuada.
                                    Por otra parte, todos los productos y servicios que se ofrezcan dentro del sitio web están sujetos a cambios sin previo aviso.
                                </p>
                                <h4 className="font-semibold mt-6 mb-2">Envíos y entregas</h4>
                                <p className="mb-4">
                                    El Boom Tractopartes realiza sus envíos a través de la empresa de mensajería DHL. Nos aseguramos de entregar cada pedido en condiciones óptimas al recolector de paquetería, quien es el responsable
                                    de completar la entrega hasta la dirección proporcionada por el usuario.
                                    El tiempo estimado de entrega es de 1 a 3 días hábiles para la mayoría de las zonas del país. Estos plazos son aproximados, por lo que pueden variar debido a condiciones logísticas,
                                    causas fortuitas o de fuerza mayor. El Boom Tractopartes no asume responsabilidad por retrasos atribuibles a DHL o a situaciones fuera de su control.
                                    En casos donde la dirección de destino sea considerada “zona remota” por la empresa de mensajería, es posible que los costos de envío y los plazos de entrega se vean modificados.
                                </p>
                                <h4 className="font-semibold mt-6 mb-2">Recepción del pedido y responsabilidad del usuario</h4>
                                <p className="mb-4 text-justify">
                                    Es responsabilidad del usuario revisar el estado del paquete al momento de la entrega. En caso de detectar algún daño, apertura, golpe, rotura o señal de alteración,
                                    deberá notificarlo de inmediato tanto a la empresa de mensajería como a El Boom Tractopartes.
                                    El usuario cuenta con un plazo de 24 horas tras la recepción para reportar cualquier anomalía por correo electrónico, adjuntando evidencia de los daños.
                                    El incumplimiento de este plazo podría limitar la posibilidad de reclamar.
                                    El Boom Tractopartes no se responsabiliza por errores en la entrega si la información proporcionada por el usuario está incompleta, es incorrecta o ha sido omitida.
                                </p>
                                <p className="mt-8 text-gray-500 dark:text-gray-400">
                                    Última actualización: 09 de Agosto de 2025
                                </p>
                            </div>
                        ) : activeDocument === 'terms' ? (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Responsable del tratamiento de datos</h3>
                                <p className="mb-4 text-justify">
                                    El Boom Tractopartes, con domicilio en Carretera federal México - Acapulco Km. 29, Puente de Ixtla, Mor. 62660, es responsable del tratamiento de sus datos personales,
                                    de conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
                                    Este Aviso de Privacidad forma parte del uso del sitio web www.refaccioneselboom.com y está diseñado para garantizar la protección, confidencialidad y uso legítimo de su información.
                                </p>
                                <h4 className="font-semibold mt-6 mb-2">Datos personales recabados</h4>
                                <p className="mb-4 text-justify">
                                    Se recaban datos personales del usuario con la finalidad de poder procesar compras, brindar atención personalizada y cumplir con los servicios ofrecidos.
                                    Esta información incluye, de forma enunciativa, nombre completo, domicilio, teléfono, correo electrónico, datos relacionados con el historial de compra, entre otros.
                                </p>
                                <h4 className="font-semibold mt-6 mb-2">Datos financieros</h4>
                                <p className="mb-4">
                                    El Boom Tractopartes no guarda ni procesa directamente datos bancarios o de cualquier tipo de tarjeta (crédito/débito). Estos son gestionados exclusivamente por la plataforma de pagos
                                    “Openpay” by BBVA,
                                    que cuenta con sus propios sistemas de seguridad y políticas de privacidad.
                                </p>
                                <h4 className="font-semibold mt-6 mb-2">Finalidad del tratamiento</h4>
                                <p className="mb-4">
                                    Los datos personales serán utilizados para las siguientes finalidades primarias:
                                    1. Registro y alta de usuarios.
                                    2. Procesamiento y envío de pedidos.
                                    3. Atención al cliente y seguimiento de incidencias.
                                    4. Comunicación sobre cambios en productos o servicios.
                                    5. Cumplimiento de obligaciones fiscales o contractuales.

                                    Adicionalmente, se podrán emplear con fines secundarios:
                                    1. Promoción de productos y servicios.
                                    2. Invitar a participar en encuestas y estudios de mercado.
                                    3. Evaluación de calidad del servicio.
                                    4. Análisis estadístico o de comportamiento del consumidor.

                                    El usuario podrá solicitar en cualquier momento su exclusión de las finalidades secundarias enviando un correo a:
                                    capitalhumano@refaccioneselboom.com, con el asunto “Lista de Exclusión”.
                                </p>

                                <h4 className="font-semibold mt-6 mb-2">Transferencia de datos a terceros</h4>
                                <p className="mb-4">
                                    El Boom Tractopartes no comparte datos personales con terceros sin consentimiento del titular, salvo cuando sea necesario para:
                                    1. Realizar envíos mediante empresas de mensajería.
                                    2. Procesar pagos a través de plataformas autorizadas.
                                    3. Gestionar solicitudes de garantía.
                                    4. Cumplir con disposiciones legales o requerimientos judiciales.
                                </p>
                                <h4 className="font-semibold mt-6 mb-2">Seguridad de la información</h4>
                                <p className="mb-4">
                                    El Boom Tractopartes adopta medidas de seguridad técnicas, administrativas y físicas para proteger la información personal contra daño, pérdida, alteración, destrucción o acceso no autorizado.
                                    El sitio utiliza protocolo de seguridad SSL para el cifrado de la información transmitida. Puede verificarse la seguridad observando el prefijo "https://" en la barra de direcciones.
                                    No se recaba información de menores de edad. Se presume que todos los datos han sido proporcionados por adultos con plena capacidad legal.
                                </p>
                                <h4 className="font-semibold mt-6 mb-2">Ejercicio de derechos ARCO</h4>
                                <p className="mb-4">
                                    El titular podrá ejercer en cualquier momento sus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO), así como revocar el consentimiento para el tratamiento de sus datos,
                                    enviando su solicitud a: capitalhumano@refaccioneselboom.com
                                    La solicitud deberá contener:
                                    1. Nombre completo, domicilio y medios de contacto.
                                    2. Copia de identificación oficial.
                                    3. Petición clara del derecho que desea ejercer.
                                    4. Descripción de los datos afectados.
                                    5. Documentación de respaldo si aplica.
                                </p>

                                <p className="mb-4">
                                    El proceso de compra en el Portal requiere que el Usuario:
                                </p>
                                <ol className="list-decimal pl-6 mb-4">
                                    <li className="mb-2">Añada productos al carrito de compras</li>
                                    <li className="mb-2">Proporcione la información necesaria para el envío y facturación</li>
                                    <li className="mb-2">Seleccione el método de pago</li>
                                    <li className="mb-2">Confirme y realice el pedido</li>
                                </ol>
                                <p className="mt-8 text-gray-500 dark:text-gray-400">
                                    Última actualización: 1 de junio de 2025
                                </p>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Política de Devoluciones</h3>
                                <p className="mb-4">
                                    En El Boom Tractopartes estamos comprometidos con tu satisfacción. Esta política de devoluciones
                                    establece los términos y condiciones para la devolución de productos adquiridos en nuestro portal.
                                </p>
                                <h4 className="font-semibold mt-6 mb-2">1. Plazo para devoluciones</h4>
                                <p className="mb-4">
                                    Todos los productos adquiridos en nuestra tienda en línea pueden ser devueltos dentro de los
                                    30 días naturales posteriores a la fecha de entrega, siempre y cuando cumplan con los requisitos
                                    establecidos en esta política.
                                </p>
                                <h4 className="font-semibold mt-6 mb-2">2. Condiciones del producto</h4>
                                <p className="mb-4">
                                    Para que una devolución sea aceptada, el producto debe estar:
                                </p>
                                <ul className="list-disc pl-6 mb-4">
                                    <li className="mb-2">En su empaque original, sin abrir o dañar</li>
                                    <li className="mb-2">Con todas las etiquetas, manuales y accesorios</li>
                                    <li className="mb-2">Sin signos de uso o instalación</li>
                                    <li className="mb-2">Acompañado del comprobante de compra original</li>
                                </ul>
                                <h4 className="font-semibold mt-6 mb-2">3. Productos no elegibles para devolución</h4>
                                <p className="mb-4">
                                    Los siguientes productos no son elegibles para devolución:
                                </p>
                                <ul className="list-disc pl-6 mb-4">
                                    <li className="mb-2">Productos personalizados o fabricados a medida</li>
                                    <li className="mb-2">Productos que hayan sido instalados o usados</li>
                                    <li className="mb-2">Productos con empaques abiertos o dañados</li>
                                    <li className="mb-2">Software, licencias o productos digitales activados</li>
                                    <li className="mb-2">Artículos de liquidación o en oferta especial</li>
                                </ul>
                                <h4 className="font-semibold mt-6 mb-2">4. Proceso de devolución</h4>
                                <p className="mb-4">
                                    Para iniciar un proceso de devolución, sigue estos pasos:
                                </p>
                                <ol className="list-decimal pl-6 mb-4">
                                    <li className="mb-2">Contacta a nuestro servicio al cliente a través del formulario en línea o llamando al número proporcionado en nuestra página de contacto</li>
                                    <li className="mb-2">Proporciona el número de orden y el motivo de la devolución</li>
                                    <li className="mb-2">Recibirás instrucciones específicas sobre cómo enviar el producto</li>
                                    <li className="mb-2">Una vez recibido y aprobado, procesaremos tu reembolso o cambio según corresponda</li>
                                </ol>
                                <h4 className="font-semibold mt-6 mb-2">5. Reembolsos</h4>
                                <p className="mb-4">
                                    Los reembolsos se procesarán utilizando el mismo método de pago utilizado para la compra original:
                                </p>
                                <ul className="list-disc pl-6 mb-4">
                                    <li className="mb-2">Tarjetas de crédito/débito: 5-10 días hábiles</li>
                                    <li className="mb-2">Transferencias bancarias: 3-7 días hábiles</li>
                                    <li className="mb-2">Otros métodos de pago: hasta 14 días hábiles</li>
                                </ul>
                                <p className="mt-8 text-gray-500 dark:text-gray-400">
                                    Última actualización: 1 de junio de 2025
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}