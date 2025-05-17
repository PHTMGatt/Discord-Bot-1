// NOTE; this module sets up a single /github-webhook endpoint
//       and handles all incoming “push” events from any GitHub repo
const { Webhooks } = require("@octokit/webhooks");
const { Configuration, OpenAIApi } = require("openai");

let client; // shared reference to the Discord bot client

// NOTE; Camel-case fallback for commit messages
function toCamelCase(input) {
  return input
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

// NOTE; ChatGPT cleaner — rewrites raw commit messages to be more readable
async function cleanWithChatGPT(rawMessage) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const prompt = `Rewrite this Git commit message to be short, clear, and presentable for Discord:\n\n"${rawMessage}"`;
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 60,
    });
    return response.data.choices?.[0]?.message?.content.trim() || toCamelCase(rawMessage);
  } catch {
    return toCamelCase(rawMessage);
  }
}

// NOTE; configure GitHub webhook verifier using shared secret
const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET,
});

// NOTE; Listen for “push” events from any repo
webhooks.on("push", async ({ payload }) => {
  try {
    // NOTE; loop through each guild (server) the bot is in
    for (const guild of client.guilds.cache.values()) {
      const botMember = await guild.members.fetchMe();

      // NOTE; find all text channels with explicit SendMessages permission
      for (const channel of guild.channels.cache.values()) {
        if (!channel.isTextBased()) continue;

        const overwrite = channel.permissionOverwrites.cache.get(botMember.id);
        if (!overwrite?.allow.has("SendMessages")) continue;

        // NOTE; format each commit line, cleaning via ChatGPT
        const lines = await Promise.all(
          payload.commits.map(async (c) => {
            const sha = c.id.slice(0, 7);
            const cleaned = await cleanWithChatGPT(c.message);
            const author = c.author.username || c.author.name || "unknown";
            return `🔨 **${author}** pushed [\`${sha}\`](${c.url}): \`${cleaned}\``;
          })
        );

        // NOTE; send the batched commit messages to this channel
        await channel.send(lines.join("\n"));
      }
    }
  } catch (err) {
    console.error("❌ Error handling push event:", err);
  }
});

// NOTE; Express-compatible raw body middleware for verifying GitHub webhook
const middleware = async (req, res) => {
  try {
    await webhooks.verifyAndReceive({
      id: req.headers["x-github-delivery"],
      name: req.headers["x-github-event"],
      signature: req.headers["x-hub-signature-256"],
      payload: JSON.parse(req.body.toString()), // GitHub requires the raw body string for HMAC
    });
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    res.sendStatus(401);
  }
};

// NOTE; allows passing the Discord bot client from index.js
middleware.setClient = function (discordClient) {
  client = discordClient;
};

module.exports = middleware;

//Pushing 1