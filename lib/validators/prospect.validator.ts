import {
  ProspectCategory,
  ProspectStatus,
  WebsiteStatus,
} from "@/lib/domain/enums";
import { ValidationError } from "./validation-error";
import {
  enumValue,
  optionalCount,
  optionalEmail,
  optionalRating,
  optionalString,
  optionalUrl,
  requiredString,
} from "./helpers";

export interface CreateProspectInput {
  name: string;
  category: ProspectCategory;
  status: ProspectStatus;
  phone: string | null;
  email: string | null;
  address: string | null;
  mapsUrl: string | null;
  websiteUrl: string | null;
  websiteStatus: WebsiteStatus;
  rating: number | null;
  reviewsCount: number | null;
  pitchAngle: string | null;
  demoPageUrl: string | null;
  notes: string | null;
}

export function parseCreateProspect(body: unknown): CreateProspectInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("El cuerpo del pedido no es válido");
  }
  const data = body as Record<string, unknown>;
  return {
    name: requiredString(data.name, "nombre"),
    category: enumValue(ProspectCategory, data.category ?? ProspectCategory.Other, "rubro"),
    status: enumValue(ProspectStatus, data.status ?? ProspectStatus.New, "estado"),
    phone: optionalString(data.phone),
    email: optionalEmail(data.email),
    address: optionalString(data.address),
    mapsUrl: optionalUrl(data.mapsUrl, "El link de Maps"),
    websiteUrl: optionalUrl(data.websiteUrl, "La web"),
    websiteStatus: enumValue(WebsiteStatus, data.websiteStatus ?? WebsiteStatus.Unknown, "estado de la web"),
    rating: optionalRating(data.rating),
    reviewsCount: optionalCount(data.reviewsCount),
    pitchAngle: optionalString(data.pitchAngle),
    demoPageUrl: optionalUrl(data.demoPageUrl, "La página de muestra"),
    notes: optionalString(data.notes),
  };
}

export interface UpdateProspectInput {
  name?: string;
  category?: ProspectCategory;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  mapsUrl?: string | null;
  websiteUrl?: string | null;
  websiteStatus?: WebsiteStatus;
  rating?: number | null;
  reviewsCount?: number | null;
  pitchAngle?: string | null;
  demoPageUrl?: string | null;
  notes?: string | null;
}

export function parseUpdateProspect(body: unknown): UpdateProspectInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("El cuerpo del pedido no es válido");
  }
  const data = body as Record<string, unknown>;
  const input: UpdateProspectInput = {};
  if ("name" in data) input.name = requiredString(data.name, "nombre");
  if ("category" in data) input.category = enumValue(ProspectCategory, data.category, "rubro");
  if ("phone" in data) input.phone = optionalString(data.phone);
  if ("email" in data) input.email = optionalEmail(data.email);
  if ("address" in data) input.address = optionalString(data.address);
  if ("mapsUrl" in data) input.mapsUrl = optionalUrl(data.mapsUrl, "El link de Maps");
  if ("websiteUrl" in data) input.websiteUrl = optionalUrl(data.websiteUrl, "La web");
  if ("websiteStatus" in data) {
    input.websiteStatus = enumValue(WebsiteStatus, data.websiteStatus, "estado de la web");
  }
  if ("rating" in data) input.rating = optionalRating(data.rating);
  if ("reviewsCount" in data) input.reviewsCount = optionalCount(data.reviewsCount);
  if ("pitchAngle" in data) input.pitchAngle = optionalString(data.pitchAngle);
  if ("demoPageUrl" in data) input.demoPageUrl = optionalUrl(data.demoPageUrl, "La página de muestra");
  if ("notes" in data) input.notes = optionalString(data.notes);
  return input;
}

export function parseProspectStatus(body: unknown): ProspectStatus {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("El cuerpo del pedido no es válido");
  }
  return enumValue(ProspectStatus, (body as Record<string, unknown>).status, "estado");
}

export function parseNote(body: unknown): string {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("El cuerpo del pedido no es válido");
  }
  return requiredString((body as Record<string, unknown>).message, "nota");
}
