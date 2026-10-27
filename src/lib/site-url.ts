const PRODUCTION_SITE_URL = "https://www.studioshot.design";

export function getSiteOrigin(fallbackOrigin?: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    const configuredOrigin = new URL(configuredUrl).origin;
    const hostname = new URL(configuredOrigin).hostname;
    const isLocalHost =
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]";

    if (process.env.NODE_ENV !== "production" || !isLocalHost) {
      return configuredOrigin;
    }
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  if (fallbackOrigin) {
    return new URL(fallbackOrigin).origin;
  }

  throw new Error("Set NEXT_PUBLIC_SITE_URL to configure the application URL.");
}
