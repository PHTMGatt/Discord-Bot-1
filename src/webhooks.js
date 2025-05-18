// NOTE; this module sets up a single /github endpoint
//       and handles all incoming “push” events from GitHub

require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// NOTE; basic cleanup for commit messages
function toCamelCase(input) {
  return input
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

// NOTE; format commit message cleanly for Discord
function formatCommit(commit) {
  const sha = commit.id.slice(0, 7);
  const cleaned = toCamelCase(commit.message);
  const author = commit.author?.username || "unknown";
  return `🔨 **${author}** pushed [\`${sha}\`](${commit.url}): \`${cleaned}\``;
}

// NOTE; POST /github → triggered by GitHub webhook
app.post("/github", async (req, res) => {
  const { commits } = req.body;

  if (!commits || !commits.length) return res.sendStatus(204);

  // NOTE; format all commits
  const lines = commits.map(formatCommit).join("\n");

  // NOTE; send to Discord via WebHook URL
  try {
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: lines }),
    });
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Failed to post to Discord:", err);
    res.sendStatus(500);
  }
});

// NOTE; Render health check
app.get("/", (_, res) => res.send("✅ WebHook Bot is alive!"));

// NOTE; Start server
app.listen(3000, () => console.log("🚀 Server running on port 3000"));
