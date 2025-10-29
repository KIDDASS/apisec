export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK;

  // Check if it's the old format (title/message) or new format (content/embeds)
  if (req.body.content || req.body.embeds) {
    // Direct Discord webhook format - just forward it
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to send" });
    }
    return res.status(200).json({ success: true });
  }

  // Old format support
  const { title, message, image } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: "Title and message required" });
  }

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
