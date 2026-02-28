// Form Validation Utilities
// Lightweight validators — no external dependencies needed.

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate that a value is not empty.
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
    if (!value || value.trim().length === 0) {
        return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true };
}

/**
 * Validate an email address format.
 */
export function validateEmail(email: string): ValidationResult {
    if (!email || email.trim().length === 0) {
        return { valid: false, error: 'Email is required' };
    }

    // RFC 5322 simplified — covers 99%+ of real email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return { valid: false, error: 'Please enter a valid email address' };
    }

    return { valid: true };
}

/**
 * Validate a password for minimum requirements.
 */
export function validatePassword(password: string): ValidationResult {
    if (!password) {
        return { valid: false, error: 'Password is required' };
    }

    if (password.length < 6) {
        return { valid: false, error: 'Password must be at least 6 characters' };
    }

    return { valid: true };
}

/**
 * Validate a name field.
 */
export function validateName(name: string): ValidationResult {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Name is required' };
    }
    if (name.trim().length < 2) {
        return { valid: false, error: 'Name must be at least 2 characters' };
    }
    return { valid: true };
}

/**
 * Run multiple validations and return the first error found.
 */
export function validateAll(
    ...results: ValidationResult[]
): ValidationResult {
    for (const result of results) {
        if (!result.valid) return result;
    }
    return { valid: true };
}
