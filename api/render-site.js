import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const host = req.headers.host || "";

    const subdomain = host
      .replace(".weblith.dev", "")
      .replace("www.", "")
      .split(":")[0]
      .trim();

    if (
      !subdomain ||
      subdomain === "weblith" ||
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