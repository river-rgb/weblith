export default function middleware(request) {
  const url = new URL(request.url);
  const host = request.headers.get("host") || "";

  const isRootDomain =
    host === "centersmiths.com" ||
    host === "www.centersmiths.com";

  const isPublicSubdomain =
    host.endsWith(".centersmiths.com") && !isRootDomain;

  const isAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/api/") ||
    url.pathname === "/weblith-runtime.js" ||
    url.pathname === "/favicon.svg" ||
    url.pathname === "/favicon.ico";

  if (isPublicSubdomain && !isAsset) {
    url.pathname = "/api/render-site";
    return fetch(url, request);
  }
}