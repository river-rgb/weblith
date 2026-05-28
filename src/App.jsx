import { useEffect, useState } from "react";
import SiteBuilder from "./SiteBuilder";
import { supabase } from "./supabaseClient";
import "./App.css";

const ROOT_DOMAIN = "weblith.dev";

function getSubdomain() {
  const host = window.location.hostname;

  if (host === "localhost" || host === "127.0.0.1") {
    return null;
  }

  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) {
    return null;
  }

  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    return host.replace(`.${ROOT_DOMAIN}`, "");
  }

  return null;
}

function PublicSite({ subdomain }) {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSite() {
      const { data, error } = await supabase
        .from("websites")
        .select("*")
        .eq("subdomain", subdomain)
        .eq("published", true)
        .single();

      if (error) {
        console.error(error);
      }

      setSite(data);
      setLoading(false);
    }

    loadSite();
  }, [subdomain]);

  useEffect(() => {
    if (!site?.js) return;

    const temp = document.createElement("div");
    temp.innerHTML = site.js;

    const scripts = temp.querySelectorAll("script");

    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");

      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      newScript.textContent = oldScript.textContent;

      document.body.appendChild(newScript);
    });
  }, [site]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!site) {
    return <div>Site not found or not published.</div>;
  }

  return (
    <>
      <style>{site.css}</style>

      <div
        dangerouslySetInnerHTML={{
          __html: `
${site.html}

${site.js || ""}
`,
        }}
      />
    </>
  );
}

function LoginPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorText("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setErrorText(error.message);
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Website Builder Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorText && <p className="login-error">{errorText}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function Dashboard({ user, onOpenWebsite }) {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWebsites = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("websites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      setWebsites(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadWebsites();
  }, []);

  const createWebsite = async () => {
    const name = prompt("Website name?");
    if (!name) return;

    const { data, error } = await supabase
      .from("websites")
      .insert([
        {
          user_id: user.id,
          name,
          html: "",
          css: "",
          js: "",
          project_data: null,
          subdomain: "",
          published: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    onOpenWebsite(data);
  };

  const deleteWebsite = async (websiteId) => {
    const confirmDelete = confirm("Delete this website?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("websites")
      .delete()
      .eq("id", websiteId);

    if (error) {
      alert(error.message);
      return;
    }

    loadWebsites();
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>My Websites</h1>
          <p>{user.email}</p>
        </div>

        <div>
          <button onClick={createWebsite}>Create Website</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {loading ? (
        <p>Loading websites...</p>
      ) : websites.length === 0 ? (
        <div className="empty-dashboard">
          <h2>No websites yet</h2>
          <button onClick={createWebsite}>Create Your First Website</button>
        </div>
      ) : (
        <div className="website-grid">
          {websites.map((site) => (
            <div className="website-card" key={site.id}>
              <h2>{site.name}</h2>
              <p>
                {site.subdomain
                  ? `${site.subdomain}.${ROOT_DOMAIN}`
                  : "Not published"}
              </p>

              <div className="website-card-actions">
                <button onClick={() => onOpenWebsite(site)}>Open Builder</button>
                <button onClick={() => deleteWebsite(site.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const subdomain = getSubdomain();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeWebsite, setActiveWebsite] = useState(null);

  if (subdomain) {
    return <PublicSite subdomain={subdomain} />;
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);

        if (!newSession) {
          setActiveWebsite(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="login-page">Loading...</div>;
  }

  if (!session) {
    return <LoginPanel />;
  }

  if (activeWebsite) {
    return (
      <SiteBuilder
        website={activeWebsite}
        onBack={() => setActiveWebsite(null)}
      />
    );
  }

  return (
    <Dashboard
      user={session.user}
      onOpenWebsite={(website) => setActiveWebsite(website)}
    />
  );
}