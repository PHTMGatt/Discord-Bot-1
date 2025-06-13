// Note; Handles registration and lookup of repo → webhook mappings

const fs = require("fs");
const path = require("path");

// Note; In-memory store
const repoToWebhook = new Map();

// Note; Disk storage file
const STORAGE_FILE = path.join(__dirname, "webhooks.json");

// Note; Register a repo and save to disk
function registerRepo(repo, webhook) {
  if (!repo || !webhook || !webhook.startsWith("http")) {
    throw new Error("Invalid repo or webhook URL");
  }

  const safeRepo = repo.toLowerCase();
  repoToWebhook.set(safeRepo, webhook);
  saveWebhooksToDisk();

  console.log(`✅ Registered: ${safeRepo} → ${webhook}`);
}

// Note; Get a webhook by repo name
function getWebhookForRepo(repo) {
  return repoToWebhook.get(repo.toLowerCase());
}

// Note; Load all saved webhooks on startup
function loadWebhooks() {
  if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify({}, null, 2));
    return;
  }

  try {
    const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
    const data = JSON.parse(raw);
    const entries = Object.entries(data);

    for (const [repo, webhook] of entries) {
      repoToWebhook.set(repo.toLowerCase(), webhook);
    }

    if (entries.length > 0) {
      console.log(`🔁 Loaded ${entries.length} webhook(s) from disk`);
    }
  } catch (err) {
    console.error("⚠️ Failed to load webhooks.json:", err.message);
  }
}

// Note; Save current repo-webhook map to disk
function saveWebhooksToDisk() {
  const data = Object.fromEntries(repoToWebhook);
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  registerRepo,
  getWebhookForRepo,
  loadWebhooks,
};
