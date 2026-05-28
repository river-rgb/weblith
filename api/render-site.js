import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const host = req.headers.host || "";

    const subdomain = host.split(".")[0];

    if (
      !subdomain ||
      subdomain === "www" ||
      subdomain === "weblith"
    ) {
      return res.status(404).send("Not a public site");
    }

    const { data: site, error } = await supabase
      .from("websites")
      .select("rendered_html")
      .eq("subdomain", subdomain)
      .eq("published", true)
      .maybeSingle();

    if (error || !site) {
      return res.status(404).send("Site not found");
    }

    res.setHeader("Content-Type", "text/html");

    return res.status(200).send(site.rendered_html);
  } catch (err) {
    console.error(err);

    return res.status(500).send("Server error");
  }
}