function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderSiteHtml({
  title = "Centersmiths Site",
  description = "",
  faviconUrl = "",
  socialImageUrl = "",
  themeColor = "#ffffff",
  headCode = "",
  bodyStartCode = "",
  bodyEndCode = "",
  subdomain = "",
}) {
  const safeTitle = escapeHtml(title || "Centersmiths Site");
  const safeDescription = escapeHtml(description || "");
  const safeThemeColor = escapeHtml(themeColor || "#ffffff");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="referrer" content="origin" />
    <meta name="theme-color" content="${safeThemeColor}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />

    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    ${socialImageUrl ? `<meta property="og:image" content="${escapeHtml(socialImageUrl)}" />` : ""}
    ${faviconUrl ? `<link rel="icon" href="${escapeHtml(faviconUrl)}" />` : ""}

    <link id="pwa-manifest-placeholder" rel="manifest" href="" />

    <script>
      window.CENTERSMITHS_FRONTEND_FAKE_BACKEND_MODE = false;
      window.CENTERSMITHS_APP_VARIANT = "runtime";
      window.CENTERSMITHS_BUILD_VERSION = "1.0.2";
      window.CENTERSMITHS_SUBDOMAIN = "${escapeHtml(subdomain)}";
      window.centersmithsHtmlLoadedAt = performance.now();

      window.CENTERSMITHS_PAGE_SUSPEND_DETECTED = document.visibilityState === "hidden";

      function _centersmithsDetectVisibilityChange() {
        if (document.visibilityState === "hidden") {
          window.CENTERSMITHS_PAGE_SUSPEND_DETECTED = true;
          document.removeEventListener("visibilitychange", _centersmithsDetectVisibilityChange);
        }
      }

      if (document.visibilityState === "visible") {
        document.addEventListener("visibilitychange", _centersmithsDetectVisibilityChange);
      }
    </script>

    ${headCode || ""}

    <script defer src="/centersmiths-runtime.js"></script>
  </head>

  <body>
    ${bodyStartCode || ""}

    <script>
      var entrypointChunk = "/centersmiths-runtime.js";
    </script>

    <div id="root" style="height: 100%"></div>

    <div
      id="translationToolDetectionId"
      style="position: absolute; left: -9999px; top: -9999px; visibility: hidden; z-index: -100"
    >
      This is invisible text to detect translation tools.
    </div>

    ${bodyEndCode || ""}
  </body>
</html>`;
}