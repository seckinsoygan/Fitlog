// FitLog - Timer Hook
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
    autoStart?: boolean;
    countDown?: boolean;
    initialTime?: number; // in seconds
    onComplete?: () => void;
}

interface UseTimerReturn {
    time: number;
    isRunning: boolean;
    start: () => void;
    pause: () => void;
    reset: () => void;
    toggle: () => void;
    formatTime: (seconds?: number) => string;
}

export const useTimer = (options: UseTimerOptions = {}): UseTimerReturn => {
    const {
        autoStart = false,
        countDown = false,
        initialTime = 0,
        onComplete,
    } = options;

    const [time, setTime] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(autoStart);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const onCompleteRef = useRef(onComplete);

    // Keep callback ref updated
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    // Timer logic
    useEffect(() => {
        if (!isRunning) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            setTime((prevTime) => {
                if (countDown) {
                    if (prevTime <= 1) {
                        setIsRunning(false);
                        onCompleteRef.current?.();
                        return 0;
                    }
                    return prevTime - 1;
                }
                return prevTime + 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, countDown]);

    const start = useCallback(() => {
        setIsRunning(true);
    }, []);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const reset = useCallback(() => {
        setIsRunning(false);
        setTime(initialTime);
    }, [initialTime]);

    const toggle = useCallback(() => {
        setIsRunning((prev) => !prev);
    }, []);

    const formatTime = useCallback((seconds?: number) => {
        const secs = seconds ?? time;
        const hrs = Math.floor(secs / 3600);
        const mins = Math.floor((secs % 3600) / 60);
        const remainingSecs = secs % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${remainingSecs
                .toString()
                .padStart(2, '0')}`;
        }
        return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    }, [time]);

    return {
        time,
        isRunning,
        start,
        pause,
        reset,
        toggle,
        formatTime,
    };
};
