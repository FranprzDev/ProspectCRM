export const ProspectStatus = {
  New: "NEW",
  Contacted: "CONTACTED",
  AdvancedLead: "ADVANCED_LEAD",
  Closing: "CLOSING",
  HumanHandoff: "HUMAN_HANDOFF",
  Won: "WON",
  Lost: "LOST",
} as const;

export type ProspectStatus = (typeof ProspectStatus)[keyof typeof ProspectStatus];

export const prospectStatusOrder: ProspectStatus[] = [
  ProspectStatus.New,
  ProspectStatus.Contacted,
  ProspectStatus.AdvancedLead,
  ProspectStatus.Closing,
  ProspectStatus.HumanHandoff,
  ProspectStatus.Won,
  ProspectStatus.Lost,
];

export const prospectStatusLabels: Record<ProspectStatus, string> = {
  [ProspectStatus.New]: "Nuevo",
  [ProspectStatus.Contacted]: "Contactado",
  [ProspectStatus.AdvancedLead]: "Lead avanzado",
  [ProspectStatus.Closing]: "Cerrando",
  [ProspectStatus.HumanHandoff]: "Derivado a Fran",
  [ProspectStatus.Won]: "Ganado",
  [ProspectStatus.Lost]: "Perdido",
};

export const prospectStatusBadgeClass: Record<ProspectStatus, string> = {
  [ProspectStatus.New]: "bg-stone-200 text-stone-800",
  [ProspectStatus.Contacted]: "bg-blue-100 text-blue-800",
  [ProspectStatus.AdvancedLead]: "bg-violet-100 text-violet-800",
  [ProspectStatus.Closing]: "bg-amber-100 text-amber-800",
  [ProspectStatus.HumanHandoff]: "bg-orange-100 text-orange-800",
  [ProspectStatus.Won]: "bg-green-100 text-green-800",
  [ProspectStatus.Lost]: "bg-red-100 text-red-800",
};

export const ProspectCategory = {
  LawFirm: "LAW_FIRM",
  AccountingFirm: "ACCOUNTING_FIRM",
  Mixed: "MIXED",
  BarbershopSalon: "BARBERIA_PELUQUERIA",
  CarRepair: "TALLER_MECANICO",
  Veterinary: "VETERINARIA",
  HealthStore: "DIETETICA",
  Optics: "OPTICA",
  RealEstate: "INMOBILIARIA",
  Locksmith: "CERRAJERIA",
  Architecture: "ARQUITECTURA",
  Other: "OTHER",
} as const;

export type ProspectCategory = (typeof ProspectCategory)[keyof typeof ProspectCategory];

export const prospectCategoryLabels: Record<ProspectCategory, string> = {
  [ProspectCategory.LawFirm]: "Estudio jurídico",
  [ProspectCategory.AccountingFirm]: "Estudio contable",
  [ProspectCategory.Mixed]: "Jurídico y contable",
  [ProspectCategory.BarbershopSalon]: "Barbería / peluquería",
  [ProspectCategory.CarRepair]: "Taller mecánico",
  [ProspectCategory.Veterinary]: "Veterinaria",
  [ProspectCategory.HealthStore]: "Dietética",
  [ProspectCategory.Optics]: "Óptica",
  [ProspectCategory.RealEstate]: "Inmobiliaria",
  [ProspectCategory.Locksmith]: "Cerrajería",
  [ProspectCategory.Architecture]: "Estudio de arquitectura",
  [ProspectCategory.Other]: "Otro",
};

export const WebsiteStatus = {
  NoWebsite: "NO_WEBSITE",
  WeakWebsite: "WEAK_WEBSITE",
  HasWebsite: "HAS_WEBSITE",
  Unknown: "UNKNOWN",
} as const;

export type WebsiteStatus = (typeof WebsiteStatus)[keyof typeof WebsiteStatus];

export const websiteStatusLabels: Record<WebsiteStatus, string> = {
  [WebsiteStatus.NoWebsite]: "Sin web enlazada",
  [WebsiteStatus.WeakWebsite]: "Web débil",
  [WebsiteStatus.HasWebsite]: "Tiene web",
  [WebsiteStatus.Unknown]: "Sin verificar",
};

export const EmailDirection = {
  Outbound: "OUTBOUND",
  Inbound: "INBOUND",
} as const;

export type EmailDirection = (typeof EmailDirection)[keyof typeof EmailDirection];

export const emailDirectionLabels: Record<EmailDirection, string> = {
  [EmailDirection.Outbound]: "Enviado",
  [EmailDirection.Inbound]: "Recibido",
};

export const ActivityType = {
  Created: "CREATED",
  StatusChange: "STATUS_CHANGE",
  Note: "NOTE",
  EmailLogged: "EMAIL_LOGGED",
  DemoPageSet: "DEMO_PAGE_SET",
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

export const activityTypeLabels: Record<ActivityType, string> = {
  [ActivityType.Created]: "Alta",
  [ActivityType.StatusChange]: "Cambio de estado",
  [ActivityType.Note]: "Nota",
  [ActivityType.EmailLogged]: "Mail registrado",
  [ActivityType.DemoPageSet]: "Página de muestra",
};
