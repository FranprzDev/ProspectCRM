import { ImprovementStatus } from "@/lib/domain/enums";
import { ValidationError } from "./validation-error";
import { enumValue, optionalString, requiredString } from "./helpers";

export interface CreateImprovementInput {
  title: string;
  body: string;
  basis: string | null;
}

export function parseCreateImprovement(body: unknown): CreateImprovementInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("El cuerpo del pedido no es válido");
  }
  const data = body as Record<string, unknown>;
  return {
    title: requiredString(data.title, "título"),
    body: requiredString(data.body, "cuerpo"),
    basis: optionalString(data.basis),
  };
}

export function parseImprovementStatus(body: unknown): ImprovementStatus {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("El cuerpo del pedido no es válido");
  }
  return enumValue(ImprovementStatus, (body as Record<string, unknown>).status, "estado");
}
