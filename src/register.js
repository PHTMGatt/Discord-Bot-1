// NOTE; in-memory storage for repo → Discord WebHook
const repoToWebhook = new Map();

// NOTE; add a new repo + webhook
function registerRepo(repo, webhook) {
  if (!repo || !webhook || !webhook.startsWith("http")) {
    throw new Error("Invalid repo or webhook URL");
  }

  repoToWebhook.set(repo, webhook);
  console.log(`✅ Registered: ${repo} → ${webhook}`);
}

// NOTE; get webhook for a repo
function getWebhookForRepo(repo) {
  return repoToWebhook.get(repo);
}

module.exports = {
  registerRepo,
  getWebhookForRepo
};
