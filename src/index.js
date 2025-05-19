// NOTE; load environment variables (DISCORD_WEBHOOK_URL, OPENAI_API_KEY)
require("dotenv").config();

// NOTE; core modules
const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const app = express();

// NOTE; helper modules
const { registerRepo, getWebhookForRepo, loadWebhooks } = require("./webhooks");
const { formatCommits } = require("./format");

// NOTE; parse JSON + URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NOTE; static frontend
app.use(express.static(path.join(__dirname, "..", "public")));

// NOTE; load saved webhooks into memory
loadWebhooks();

// NOTE; GET /register → show HTML form
app.get("/register", (_, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "register.html"));
});

// NOTE; POST /register → store repo + Discord webhook mapping
app.post("/register", (req, res) => {
  const { username, reponame, webhook } = req.body;
  const repo = `${username}/${reponame}`;
  try {
    registerRepo(repo, webhook);
    res.status(200).send(`<p>✅ Registered ${repo}! You may now push to GitHub.</p>`);
  } catch (err) {
    res.status(400).send(`<p>❌ Error: ${err.message}</p>`);
  }
});

// NOTE; GitHub Webhook handler
app.post("/github", async (req, res) => {
  const payload = req.body;
  const repoName = payload?.repository?.full_name;
  const commits = payload?.commits;

  if (!repoName || !commits?.length) return res.sendStatus(204);

  const webhook = getWebhookForRepo(repoName);
  if (!webhook) return res.status(404).send("No webhook registered for this repo");

  try {
    const message = await formatCommits(commits);
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Failed to send to Discord:", err);
    res.sendStatus(500);
  }
});

// NOTE; Health check route
app.get("/", (_, res) => res.send("✅ WebHook Bot is alive!"));

// NOTE; keep Render awake by pinging itself every 14 minutes
setInterval(() => {
  fetch("https://discord-webhook-bot-1f23.onrender.com")
    .then(() => console.log("⏰ Self-ping sent to keep Render awake"))
    .catch(err => console.error("⚠️ Self-ping failed:", err.message));
}, 14 * 60 * 1000); // 14 minutes

// NOTE; Start server
app.listen(3000, () => console.log("🚀 Server running on port 3000"));
