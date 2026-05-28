import { useEffect, useRef, useState } from "react";
import grapesjs from "grapesjs";
import presetWebpage from "grapesjs-preset-webpage";
import { supabase } from "./supabaseClient";
import "grapesjs/dist/css/grapes.min.css";
import { renderSiteHtml } from "./renderSiteHtml";

export default function SiteBuilder({ website, onBack }) {
  const editorRef = useRef(null);

  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [customCode, setCustomCode] = useState(website?.js || "");
  const [subdomain, setSubdomain] = useState(website?.subdomain || "");
  const [published, setPublished] = useState(website?.published || false);
  

  const [publishedUrl, setPublishedUrl] = useState(
    website?.subdomain
      ? `https://${website.subdomain}.weblith.dev`
      : ""
  );

  useEffect(() => {
    if (editorRef.current) return;

    const editor = grapesjs.init({
      container: "#gjs",
      height: "100%",
      width: "auto",

      storageManager: false,

      plugins: [presetWebpage],

      pluginsOpts: {
        [presetWebpage]: {},
      },

      deviceManager: {
        devices: [
          {
            name: "Desktop",
            width: "",
          },
          {
            name: "Mobile",
            width: "390px",
          },
        ],
      },

      blockManager: {
        appendTo: "#blocks",
      },

      layerManager: {
        appendTo: "#layers",
      },

      styleManager: {
        appendTo: "#styles",
      },

      traitManager: {
        appendTo: "#traits",
      },
    });

editor.on("load", () => {
  const frameBody = editor.Canvas.getBody();
  const frameDoc = editor.Canvas.getDocument();

  if (frameBody) {
    frameBody.style.minHeight = "auto";
    frameBody.style.height = "auto";
    frameBody.style.paddingTop = "0px";
    frameBody.style.marginTop = "0px";
    frameBody.style.overflowY = "auto";
  }

  if (frameDoc && frameDoc.documentElement) {
    frameDoc.documentElement.style.height = "auto";
    frameDoc.documentElement.style.margin = "0";
    frameDoc.documentElement.style.padding = "0";
  }

  editor.refresh();
});
    if (website?.project_data) {
      editor.loadProjectData(website.project_data);
    } else {
      if (website?.html) {
        editor.setComponents(website.html);
      }

      if (website?.css) {
        editor.setStyle(website.css);
      }
    }

    editorRef.current = editor;
  }, [website]);

  const setDevice = (device) => {
    const editor = editorRef.current;

    if (!editor) return;

    editor.setDevice(device);
  };

  const addTextSection = () => {
    const editor = editorRef.current;

    if (!editor) return;

    const currentHtml = editor.getHtml();

    editor.setComponents(`
      ${currentHtml}

      <section style="padding:40px; background:#fff4cc; color:#111; border:2px dashed #ff9900; min-height:120px;">
        <h1 data-gjs-type="text" style="margin:0 0 12px;">
          Double-click to edit heading
        </h1>

        <p data-gjs-type="text" style="font-size:18px;">
          Double-click to edit paragraph text.
        </p>
      </section>
    `);

    setTimeout(() => {
      editor.refresh();
    }, 100);
  };

  const openCodeEditor = () => {
    setCustomCode(website?.js || customCode || "");
    setShowCodeEditor(true);
  };

  const applyCodeChanges = () => {
    setShowCodeEditor(false);
  };

  const getCleanSubdomain = () => {
    return subdomain?.toLowerCase().replace(/[^a-z0-9-]/g, "") || "";
  };

  const buildRenderedHtml = ({ cleanSubdomain }) => {
    const editor = editorRef.current;

    return renderSiteHtml({
      title: website?.title || website?.name || "Weblith Site",
      description: website?.description || "",
      faviconUrl: website?.favicon_url || "",
      socialImageUrl: website?.social_image_url || "",
      themeColor: website?.theme_color || "#ffffff",
      html: editor.getHtml(),
      css: editor.getCss(),
      customCode,
      subdomain: cleanSubdomain,
    });
  };

  const handlePreview = () => {
    const editor = editorRef.current;

    if (!editor) return;

    const previewWindow = window.open("", "_blank");

    previewWindow.document.open();

    previewWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Preview</title>

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <style>
    ${editor.getCss()}
  </style>
</head>

<body>
  ${editor.getHtml()}

  ${customCode}
</body>
</html>
`);

    previewWindow.document.close();
  };

  const handleMobilePreview = () => {
    const editor = editorRef.current;

    if (!editor) return;

    const previewWindow = window.open(
      "",
      "_blank",
      "width=390,height=844"
    );

    previewWindow.document.open();

    previewWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Mobile Preview</title>

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <style>
    ${editor.getCss()}
  </style>
</head>

<body>
  ${editor.getHtml()}

  ${customCode}
</body>
</html>
`);

    previewWindow.document.close();
  };

  const handleSave = async () => {
    const editor = editorRef.current;

    if (!editor) return;

    const cleanSubdomain = getCleanSubdomain();

    const renderedHtml = buildRenderedHtml({
      cleanSubdomain,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in");
      return;
    }

    const { error } = await supabase
      .from("websites")
      .update({
        html: editor.getHtml(),
        css: editor.getCss(),
        js: customCode,
        project_data: editor.getProjectData(),
        subdomain: cleanSubdomain,
        published,
        rendered_html: renderedHtml,
        updated_at: new Date().toISOString(),
      })
      .eq("id", website.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Supabase save error:", error);
      alert(error.message);
      return;
    }

    setSubdomain(cleanSubdomain);

    if (cleanSubdomain) {
      setPublishedUrl(
        `https://${cleanSubdomain}.weblith.dev`
      );
    }

    alert("Website saved!");
  };

  const handlePublish = async () => {
    const editor = editorRef.current;

    if (!editor) return;

    if (!subdomain) {
      alert("Please enter a subdomain first");
      return;
    }

    const cleanSubdomain = getCleanSubdomain();

    const { data: existingSite } = await supabase
      .from("websites")
      .select("id")
      .eq("subdomain", cleanSubdomain)
      .neq("id", website.id)
      .maybeSingle();

    if (existingSite) {
      alert("Subdomain already taken");
      return;
    }

    const renderedHtml = buildRenderedHtml({
      cleanSubdomain,
    });

    const { error } = await supabase
      .from("websites")
      .update({
        html: editor.getHtml(),
        css: editor.getCss(),
        js: customCode,
        project_data: editor.getProjectData(),
        subdomain: cleanSubdomain,
        published: true,
        rendered_html: renderedHtml,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", website.id);

    if (error) {
      alert(error.message);
      return;
    }

    const finalUrl = `https://${cleanSubdomain}.weblith.dev`;

    setSubdomain(cleanSubdomain);
    setPublished(true);
    setPublishedUrl(finalUrl);

    alert(`Website published!\n\n${finalUrl}`);
  };

  const copyPublishedUrl = async () => {
    if (!publishedUrl) {
      alert("Publish the site first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        publishedUrl
      );

      alert("Published URL copied!");
    } catch (error) {
      console.error("Copy failed:", error);
      alert(publishedUrl);
    }
  };

  return (
    <>
      <div className="save-bar">
        <button onClick={onBack}>
          Back
        </button>

        <button onClick={() => setDevice("Desktop")}>
          Desktop
        </button>

        <button onClick={() => setDevice("Mobile")}>
          Mobile
        </button>

        <button onClick={addTextSection}>
          Add Text
        </button>

        <button onClick={handleMobilePreview}>
          Preview Mobile
        </button>

        <button onClick={handleSave}>
          Save Website
        </button>

        <button onClick={openCodeEditor}>
          Edit Code
        </button>

        <button onClick={handlePreview}>
          Preview
        </button>

        <button onClick={handlePublish}>
          {published
            ? "Update Published Site"
            : "Publish Website"}
        </button>

        {publishedUrl && (
          <button onClick={copyPublishedUrl}>
            Copy URL
          </button>
        )}

        <input
          className="subdomain-input"
          placeholder="subdomain"
          value={subdomain}
          onChange={(e) =>
            setSubdomain(e.target.value)
          }
        />

        <span className="domain-preview">
          .weblith.dev
        </span>

        <span className="active-site-name">
          {website?.name}
        </span>
      </div>

      <div className="builder-layout">
        <div className="left-panel">
          <div id="blocks"></div>
        </div>

        <div id="gjs"></div>

        <div className="right-panel">
          <div className="panel-section">
            <h3>Layers</h3>

            <div id="layers"></div>
          </div>

          <div className="panel-section">
            <h3>Styles</h3>

            <div id="styles"></div>
          </div>

          <div className="panel-section">
            <h3>Traits</h3>

            <div id="traits"></div>
          </div>
        </div>
      </div>

      {showCodeEditor && (
        <div className="code-modal">
          <div className="code-modal-header">
            <h2>
              Custom Code Injection
            </h2>

            <div>
              <button onClick={applyCodeChanges}>
                Apply Changes
              </button>

              <button
                onClick={() =>
                  setShowCodeEditor(false)
                }
              >
                Close
              </button>
            </div>
          </div>

          <div className="code-editor-panel full-code-panel">
            <h3>
              Paste Popup / Tracking /
              Embed Code Here
            </h3>

            <textarea
              value={customCode}
              onChange={(e) =>
                setCustomCode(e.target.value)
              }
              placeholder="Paste full custom code here. You can include <style>, HTML, and <script>."
            />
          </div>
        </div>
      )}
    </>
  );
}