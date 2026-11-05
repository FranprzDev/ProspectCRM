import { EmailDirection } from "@/lib/domain/enums";
import {
  enumValue,
  optionalEmail,
  optionalTimestamp,
  requiredString,
} from "./helpers";
import { ValidationError } from "./validation-error";

export interface LogEmailInput {
  direction: EmailDirection;
  subject: string;
  body: string;
  fromAddress: string;
  toAddress: string;
  sentAt: number;
}

export function parseLogEmail(body: unknown): LogEmailInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("El cuerpo del pedido no es válido");
  }
  const data = body as Record<string, unknown>;
  const fromAddress = optionalEmail(data.fromAddress);
  const toAddress = optionalEmail(data.toAddress);
  if (fromAddress === null || toAddress === null) {
    throw new ValidationError("Faltan las direcciones de origen y destino");
  }
  return {
    direction: enumValue(EmailDirection, data.direction ?? EmailDirection.Outbound, "dirección"),
    subject: requiredString(data.subject, "asunto"),
    body: requiredString(data.body, "texto del mail"),
    fromAddress,
    toAddress,
    sentAt: optionalTimestamp(data.sentAt) ?? Date.now(),
  };
}
