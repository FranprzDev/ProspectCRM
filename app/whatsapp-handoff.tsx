import { getWhatsAppHandoff } from "../lib/whatsapp-handoffs";

type Props = {
  prospectId: string;
};

export function WhatsAppHandoff({ prospectId }: Props) {
  const handoff = getWhatsAppHandoff(prospectId);

  if (!handoff) {
    return (
      <div className="flex flex-wrap items-center gap-2 break-words text-sm text-stone-400">
        WhatsApp no verificado
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 break-words text-sm">
      <a
        href={handoff.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center rounded bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        aria-label="WhatsApp: propuesta lista"
      >
        WhatsApp: propuesta lista
      </a>
      <a
        href={handoff.source}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center text-xs text-indigo-300 underline hover:text-blue-800 break-words"
      >
        Fuente
      </a>
      <span className="text-xs text-stone-400 break-words">
        Abrir no envía ni cambia el estado.
      </span>
    </div>
  );
}
