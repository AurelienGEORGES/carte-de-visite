import { useEffect, useState } from 'react';
import { formatDuration } from '../utils.js';

export function usePageLoadTime() {
    const [loadTime, setLoadTime] = useState('--');

    useEffect(() => {
        let timeoutId;

        const measure = () => {
            timeoutId = window.setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                setLoadTime(formatDuration(navigation?.loadEventEnd || performance.now()));
            }, 0);
        };

        if (document.readyState === 'complete') {
            measure();
        } else {
            window.addEventListener('load', measure, { once: true });
        }

        return () => {
            window.removeEventListener('load', measure);
            window.clearTimeout(timeoutId);
        };
    }, []);

    return loadTime;
}
