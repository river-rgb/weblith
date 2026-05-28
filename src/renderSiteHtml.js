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
  const safeTitle = title || "Weblith Site";
  const safeDescription = description || "";
  const safeThemeColor = themeColor || "#ffffff";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="referrer" content="origin" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="${safeThemeColor}" />

    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />

    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    ${socialImageUrl ? `<meta property="og:image" content="${socialImageUrl}" />` : ""}
    ${faviconUrl ? `<link rel="icon" href="${faviconUrl}" />` : ""}

    <script>
      window.WEBLITH_SITE = {
        platform: "weblith.dev",
        subdomain: "${subdomain}",
        published: true
      };
      window.weblithHtmlLoadedAt = performance.now();
    </script>

    <style id="weblith-site-css">
${css}
    </style>

    ${headCode || ""}
  </head>

  <body>
    ${bodyStartCode || ""}

    <main id="weblith-site">
${html}
    </main>

    ${customCode || ""}

    ${bodyEndCode || ""}
  </body>
</html>`;
}