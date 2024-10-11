import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function truncateString(str, maxLength) {
    if ((str === null || str === void 0 ? void 0 : str.length) <= maxLength) {
        return str;
    }
    else {
        const leftHalf = str === null || str === void 0 ? void 0 : str.slice(0, Math.ceil((maxLength - 3) / 2));
        const rightHalf = str === null || str === void 0 ? void 0 : str.slice(-Math.floor((maxLength - 3) / 2));
        return leftHalf + '...' + rightHalf;
    }
}
