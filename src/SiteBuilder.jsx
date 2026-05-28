import { useEffect, useRef, useState } from "react";
import grapesjs from "grapesjs";
import presetWebpage from "grapesjs-preset-webpage";
import { supabase } from "./supabaseClient";
import "grapesjs/dist/css/grapes.min.css";

export default function SiteBuilder({ website, onBack }) {
  const editorRef = useRef(null);

  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [customCode, setCustomCode] = useState(website?.js || "");
  const [subdomain, setSubdomain] = useState(website?.subdomain || "");
  const [published, setPublished] = useState(website?.published || false);

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
    editor.setDevice(device);
  };

  const getFinalHtml = () => {
    const editor = editorRef.current;

    return `
${editor.getHtml()}

${customCode}
`;
  };

  const openCodeEditor = () => {
    setCustomCode(website?.js || customCode || "");
    setShowCodeEditor(true);
  };

  const applyCodeChanges = () => {
    setShowCodeEditor(false);
  };

  const handlePreview = () => {
    const editor = editorRef.current;
    const previewWindow = window.open("", "_blank");

    previewWindow.document.open();
    previewWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Preview</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    const previewWindow = window.open("", "_blank", "width=390,height=844");

    previewWindow.document.open();
    previewWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Mobile Preview</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        subdomain,
        published,
      })
      .eq("id", website.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Supabase save error:", error);
      alert(error.message);
      return;
    }

    alert("Website saved!");
  };

  const handlePublish = async () => {
    if (!subdomain) {
      alert("Please enter a subdomain first");
      return;
    }

    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");

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

    const editor = editorRef.current;

    const { error } = await supabase
      .from("websites")
      .update({
        html: editor.getHtml(),
        css: editor.getCss(),
        js: customCode,
        project_data: editor.getProjectData(),
        subdomain: cleanSubdomain,
        published: true,
      })
      .eq("id", website.id);

    if (error) {
      alert(error.message);
      return;
    }

    setSubdomain(cleanSubdomain);
    setPublished(true);

    alert(`Website published!\n\n${cleanSubdomain}.yourdomain.com`);
  };

  return (
    <>
      <div className="save-bar">
        <button onClick={onBack}>Back</button>

        <button onClick={() => setDevice("Desktop")}>Desktop</button>

        <button onClick={() => setDevice("Mobile")}>Mobile</button>

        <button onClick={handleMobilePreview}>Preview Mobile</button>

        <button onClick={handleSave}>Save Website</button>

        <button onClick={openCodeEditor}>Edit Code</button>

        <button onClick={handlePreview}>Preview</button>

        <button onClick={handlePublish}>
          {published ? "Update Published Site" : "Publish Website"}
        </button>

        <input
          className="subdomain-input"
          placeholder="subdomain"
          value={subdomain}
          onChange={(e) => setSubdomain(e.target.value)}
        />

        <span className="domain-preview">.yourdomain.com</span>

        <span className="active-site-name">{website?.name}</span>
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
            <h2>Custom Code Injection</h2>

            <div>
              <button onClick={applyCodeChanges}>Apply Changes</button>
              <button onClick={() => setShowCodeEditor(false)}>Close</button>
            </div>
          </div>

          <div className="code-editor-panel full-code-panel">
            <h3>Paste Popup / Tracking / Embed Code Here</h3>

            <textarea
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="Paste full custom code here. You can include <style>, HTML, and <script>."
            />
          </div>
        </div>
      )}
    </>
  );
}