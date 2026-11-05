const timeZone = "America/Argentina/Tucuman";

export function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date(timestamp));
}

export function formatRelative(timestamp: number): string {
  const diffMinutes = Math.round((timestamp - Date.now()) / 60000);
  const abs = Math.abs(diffMinutes);
  const rtf = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });
  if (abs < 60) return rtf.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

export function formatIsoDateTime(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return formatDateTime(ms);
}
