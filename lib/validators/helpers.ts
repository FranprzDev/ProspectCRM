import { ValidationError } from "./validation-error";

export function optionalString(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new ValidationError("Se esperaba un texto");
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function requiredString(value: unknown, field: string): string {
  const parsed = optionalString(value);
  if (parsed === null) throw new ValidationError(`Falta completar: ${field}`);
  return parsed;
}

export function optionalUrl(value: unknown, field: string): string | null {
  const parsed = optionalString(value);
  if (parsed === null) return null;
  if (!/^https?:\/\/.+/i.test(parsed)) {
    throw new ValidationError(`${field} tiene que ser una URL válida`);
  }
  return parsed;
}

export function optionalEmail(value: unknown): string | null {
  const parsed = optionalString(value);
  if (parsed === null) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed)) {
    throw new ValidationError("El email no parece válido");
  }
  return parsed;
}

export function optionalRating(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const num = typeof value === "string" ? Number(value) : value;
  if (typeof num !== "number" || Number.isNaN(num) || num < 0 || num > 5) {
    throw new ValidationError("El rating tiene que estar entre 0 y 5");
  }
  return num;
}

export function optionalCount(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const num = typeof value === "string" ? Number(value) : value;
  if (typeof num !== "number" || Number.isNaN(num) || !Number.isInteger(num) || num < 0) {
    throw new ValidationError("La cantidad de reseñas tiene que ser un número entero");
  }
  return num;
}

export function enumValue<T extends Record<string, string>>(
  enumObj: T,
  value: unknown,
  field: string
): T[keyof T] {
  const values = Object.values(enumObj);
  if (typeof value !== "string" || !values.includes(value)) {
    throw new ValidationError(`${field} no es un valor válido`);
  }
  return value as T[keyof T];
}

export function optionalTimestamp(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const date = typeof value === "string" || typeof value === "number" ? new Date(value) : null;
  if (date === null || Number.isNaN(date.getTime())) {
    throw new ValidationError("La fecha no es válida");
  }
  return date.getTime();
}
