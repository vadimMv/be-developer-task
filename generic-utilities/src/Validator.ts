/**
 * Validation result type - success with data or failure with errors
 */
export type ValidationResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    errors: string[];
};

/**
 * Validator function type
 */
export type Validator<T> = (value: unknown) => ValidationResult<T>;

/**
 * Create a validator for string values
 * @returns Validator that checks if value is a string
 */
export function string(): Validator<string> {
    return (value: unknown): ValidationResult<string> => {
        if (typeof value === 'string') {
            return { success: true, data: value };
        }
        return { success: false, errors: ['Expected string'] };
    };
}

/**
 * Create a validator for number values
 * @returns Validator that checks if value is a number
 */
export function number(): Validator<number> {
    return (value: unknown): ValidationResult<number> => {
        if (typeof value === 'number' && !isNaN(value)) {
            return { success: true, data: value };
        }
        return { success: false, errors: ['Expected number'] };
    };
}

/**
 * Create a validator for boolean values
 * @returns Validator that checks if value is a boolean
 */
export function boolean(): Validator<boolean> {
    return (value: unknown): ValidationResult<boolean> => {
        if (typeof value === 'boolean') {
            return { success: true, data: value };
        }
        return { success: false, errors: ['Expected boolean'] };
    };
}

/**
 * Create a validator for array values with item validation
 * @template T - Type of array items
 * @param itemValidator - Validator for each array item
 * @returns Validator that checks if value is an array with valid items
 */
export function array<T>(itemValidator: Validator<T>): Validator<T[]> {
    return (value: unknown): ValidationResult<T[]> => {
        if (!Array.isArray(value)) {
            return { success: false, errors: ['Expected array'] };
        }

        const results: T[] = [];
        const errors: string[] = [];

        for (let i = 0; i < value.length; i++) {
            const result = itemValidator(value[i]);
            if (result.success) {
                results.push(result.data);
            } else {
                errors.push(`Item at index ${i}: ${result.errors.join(', ')}`);
            }
        }

        if (errors.length > 0) {
            return { success: false, errors };
        }

        return { success: true, data: results };
    };
}

/**
 * Create a validator for object values with schema validation
 * @template T - Object type
 * @param schema - Schema defining validators for each property
 * @returns Validator that checks if value matches the schema
 */
export function object<T extends Record<string, unknown>>(
    schema: { [K in keyof T]: Validator<T[K]> }
): Validator<T> {
    return (value: unknown): ValidationResult<T> => {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            return { success: false, errors: ['Expected object'] };
        }

        const obj = value as Record<string, unknown>;
        const result: Partial<T> = {};
        const errors: string[] = [];

        for (const key in schema) {
            const validator = schema[key];
            const fieldValue = obj[key];
            const fieldResult = validator(fieldValue);

            if (fieldResult.success) {
                result[key] = fieldResult.data;
            } else {
                errors.push(`Field '${key}': ${fieldResult.errors.join(', ')}`);
            }
        }

        if (errors.length > 0) {
            return { success: false, errors };
        }

        return { success: true, data: result as T };
    };
}

/**
 * Create a validator for optional values
 * @template T - Value type
 * @param validator - Validator for the value when present
 * @returns Validator that allows undefined or validates with the given validator
 */
export function optional<T>(validator: Validator<T>): Validator<T | undefined> {
    return (value: unknown): ValidationResult<T | undefined> => {
        if (value === undefined) {
            return { success: true, data: undefined };
        }
        return validator(value);
    };
}

/**
 * Create a validator for nullable values
 * @template T - Value type
 * @param validator - Validator for the value when not null
 * @returns Validator that allows null or validates with the given validator
 */
export function nullable<T>(validator: Validator<T>): Validator<T | null> {
    return (value: unknown): ValidationResult<T | null> => {
        if (value === null) {
            return { success: true, data: null };
        }
        return validator(value);
    };
}

/**
 * Create a validator for literal values
 * @template T - Literal type
 * @param literal - The expected literal value
 * @returns Validator that checks if value equals the literal
 */
export function literal<T extends string | number | boolean>(literal: T): Validator<T> {
    return (value: unknown): ValidationResult<T> => {
        if (value === literal) {
            return { success: true, data: value as T };
        }
        return { success: false, errors: [`Expected literal value: ${literal}`] };
    };
}

/**
 * Create a validator for union types
 * @template T - Union type
 * @param validators - Array of validators to try
 * @returns Validator that succeeds if any validator succeeds
 */
export function union<T>(...validators: Validator<T>[]): Validator<T> {
    return (value: unknown): ValidationResult<T> => {
        const errors: string[] = [];

        for (const validator of validators) {
            const result = validator(value);
            if (result.success) {
                return result;
            }
            errors.push(...result.errors);
        }

        return { success: false, errors: ['No union variant matched', ...errors] };
    };
}

/**
 * Create a custom validator with a predicate function
 * @template T - Value type
 * @param validator - Base validator
 * @param predicate - Additional validation predicate
 * @param errorMessage - Error message if predicate fails
 * @returns Validator with custom validation
 */
export function refine<T>(
    validator: Validator<T>,
    predicate: (value: T) => boolean,
    errorMessage: string
): Validator<T> {
    return (value: unknown): ValidationResult<T> => {
        const result = validator(value);
        if (!result.success) {
            return result;
        }

        if (!predicate(result.data)) {
            return { success: false, errors: [errorMessage] };
        }

        return result;
    };
}
