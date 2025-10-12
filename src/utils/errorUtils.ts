// src/utils/errorUtils.ts
import { AxiosError } from 'axios';

// This type represents the structure of a FastAPI validation error
type ValidationErrorMessage = {
    loc: (string | number)[];
    msg: string;
    type: string;
};

/**
 * Parses an error from an Axios API call and returns a user-friendly string.
 * @param error The error object, typically from a catch block.
 * @returns A string containing the most specific error message available.
 */
export const getErrorPayload = (error: unknown): string => {
    if (error instanceof AxiosError && error.response) {
        const data = error.response.data;

        // Case 1: FastAPI validation error ({"detail": [...]})
        if (data.detail && Array.isArray(data.detail)) {
            return data.detail
                .map((err: ValidationErrorMessage) => `${err.loc.join('.')} - ${err.msg}`)
                .join('; ');
        }

        // Case 2: Simple string detail ({"detail": "Error message"})
        if (typeof data.detail === 'string') {
            return data.detail;
        }

        // Case 3: Other common error structures
        if (typeof data.message === 'string') {
            return data.message;
        }
    }

    // Fallback for network errors or other unexpected issues
    if (error instanceof Error) {
        return error.message;
    }

    return 'An unknown error occurred.';
};