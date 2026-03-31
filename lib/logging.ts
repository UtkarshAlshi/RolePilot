import { randomUUID } from "crypto";
import { env } from "@/lib/env";

function monitorError(payload: Record<string, unknown>): void {
  if (!env.ERROR_MONITOR_DSN) return;

  console.error(
    JSON.stringify({
      level: "error",
      monitor: "placeholder",
      dsnConfigured: true,
      ...payload
    })
  );
}

export function getRequestId(existing?: string | null): string {
  return existing || randomUUID();
}

export function logInfo(requestId: string, message: string, meta?: Record<string, unknown>): void {
  console.info(JSON.stringify({ level: "info", requestId, message, ...meta }));
}

export function logError(requestId: string, message: string, meta?: Record<string, unknown>): void {
  const payload = { level: "error", requestId, message, ...meta };
  console.error(JSON.stringify(payload));
  monitorError(payload);
}
