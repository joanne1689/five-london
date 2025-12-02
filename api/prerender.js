export default async function handler(req, res) {
  const { target } = req.query;

  if (!target) {
    return res.status(400).send("Missing target URL");
  }

  try {
    const prerenderToken = process.env.PRERENDER_TOKEN;
    const apiUrl = `https://service.prerender.io/https%3A%2F%2F${encodeURIComponent(
      target.replace(/^https?:\/\//, "")
    )}`;

    const prerenderRes = await fetch(apiUrl, {
      headers: {
        "X-Prerender-Token": prerenderToken,
      },
    });

    const html = await prerenderRes.text();
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    return res.status(200).send(html);
  } catch (err) {
    console.error("Prerender error:", err);
    return res.status(500).send("Prerender failed");
  }
}
