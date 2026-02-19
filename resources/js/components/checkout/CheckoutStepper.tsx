import React from 'react';
import { Check } from 'lucide-react';

interface CheckoutStepperProps {
    currentStep: number;
    steps: string[];
}

export function CheckoutStepper({ currentStep, steps }: CheckoutStepperProps) {
    return (
        <div className="w-full py-4 px-4 sm:px-0 mb-6">
            <div className="w-full flex items-center justify-between relative max-w-3xl mx-auto">
                {/* Background line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 z-0 rounded-full"></div>

                {/* Progress line */}
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-full transition-all duration-500 ease-in-out z-0"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <div key={index} className="flex flex-col items-center z-10 relative bg-white dark:bg-gray-800 p-1 rounded-full">
                            <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm sm:text-base transition-all duration-300 ${isActive
                                        ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg'
                                        : isCompleted
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                                    }`}
                            >
                                {isCompleted ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : stepNumber}
                            </div>
                            <span
                                className={`absolute top-full mt-2 text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap ${isActive
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : isCompleted
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-gray-400 dark:text-gray-500'
                                    }`}
                            >
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
