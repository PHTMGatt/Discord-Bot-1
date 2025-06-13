// Note; Load environment variables (DISCORD_WEBHOOK_URL, OPENAI_API_KEY)
require("dotenv").config();

// Note; Core modules
const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const app = express();

// Note; Helper modules
const { registerRepo, getWebhookForRepo, loadWebhooks } = require("./webhooks");
const { formatCommits } = require("./format");

// Note; Middleware to parse form + JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

// Note; Load all webhook mappings into memory
loadWebhooks();

// Note; Show styled register form
app.get("/register", (_, res) =>
  res.sendFile(path.join(__dirname, "..", "public", "register.html"))
);

// Note; Handle new webhook registration
app.post("/register", (req, res) => {
  const { username, reponame, webhook } = req.body;
  const repo = `${username}/${reponame}`.toLowerCase();

  if (!username || !reponame || !webhook) {
    return res.status(400).send(`<p>❌ Missing required fields.</p>`);
  }

  try {
    registerRepo(repo, webhook);
    res.status(200).send(`<p>✅ Registered <strong>${repo}</strong> to webhook.</p>`);
  } catch (err) {
    res.status(400).send(`<p>❌ Error: ${err.message}</p>`);
  }
});

// Note; In-memory cooldown per repo (to prevent spam)
const cooldown = new Map(); // { repoName: timestamp }

// Note; Handle GitHub push events
app.post("/github", async (req, res) => {
  const payload = req.body;
  const repoName = payload?.repository?.full_name?.toLowerCase();
  const commits = payload?.commits;

  if (!repoName || !commits?.length) return res.sendStatus(204);

  // Note; Optional cooldown to avoid spam pushes
  const last = cooldown.get(repoName);
  const now = Date.now();
  if (last && now - last < 15000) return res.sendStatus(429); // 15s cooldown

  cooldown.set(repoName, now);

  const webhook = getWebhookForRepo(repoName);
  if (!webhook) return res.status(404).send("❌ No webhook registered for this repo");

  try {
    const message = await formatCommits(commits);
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Failed to send to Discord:", err.message);
    res.sendStatus(500);
  }
});

// Note; Bot health check
app.get("/health", (_, res) => res.send("✅ WebHook bot is healthy"));

// Note; Root ping — used for browser Render check
app.get("/", (_, res) => res.send("🌐 WebHook bot is running"));

// Note; Keep Render awake with a self-ping every 14 minutes
setInterval(() => {
  fetch("https://discord-webhook-bot-1f23.onrender.com/health")
    .then(() => console.log("🔁 Self-ping ok"))
    .catch(err => console.warn("⚠️ Self-ping failed:", err.message));
}, 14 * 60 * 1000);

// Note; Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
