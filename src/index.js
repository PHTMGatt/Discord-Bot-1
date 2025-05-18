// NOTE; load environment variables (DISCORD_WEBHOOK_URL)
require("dotenv").config();

// NOTE; use Express to listen for GitHub webhooks
const express = require("express");
const app = express();

// NOTE; use fetch to send messages directly to Discord WebHook
const fetch = require("node-fetch");

// NOTE; auto-parse incoming GitHub JSON payloads
app.use(express.json());

// NOTE; handle GitHub “push” events at /github
app.post("/github", async (req, res) => {
  const payload = req.body;

  if (!payload?.commits) return res.sendStatus(204); // NOTE; no commits, no post

  // NOTE; format each commit line for Discord (hook-style)
  const lines = payload.commits.map((c) => {
    const msg = c.message.replace(/\n/g, " ").trim();
    const author = c.author?.username || "unknown";
    return `🪝 ${author} pushed: ${msg}`;
  });

  // NOTE; validate WebHook URL
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook || !webhook.startsWith("http")) {
    console.error("❌ Invalid or missing DISCORD_WEBHOOK_URL");
    return res.sendStatus(500);
  }

  // NOTE; POST formatted message directly to Discord via WebHook URL
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: lines.join("\n") }),
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Failed to send to Discord:", err);
    res.sendStatus(500);
  }
});

// NOTE; simple health check route for Render
app.get("/", (_, res) => res.send("✅ WebHook Bot is alive!"));

// NOTE; start server on port 3000 (Render default)
app.listen(3000, () => console.log("🚀 Server listening on port 3000"));
