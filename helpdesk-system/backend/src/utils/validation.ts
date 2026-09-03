// src/utils/validation.ts

export const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isNonEmptyString = (value: unknown) => {
    return (
        typeof value === "string" &&
        value.trim().length > 0
    );
};

export const isValidId = (value: unknown) => {
    const id = Number(value);

    return Number.isInteger(id) && id > 0;
};