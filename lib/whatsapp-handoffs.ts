import raw from "./data/whatsapp-handoffs.json";

export type WhatsAppHandoff = {
  url: string;
  source: string;
  verifiedAt: string;
};

type RawRecord = Record<string, unknown>;

const WA_PATTERN = /^https:\/\/wa\.me\/\d+\?text=.+$/;
const HTTPS_PATTERN = /^https:\/\/[^\s]+$/;

function isValidHandoff(value: unknown): value is WhatsAppHandoff {
  if (typeof value !== "object" || value === null) return false;
  const rec = value as RawRecord;
  const { url, source, verifiedAt } = rec;
  if (typeof url !== "string" || !WA_PATTERN.test(url)) return false;
  if (typeof source !== "string" || !HTTPS_PATTERN.test(source)) return false;
  if (typeof verifiedAt !== "string" || verifiedAt.length === 0) return false;
  if (!/^\d{4}-\d{2}-\d{2}/.test(verifiedAt)) return false;
  return true;
}

const store: Record<string, WhatsAppHandoff> = (() => {
  const out: Record<string, WhatsAppHandoff> = Object.create(null);
  if (typeof raw !== "object" || raw === null) return out;
  for (const [id, value] of Object.entries(raw as RawRecord)) {
    if (typeof id !== "string" || id.length === 0) continue;
    if (isValidHandoff(value)) {
      out[id] = {
        url: value.url,
        source: value.source,
        verifiedAt: value.verifiedAt,
      };
    }
  }
  return out;
})();

export function getWhatsAppHandoff(id: string): WhatsAppHandoff | null {
  if (typeof id !== "string" || id.length === 0) return null;
  return store[id] ?? null;
}
