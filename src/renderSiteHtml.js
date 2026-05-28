function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeScriptJson(value) {
  return JSON.stringify(value).replaceAll("</script", "<\\/script");
}

export function renderSiteHtml({
  title = "Weblith Site",
  description = "",
  faviconUrl = "",
  socialImageUrl = "",
  themeColor = "#ffffff",
  html = "",
  css = "",
  headCode = "",
  bodyStartCode = "",
  bodyEndCode = "",
  customCode = "",
  subdomain = "",
}) {
  const safeTitle = escapeHtml(title || "Weblith Site");
  const safeDescription = escapeHtml(description || "");
  const safeThemeColor = escapeHtml(themeColor || "#ffffff");

  const sitePayload = {
    platform: "weblith.dev",
    appVariant: "weblith-runtime",
    subdomain,
    published: true,
    html,
    css,
    customCode,
  };

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
      window.WEBLITH_BUILD_VERSION = "1.0.0";
      window.weblithHtmlLoadedAt = performance.now();

      window.WEBLITH_SITE_PAYLOAD = ${escapeScriptJson(sitePayload)};

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
  </head>

  <body>
    ${bodyStartCode || ""}

    <script>
      var entrypointChunk = "weblith-inline-runtime";
    </script>

    <div id="root" style="height: 100%"></div>

    <div
      id="translationToolDetectionId"
      style="position: absolute; left: -9999px; top: -9999px; visibility: hidden; z-index: -100"
    >
      This is invisible text to detect translation tools.
    </div>

    <script>
      function weblithRunCustomScripts(container) {
        var scripts = container.querySelectorAll("script");

        scripts.forEach(function (oldScript) {
          var newScript = document.createElement("script");

          Array.from(oldScript.attributes).forEach(function (attr) {
            newScript.setAttribute(attr.name, attr.value);
          });

          newScript.text = oldScript.textContent;
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });
      }

      function weblithRenderSite() {
        var payload = window.WEBLITH_SITE_PAYLOAD || {};
        var root = document.getElementById("root");

        if (!root) return;

        var style = document.createElement("style");
        style.id = "weblith-site-css";
        style.innerHTML = payload.css || "";
        document.head.appendChild(style);

        root.innerHTML = payload.html || "";

        if (payload.customCode) {
          var customWrapper = document.createElement("div");
          customWrapper.id = "weblith-custom-code";
          customWrapper.innerHTML = payload.customCode;
          document.body.appendChild(customWrapper);
          weblithRunCustomScripts(customWrapper);
        }

        weblithRunCustomScripts(root);

        window.weblithRuntimeLoadedAt = performance.now();
      }

      function errorHandler() {
        var retryCount;
        var storedRetryCount = localStorage.getItem("weblith-entrypoint-retry-count");

        if (storedRetryCount !== null) {
          retryCount = parseInt(storedRetryCount);
        } else {
          retryCount = 0;
        }

        if (retryCount < 5) {
          localStorage.setItem("weblith-entrypoint-retry-count", retryCount + 1);
          window.location.reload();
        }
      }

      try {
        weblithRenderSite();
      } catch (error) {
        console.error("Weblith runtime failed:", error);
        errorHandler();
      }
    </script>

    ${bodyEndCode || ""}
  </body>
</html>`;
}