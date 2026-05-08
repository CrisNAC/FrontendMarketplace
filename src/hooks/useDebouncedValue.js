import { useState, useEffect } from "react";

/**
 * @param {unknown} value
 * @param {number} delay ms
 */
export function useDebouncedValue(value, delay = 350) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);

    return debounced;
}
