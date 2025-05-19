const fs = require("fs");
const path = require("path");

const repoToWebhook = new Map();
const STORAGE_FILE = path.join(__dirname, "webhooks.json");

function registerRepo(repo, webhook) {
  if (!repo || !webhook || !webhook.startsWith("http")) {
    throw new Error("Invalid repo or webhook URL");
  }
  repoToWebhook.set(repo, webhook);
  saveWebhooksToDisk();
  console.log(`✅ Registered: ${repo} → ${webhook}`);
}

function getWebhookForRepo(repo) {
  return repoToWebhook.get(repo);
}

function loadWebhooks() {
  if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify({}, null, 2));
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(STORAGE_FILE, "utf-8"));
    for (const [repo, webhook] of Object.entries(data)) {
      repoToWebhook.set(repo, webhook);
    }
    console.log(`🔁 Loaded ${repoToWebhook.size} webhook(s) from disk`);
  } catch (err) {
    console.error("⚠️ Failed to load webhooks.json:", err.message);
  }
}

function saveWebhooksToDisk() {
  const data = Object.fromEntries(repoToWebhook);
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  registerRepo,
  getWebhookForRepo,
  loadWebhooks,
};
