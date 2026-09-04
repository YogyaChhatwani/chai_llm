/**
 * CLIENT_URL may be a single origin or a comma-separated list.
 * Vercel preview deployments change hostnames often, so https://*.vercel.app
 * is included when any vercel.app origin is configured.
 */
export function getClientOrigins(): string[] {
  const raw = process.env.CLIENT_URL || "http://localhost:3000";
  const origins = raw
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  const unique = [...new Set(origins)];

  if (unique.some((origin) => origin.includes("vercel.app"))) {
    unique.push("https://*.vercel.app");
  }

  if (!unique.includes("http://localhost:3000")) {
    unique.push("http://localhost:3000");
  }

  return unique;
}

export function isOriginAllowed(
  requestOrigin: string | undefined,
  allowed: string[],
): boolean {
  if (!requestOrigin) return false;

  return allowed.some((pattern) => {
    if (pattern.includes("*") || pattern.includes("?")) {
      // Escape regex metacharacters first, then restore wildcards.
      // e.g. https://*.vercel.app → ^https://[^.]+\.vercel\.app$
      const regex = new RegExp(
        `^${pattern
          .replace(/[.+^${}()|[\]\\]/g, "\\$&")
          .replace(/\*/g, "[^.]+")
          .replace(/\?/g, "[^.]")}$`,
      );
      return regex.test(requestOrigin);
    }
    return pattern === requestOrigin;
  });
}
