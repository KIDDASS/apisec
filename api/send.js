export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  const { title, message, image } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: "Title and message required" });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK; // secret stays hidden

  const payload = {
    content: `**📢 ${title}**\n${message}`,
    embeds: image ? [{ image: { url: image } }] : []
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    return res.status(500).json({ error: "Failed to send announcement" });
  }

  res.status(200).json({ success: true });
}
