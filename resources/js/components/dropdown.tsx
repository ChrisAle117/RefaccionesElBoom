import React, { useState, useRef, useEffect, Children } from "react";
import { router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownProps {
    label: string;
    children?: React.ReactNode;
}

const defaultOptionsData = [
    { key: "nosotros", label: "Nosotros" },
    { key: "sucursales", label: "Sucursales" },
    { key: "promociones", label: "¡Promociones!" },
    { key: "catalogos", label: "Catálogos" },
    { key: "contacto", label: "Contacto" },
    
];

const defaultOptions = defaultOptionsData.map((option) => (
    <a
        key={option.key}
        href="#"
        onClick={(e) => {
            e.preventDefault();
            router.get(window.location.pathname, { search: option.label });
        }}
        className="block px-4 py-2 hover:bg-gray-100 text-black"
        role="menuitem"
    >
        {option.label}
    </a>
));

export default function Dropdown({ label, children = defaultOptions }: DropdownProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    


    const items = Children.toArray(children);
    const chunkedItems: React.ReactNode[][] = [];
    for (let i = 0; i < items.length; i += 4) {
        chunkedItems.push(items.slice(i, i + 4));
    }

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="px-4 py-2 text-white rounded cursor-pointer hover:text-[#fbcc13]"
                aria-haspopup="true"
                aria-expanded={open}
            >
                {label}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="absolute left-0 mt-2 bg-white border rounded shadow-lg p-2 min-w-[12rem] z-50 origin-top-left max-w-[90vw] overflow-x-auto"
                        role="menu"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex gap-4">
                            {chunkedItems.map((column, colIndex) => (
                                <div key={colIndex} className="flex flex-col">
                                    {column.map((item, itemIndex) => (
                                        <div key={itemIndex} className="whitespace-normal">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
