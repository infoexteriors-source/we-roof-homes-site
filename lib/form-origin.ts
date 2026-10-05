import { siteUrl } from "./content";

const localHosts = new Set(["localhost", "127.0.0.1", "[::1]", "0.0.0.0", "[::]"]);

/** Do not trust forwarded-host headers or allow wildcard preview domains. */
export function isAllowedFormOrigin(request: Request): boolean {
  const raw = request.headers.get("origin");
  if (!raw || raw === "null") return false;
  try {
    const origin = new URL(raw);
    if (origin.origin !== raw || !["http:", "https:"].includes(origin.protocol)) return false;
    const destination = new URL(request.url);
    const allowed = [new URL(siteUrl).origin, destination.origin];
    for (const entry of (process.env.FORM_ALLOWED_ORIGINS || "").split(",")) {
      const value = entry.trim();
      if (!value) continue;
      try {
        const configured = new URL(value);
        if (configured.origin === value && ["http:", "https:"].includes(configured.protocol)) allowed.push(value);
      } catch { /* Ignore invalid configuration, never broaden access. */ }
    }
    if (allowed.includes(origin.origin)) return true;
    // Next dev can construct request.url from its bind address (0.0.0.0),
    // while the browser reaches that same listener through a loopback alias.
    return process.env.NODE_ENV !== "production"
      && localHosts.has(destination.hostname) && localHosts.has(origin.hostname)
      && origin.protocol === destination.protocol && origin.port === destination.port;
  } catch { return false; }
}
