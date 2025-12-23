import React from "react";
import { CollapsibleSection } from "./collapsible-section";

export default function Ubication() {

    const WhatsAppIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="currentColor" className="text-green-600">
            <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.617 1.934 6.594L4 29l7.594-1.934A12.96 12.96 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.98 0-3.92-.52-5.617-1.51l-.401-.23-4.516 1.15 1.2-4.396-.26-.418A9.94 9.94 0 0 1 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.13-7.47c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.13-.61.14-.18.27-.7.9-.86 1.09-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.41-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.29-.34.43-.51.14-.17.18-.29.27-.48.09-.19.04-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.36-.26.29-1 1-.97 2.43.03 1.43.98 2.81 1.12 3 .14.19 1.93 2.95 4.68 4.02.65.28 1.16.45 1.56.58.65.21 1.24.18 1.71.11.52-.08 1.65-.67 1.89-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z" />
        </svg>
    );
    return (
        <div className="p-4 border-b-2 border-[#FBCC13] bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-8 text-center text-[#006CFA] dark:text-[#FBCC13] drop-shadow">Ubicación de nuestras sucursales</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sucursal 1 */}
                <div className="rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-[#FBCC13] dark:border-[#006CFA] overflow-hidden flex flex-col transition-transform duration-200 hover:scale-[1.02]">
                    <iframe className="w-full h-64" src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d968614.9847190331!2d-100.136292!3d18.499403!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cddf88156feb99%3A0x52215aad906626e5!2sRefaccionaria%20EL%20BOOM%20Tractopartes%20Alpuyeca!5e0!3m2!1ses-419!2smx!4v1743438339844!5m2!1ses-419!2smx" allowFullScreen loading="lazy"></iframe>
                    <div className="p-6 flex flex-col gap-2">
                        <h2 className="text-xl font-bold text-[#006CFA] dark:text-[#FBCC13] mb-2">Sucursal Matriz Alpuyeca</h2>
                        <p className="text-base text-gray-700 dark:text-gray-300 mb-2">REFACCIONES EL BOOM, Carr. Federal Mexico-Acapulco Km. 29, 62660 Puente de Ixtla, MORELOS</p>
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="font-semibold">Llámanos al +52</span>
                            <a href="https://wa.me/527771810370" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#FBCC13] text-black rounded-lg font-bold shadow hover:bg-green-600 transition-colors duration-200 flex items-center gap-2">
                                {WhatsAppIcon}
                                <span className="ml-1">777-181-0370 <span className="bg-white text-green-600 text-xs font-semibold px-2 py-0.5 rounded ml-2">WhatsApp</span></span>
                            </a>
                            <span className="font-semibold">o al</span>
                            <a href="https://wa.me/527771810370" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#FBCC13] text-black rounded-lg font-bold shadow hover:bg-green-600 transition-colors duration-200 flex items-center gap-2">
                                {WhatsAppIcon}
                                <span className="ml-1">734-344-5155 <span className="bg-white text-green-600 text-xs font-semibold px-2 py-0.5 rounded ml-2">WhatsApp</span></span>
                            </a>
                        </div>
                    </div>
                </div>
                {/* Sucursal 2 */}
                <div className="rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-[#FBCC13] dark:border-[#006CFA] overflow-hidden flex flex-col transition-transform duration-200 hover:scale-[1.02]">
                    <iframe className="w-full h-64" src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15271.232386979467!2d-99.832457!3d16.885385000000003!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ca574050c25b93%3A0x3faf11878a9b5e6!2sRefaccionaria%20EL%20BOOM%20Tractopartes%20Acapulco!5e0!3m2!1ses-419!2smx!4v1743438369847!5m2!1ses-419!2smx" allowFullScreen loading="lazy"></iframe>
                    <div className="p-6 flex flex-col gap-2">
                        <h2 className="text-xl font-bold text-[#006CFA] dark:text-[#FBCC13] mb-2">Sucursal Acapulco</h2>
                        <p className="text-base text-gray-700 dark:text-gray-300 mb-2">Refaccionaria EL BOOM, Avenida Lázaro Cárdenas, No. 2, Manzana 18. Colonia La Popular, Acapulco, Guerrero</p>
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="font-semibold">Llámanos al +52</span>
                            <a href="https://wa.me/527443835814" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#FBCC13] text-black rounded-lg font-bold shadow hover:bg-green-600 transition-colors duration-200 flex items-center gap-2">
                                {WhatsAppIcon}
                                <span className="ml-1">744-383-5814 <span className="bg-white text-green-600 text-xs font-semibold px-2 py-0.5 rounded ml-2">WhatsApp</span></span>
                            </a>
                            <span className="font-semibold">o al</span>
                            <a href="https://wa.me/527772740249" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#FBCC13] text-black rounded-lg font-bold shadow hover:bg-green-600 transition-colors duration-200 flex items-center gap-2">
                                {WhatsAppIcon}
                                <span className="ml-1">777-274-0249 <span className="bg-white text-green-600 text-xs font-semibold px-2 py-0.5 rounded ml-2">WhatsApp</span></span>
                            </a>
                        </div>
                    </div>
                </div>
                {/* Sucursal 3 */}
                <div className="rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-[#FBCC13] dark:border-[#006CFA] overflow-hidden flex flex-col transition-transform duration-200 hover:scale-[1.02]">
                    <iframe className="w-full h-64" src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3803.4320282240833!2d-99.514731!3d17.582208!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cbedffee6368f3%3A0xda0f508041fb8cf3!2sRefaccionaria%20EL%20BOOM%20Tractopartes%20Chilpancingo!5e0!3m2!1ses-419!2smx!4v1743438397054!5m2!1ses-419!2smx" allowFullScreen loading="lazy"></iframe>
                    <div className="p-6 flex flex-col gap-2">
                        <h2 className="text-xl font-bold text-[#006CFA] dark:text-[#FBCC13] mb-2">Sucursal Chilpancingo</h2>
                        <p className="text-base text-gray-700 dark:text-gray-300 mb-2">Refaccionaria EL BOOM, Boulevard Vicente Guerrero, Km 269, Chilpancingo, Guerrero</p>
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="font-semibold">Llámanos al +52</span>
                            <a href="https://wa.me/527551308536" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#FBCC13] text-black rounded-lg font-bold shadow hover:bg-green-600 transition-colors duration-200 flex items-center gap-2">
                                {WhatsAppIcon}
                                <span className="ml-1">755-130-8536 <span className="bg-white text-green-600 text-xs font-semibold px-2 py-0.5 rounded ml-2">WhatsApp</span></span>
                            </a>
                            <span className="font-semibold">o al</span>
                            <a href="https://wa.me/527773271852" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#FBCC13] text-black rounded-lg font-bold shadow hover:bg-green-600 transition-colors duration-200 flex items-center gap-2">
                                {WhatsAppIcon}
                                <span className="ml-1">777-327-1852 <span className="bg-white text-green-600 text-xs font-semibold px-2 py-0.5 rounded ml-2">WhatsApp</span></span>
                            </a>
                        </div>
                    </div>
                </div>
                {/* Sucursal 4 */}
                <div className="rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-[#FBCC13] dark:border-[#006CFA] overflow-hidden flex flex-col transition-transform duration-200 hover:scale-[1.02]">
                    <iframe className="w-full h-64" src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15097.35773851505!2d-99.185934!3d18.916364!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce757ee8ff1be1%3A0x62d09f4369d36965!2sRefaccionaria%20EL%20BOOM%20Tractopartes%20Tizoc%2C%20Jiutepec!5e0!3m2!1ses-419!2smx!4v1743438424259!5m2!1ses-419!2smx" allowFullScreen loading="lazy"></iframe>
                    <div className="p-6 flex flex-col gap-2">
                        <h2 className="text-xl font-bold text-[#006CFA] dark:text-[#FBCC13] mb-2">Sucursal Tizoc</h2>
                        <p className="text-base text-gray-700 dark:text-gray-300 mb-2">Refaccionaria EL BOOM, Boulevard Cuauhnáhuac Km 3.5, No. 25. Colonia Buganbilias, Jiutepec, Morelos</p>
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="font-semibold">Llámanos al +52</span>
                            <a href="https://wa.me/527772882005" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#FBCC13] text-black rounded-lg font-bold shadow hover:bg-green-600 transition-colors duration-200 flex items-center gap-2">
                                {WhatsAppIcon}
                                <span className="ml-1">777-288-2005 <span className="bg-white text-green-600 text-xs font-semibold px-2 py-0.5 rounded ml-2">WhatsApp</span></span>
                            </a>
                            <span className="font-semibold">o al</span>
                            <a href="https://wa.me/527773211950" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#FBCC13] text-black rounded-lg font-bold shadow hover:bg-green-600 transition-colors duration-200 flex items-center gap-2">
                                {WhatsAppIcon}
                                <span className="ml-1">777-321-1950 <span className="bg-white text-green-600 text-xs font-semibold px-2 py-0.5 rounded ml-2">WhatsApp</span></span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}