// Retailers the app knows how to read. The backend is the authority on this
// list; the frontend copy exists so users get instant feedback on a bad URL.

export interface RetailerInfo {
  id: string;
  name: string;
  /** Registrable domains; subdomains (e.g. www.) are accepted too. */
  domains: string[];
}

export const SUPPORTED_RETAILERS: RetailerInfo[] = [
  { id: "abercrombie", name: "Abercrombie & Fitch", domains: ["abercrombie.com"] },
];

export type ParsedProductUrl =
  | { ok: true; url: URL; retailer: RetailerInfo }
  | { ok: false; reason: "invalid_url" | "unsupported_retailer" };

export function parseProductUrl(raw: string): ParsedProductUrl {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: "invalid_url" };
  }

  const host = url.hostname.toLowerCase();
  const retailer = SUPPORTED_RETAILERS.find((r) =>
    r.domains.some((domain) => host === domain || host.endsWith(`.${domain}`)),
  );
  if (!retailer) return { ok: false, reason: "unsupported_retailer" };

  return { ok: true, url, retailer };
}
