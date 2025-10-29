export default async function handler(req, res) {
  // Add CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK;

  if (!webhookUrl) {
    return res.status(500).json({ error: "Webhook URL not configured" });
  }

  // Check if it's Discord webhook format (content/embeds from security system)
  if (req.body.content || req.body.embeds) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Discord API error:', errorText);
        return res.status(500).json({ error: "Failed to send to Discord" });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Fetch error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Legacy format support (title/message)
  const { title, message, image } = req.body;
  
  if (!title || !message) {
    return res.status(400).json({ error: "Title and message required" });
  }

  const payload = {
    content: `**📢 ${title}**\n${message}`,
    embeds: image ? [{ image: { url: image } }] : []
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to send announcement" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
