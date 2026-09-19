"use client";

import { useEffect } from "react";

const sessionStorageKey = "hoptrip_anonymous_session";

function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

function sessionId(): string {
  const current = window.localStorage.getItem(sessionStorageKey);
  if (current) return current;
  const created = window.crypto.randomUUID();
  window.localStorage.setItem(sessionStorageKey, created);
  return created;
}

export function DealViewTracker({ dealSlug }: { dealSlug: string }) {
  useEffect(() => {
    void fetch(`${apiUrl().replace(/\/$/, "")}/api/v1/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "DEAL_VIEW",
        anonymous_session_id: sessionId(),
        deal_slug: dealSlug,
        source: "deal_page",
      }),
      keepalive: true,
    });
  }, [dealSlug]);

  return null;
}
