function centersmithsRunCustomScripts(container) {
  const scripts = container.querySelectorAll("script");

  scripts.forEach((oldScript) => {
    const newScript = document.createElement("script");

    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value);
    });

    newScript.text = oldScript.textContent;

    oldScript.parentNode.replaceChild(
      newScript,
      oldScript
    );
  });
}

async function centersmithsRenderSite() {
  const root = document.getElementById("root");

  if (!root) return;

  try {
    const response = await fetch("/api/site-data");

    if (!response.ok) {
      root.innerHTML =
        "<h1>Failed to load site</h1>";
      return;
    }

    const payload = await response.json();

    const style = document.createElement("style");
    style.id = "centersmiths-site-css";
    style.innerHTML = payload.css || "";

    document.head.appendChild(style);

    root.innerHTML = payload.html || "";

    if (payload.customCode) {
      const customWrapper =
        document.createElement("div");

      customWrapper.id = "centersmiths-custom-code";

      customWrapper.innerHTML =
        payload.customCode;

      document.body.appendChild(
        customWrapper
      );

      centersmithsRunCustomScripts(
        customWrapper
      );
    }

    centersmithsRunCustomScripts(root);

    window.centersmithsRuntimeLoadedAt =
      performance.now();
  } catch (error) {
    console.error(
      "Weblith runtime failed:",
      error
    );
  }
}

centersmithsRenderSite();