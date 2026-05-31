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

    if (
      !subdomain ||
      subdomain === "centersmiths" ||
      subdomain === "www"
    ) {
      return res.status(404).send("Not a public site");
    }

    const { data: site, error } = await supabase
      .from("websites")
      .select("rendered_html, published")
      .eq("subdomain", subdomain)
      .eq("published", true)
      .single();

    if (error || !site) {
      return res.status(404).send("Site not found");
    }

    if (!site.rendered_html) {
      return res
        .status(500)
        .send("Site has no rendered HTML");
    }

    res.setHeader("Content-Type", "text/html");

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res.status(200).send(site.rendered_html);
  } catch (error) {
    console.error(error);

    return res.status(500).send("Server error");
  }
}