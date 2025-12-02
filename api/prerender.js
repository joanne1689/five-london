export default async function handler(req, res) {
  const { target } = req.query;

  if (!target) {
    return res.status(400).send("Missing target URL");
  }

  try {
    const prerenderToken = process.env.PRERENDER_TOKEN;
    const prerenderUrl = `https://service.prerender.io/${encodeURIComponent(
      target
    )}`;

    const snapshot = await fetch(prerenderUrl, {
      headers: { "X-Prerender-Token": prerenderToken },
    });

    const html = await snapshot.text();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (err) {
    console.error("Prerender error:", err);
    return res.status(500).send("Prerender failed");
  }
}
