import { NextRequest, NextResponse } from "next/server";
import { requireAgentToken } from "@/lib/auth/agent";
import {
  addNote,
  changeProspectStatus,
  getPipelineSummary,
  getProspectDetail,
  listProspectRows,
} from "@/lib/services/prospect-service";
import {
  countByStatus,
  countByWebsiteStatus,
  countProspectKpis,
} from "@/lib/db/prospect-repository";
import { ProspectStatus } from "@/lib/domain/enums";
import { unauthorized } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

const PROTOCOL_VERSION = "2025-03-26";

const TOOLS = [
  {
    name: "list_prospects",
    description:
      "Lista prospectos del CRM con filtros opcionales. Devuelve id, nombre, rubro, estado, teléfono, email, rating, estado de la web y URL de la muestra.",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: Object.values(ProspectStatus),
          description: "Filtrar por estado del pipeline",
        },
        category: { type: "string", description: "Filtrar por rubro (ej. OTHER, PELUQUERIA_CANINA)" },
        websiteStatus: { type: "string", description: "Filtrar por estado de la web (ej. NO_WEBSITE)" },
        hasDemo: { type: "boolean", description: "Solo los que tienen página de muestra" },
        hasEmail: { type: "boolean", description: "Solo los que tienen email" },
        search: { type: "string", description: "Buscar por nombre" },
        limit: { type: "number", description: "Máximo de resultados (default 50, tope 300)" },
      },
    },
  },
  {
    name: "get_prospect",
    description: "Detalle completo de un prospecto: ficha, emails enviados/recibidos y actividades.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "ID del prospecto" } },
      required: ["id"],
    },
  },
  {
    name: "mark_contacted",
    description: "Marca un prospecto como CONTACTED (contactado).",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "ID del prospecto" } },
      required: ["id"],
    },
  },
  {
    name: "change_status",
    description: "Cambia el estado de un prospecto a cualquier valor del pipeline.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        status: { type: "string", enum: Object.values(ProspectStatus) },
      },
      required: ["id", "status"],
    },
  },
  {
    name: "add_note",
    description: "Agrega una nota (actividad) a un prospecto.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        note: { type: "string", description: "Texto de la nota" },
      },
      required: ["id", "note"],
    },
  },
  {
    name: "get_metrics",
    description:
      "Métricas del pipeline: totales por estado, contactables, con muestra, con email, por estado de web y actividad reciente.",
    inputSchema: { type: "object", properties: {} },
  },
];

function jsonRpcResult(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result });
}

function jsonRpcError(id: unknown, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
}

function toolResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 1) }] };
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "list_prospects": {
      const rawLimit = typeof args.limit === "number" ? args.limit : 50;
      const limit = Math.max(1, Math.min(300, Math.floor(rawLimit)));
      const rows = await listProspectRows(
        typeof args.status === "string" ? (args.status as ProspectStatus) : undefined,
        typeof args.search === "string" && args.search.trim() !== "" ? args.search.trim() : undefined,
        {
          category: typeof args.category === "string" ? args.category : undefined,
          websiteStatus: typeof args.websiteStatus === "string" ? args.websiteStatus : undefined,
          hasDemo: args.hasDemo === true ? true : undefined,
          hasEmail: args.hasEmail === true ? true : undefined,
          limit,
        }
      );
      return {
        count: rows.length,
        prospects: rows.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          status: p.status,
          phone: p.phone,
          email: p.email,
          rating: p.rating,
          reviewsCount: p.reviewsCount,
          websiteStatus: p.websiteStatus,
          demoPageUrl: p.demoPageUrl,
        })),
      };
    }
    case "get_prospect": {
      if (typeof args.id !== "string" || args.id === "") throw new Error("Falta id");
      const detail = await getProspectDetail(args.id);
      if (detail === null) throw new Error("Prospecto no encontrado");
      return detail;
    }
    case "mark_contacted": {
      if (typeof args.id !== "string" || args.id === "") throw new Error("Falta id");
      const prospect = await changeProspectStatus(args.id, ProspectStatus.Contacted);
      if (prospect === null) throw new Error("Prospecto no encontrado");
      return { id: prospect.id, status: prospect.status };
    }
    case "change_status": {
      if (typeof args.id !== "string" || args.id === "") throw new Error("Falta id");
      const status = Object.values(ProspectStatus).find((s) => s === args.status);
      if (!status) throw new Error(`Estado inválido. Valores: ${Object.values(ProspectStatus).join(", ")}`);
      const prospect = await changeProspectStatus(args.id, status);
      if (prospect === null) throw new Error("Prospecto no encontrado");
      return { id: prospect.id, status: prospect.status };
    }
    case "add_note": {
      if (typeof args.id !== "string" || args.id === "") throw new Error("Falta id");
      if (typeof args.note !== "string" || args.note.trim() === "") throw new Error("Falta note");
      const ok = await addNote(args.id, args.note.trim());
      if (!ok) throw new Error("Prospecto no encontrado");
      return { noted: true };
    }
    case "get_metrics": {
      const [pipeline, kpis, byStatus, byWebsite] = await Promise.all([
        getPipelineSummary(),
        countProspectKpis(),
        countByStatus(),
        countByWebsiteStatus(),
      ]);
      return { kpis, byStatus, byWebsite, recentActivities: pipeline.recentActivities };
    }
    default:
      throw new Error(`Tool desconocida: ${name}`);
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAgentToken(request))) return unauthorized();
  let body: { jsonrpc?: string; id?: unknown; method?: string; params?: { name?: string; arguments?: Record<string, unknown> } };
  try {
    body = await request.json();
  } catch {
    return jsonRpcError(null, -32700, "JSON inválido");
  }
  const { id, method } = body;
  switch (method) {
    case "initialize":
      return jsonRpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: "prospect-crm", version: "1.0.0" },
      });
    case "ping":
      return jsonRpcResult(id, {});
    case "notifications/initialized":
    case "notifications/cancelled":
      return new NextResponse(null, { status: 202 });
    case "tools/list":
      return jsonRpcResult(id, { tools: TOOLS });
    case "tools/call": {
      const name = body.params?.name;
      if (typeof name !== "string") return jsonRpcError(id ?? null, -32602, "Falta params.name");
      try {
        const result = await callTool(name, body.params?.arguments ?? {});
        return jsonRpcResult(id, toolResult(result));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return jsonRpcResult(id, { content: [{ type: "text", text: message }], isError: true });
      }
    }
    default:
      return jsonRpcError(id ?? null, -32601, `Método no soportado: ${String(method)}`);
  }
}
