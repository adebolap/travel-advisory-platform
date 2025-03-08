import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and merges Tailwind classes with twMerge.
 * Handles conditional classes gracefully.
 *
 * @param inputs - An array of class values (strings, objects, arrays) to merge.
 * @returns A combined and merged class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely accesses deeply nested object properties.
 *
 * @param obj - The object to access.
 * @param path - An array of strings representing the path to the property.
 * @param defaultValue - The value to return if the path is not found.
 * @returns The value at the specified path or the default value.
 */
export function getNestedProperty<T, K extends keyof T>(
  obj: T,
  path: string[],
  defaultValue?: any
): any {
  return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue), obj);
}

/**
 * Formats a date to a readable string.
 *
 * @param date - The date to format.
 * @param options - Intl.DateTimeFormat options for customization.
 * @returns A formatted date string.
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, options);
}
