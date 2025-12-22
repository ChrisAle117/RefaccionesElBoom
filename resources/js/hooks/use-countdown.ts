import { useState, useEffect } from 'react';

interface CountdownResult {
    hours: number;
    minutes: number;
    seconds: number;
}

export function useCountdown(secondsLeft: number): CountdownResult {
    const [timeLeft, setTimeLeft] = useState<CountdownResult>({
        hours: Math.floor(secondsLeft / 3600),
        minutes: Math.floor((secondsLeft % 3600) / 60),
        seconds: secondsLeft % 60
    });

    useEffect(() => {
        if (secondsLeft <= 0) {
            setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            return;
        }

        // Set initial values
        setTimeLeft({
            hours: Math.floor(secondsLeft / 3600),
            minutes: Math.floor((secondsLeft % 3600) / 60),
            seconds: secondsLeft % 60
        });

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                let newSeconds = prev.seconds - 1;
                let newMinutes = prev.minutes;
                let newHours = prev.hours;

                if (newSeconds < 0) {
                    newSeconds = 59;
                    newMinutes -= 1;
                }

                if (newMinutes < 0) {
                    newMinutes = 59;
                    newHours -= 1;
                }

                if (newHours < 0) {
                    newHours = 0;
                    newMinutes = 0;
                    newSeconds = 0;
                    clearInterval(interval);
                }

                return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsLeft]);

    return timeLeft;
}