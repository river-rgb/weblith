export default function middleware(request) {
  const url = new URL(request.url);
  const host = request.headers.get("host") || "";

  const isRootDomain = host === "weblith.dev" || host === "www.weblith.dev";
  const isWeblithSubdomain =
    host.endsWith(".weblith.dev") && !isRootDomain;

  const isAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/api/") ||
    url.pathname === "/favicon.svg" ||
    url.pathname === "/favicon.ico";

  if (isWeblithSubdomain && !isAsset) {
    url.pathname = "/api/render-site";
return fetch(url, request);
  }
}