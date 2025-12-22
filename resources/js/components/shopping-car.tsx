import React from "react";
import { ShoppingCart } from "lucide-react";
import { useShoppingCart } from "./shopping-car-context";

export function Cart({ onClick }: { onClick: () => void }) {
    const { totalItems } = useShoppingCart(); 

    return (
        <div className="relative cursor-pointer group" onClick={onClick}>
            <ShoppingCart className="h-6 w-6 transition-colors text-black duration-200 group-hover:text-[#006CFA]" />
            {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {totalItems}
            </span>
            )}
        </div>
    );
}