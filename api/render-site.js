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
  host === "weblith.dev" ||
  host === "www.weblith.dev" ||
  subdomain === "weblith" ||
  subdomain === "www"
) {
  return res.redirect(302, "https://weblith.dev/");
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
	
res.setHeader(
  "Cache-Control",
  "public, s-maxage=86400, stale-while-revalidate=300"
);
    return res.status(200).send(site.rendered_html);
  } catch (err) {
    console.error(err);

    return res.status(500).send("Server error");
  }
}