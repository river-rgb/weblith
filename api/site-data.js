import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://roasngxauulhntzlbnwl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYXNuZ3hhdXVsaG50emxibndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTM0NTYsImV4cCI6MjA5NTUyOTQ1Nn0.VY5wHA53W-FONKxm_WtHzchNHcx1mNDa_aeZi3ElYEc"
);

export default async function handler(req, res) {
  try {
    const host = req.headers.host || "";

    const subdomain = host
      .replace(".centersmiths.com", "")
      .replace("www.", "")
      .split(":")[0]
      .trim();

    if (!subdomain || subdomain === "centersmiths" || subdomain === "www") {
      return res.status(404).json({
        error: "Not a public site",
      });
    }

    const { data: site, error } = await supabase
      .from("websites")
      .select("html, css, js, published, subdomain")
      .eq("subdomain", subdomain)
      .eq("published", true)
      .single();

    if (error || !site) {
      return res.status(404).json({
        error: "Site not found",
      });
    }

    return res.status(200).json({
      subdomain: site.subdomain,
      html: site.html || "",
      css: site.css || "",
      customCode: site.js || "",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error",
    });
  }
}