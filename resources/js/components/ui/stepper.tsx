import type React from "react"
import { Check } from "lucide-react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface Step {
    id: number
    title: string
}

interface StepperProps {
    steps: Step[]
    currentStep: number
    className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
    return (
        <div className={cn("w-full py-4", className)}>
            <div className="relative flex items-center justify-between w-full">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 rounded-full" />

                {/* Active Line Progress */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-[#006CFA] dark:bg-[#FBCC13] -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step) => {
                    const isCompleted = currentStep > step.id
                    const isActive = currentStep === step.id

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white dark:bg-gray-800",
                                    isActive
                                        ? "border-[#006CFA] dark:border-[#FBCC13] text-[#006CFA] dark:text-[#FBCC13] ring-4 ring-blue-100 dark:ring-yellow-900/30 scale-110"
                                        : isCompleted
                                            ? "border-green-500 bg-green-500 text-white border-transparent"
                                            : "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                                ) : (
                                    <span className="text-sm sm:text-base font-bold">{step.id}</span>
                                )}
                            </div>
                            <span
                                className={cn(
                                    "absolute top-full mt-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-300 hidden sm:block",
                                    isActive
                                        ? "text-[#006CFA] dark:text-[#FBCC13]"
                                        : isCompleted
                                            ? "text-green-600 dark:text-green-500"
                                            : "text-gray-400 dark:text-gray-500"
                                )}
                            >
                                {step.title}
                            </span>
                        </div>
                    )
                })}
            </div>
            {/* Mobile Labels (Only visible on small screens for current step) */}
            <div className="mt-4 text-center sm:hidden">
                <span className="text-sm font-bold text-gray-800 dark:text-white">
                    Paso {currentStep} de {steps.length}:
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    {steps.find(s => s.id === currentStep)?.title}
                </span>
            </div>
        </div>
    )
}
