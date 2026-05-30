function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderSiteHtml({
  title = "Weblith Site",
  description = "",
  faviconUrl = "",
  socialImageUrl = "",
  themeColor = "#ffffff",
  headCode = "",
  bodyStartCode = "",
  bodyEndCode = "",
  subdomain = "",
}) {
  const safeTitle = escapeHtml(title || "Weblith Site");
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
      window.WEBLITH_FRONTEND_FAKE_BACKEND_MODE = false;
      window.WEBLITH_APP_VARIANT = "runtime";
      window.WEBLITH_BUILD_VERSION = "1.0.2";
      window.WEBLITH_SUBDOMAIN = "${escapeHtml(subdomain)}";
      window.weblithHtmlLoadedAt = performance.now();

      window.WEBLITH_PAGE_SUSPEND_DETECTED = document.visibilityState === "hidden";

      function _weblithDetectVisibilityChange() {
        if (document.visibilityState === "hidden") {
          window.WEBLITH_PAGE_SUSPEND_DETECTED = true;
          document.removeEventListener("visibilitychange", _weblithDetectVisibilityChange);
        }
      }

      if (document.visibilityState === "visible") {
        document.addEventListener("visibilitychange", _weblithDetectVisibilityChange);
      }
    </script>

    ${headCode || ""}

    <script defer src="/weblith-runtime.js"></script>
  </head>

  <body>
    ${bodyStartCode || ""}

    <script>
      var entrypointChunk = "/weblith-runtime.js";
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