/**
 * Proper TypeScript types for JSON data
 * These accurately represent what JSON can contain
 */

// Define what constitutes a valid JSON primitive
export type JsonPrimitive = string | number | boolean | null;

// Forward declaration for recursive types
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

// JSON object: keys are strings, values are any valid JSON value
export type JsonObject = { [key: string]: JsonValue };

// JSON array: array of any valid JSON values
export type JsonArray = JsonValue[];

// Alternative more restrictive object type (only allows JsonPrimitive values)
export type SimpleJsonObject = { [key: string]: JsonPrimitive };

// For cases where you know it's definitely an object (not array or primitive)
export type JsonObjectOnly = { [key: string]: JsonValue };
