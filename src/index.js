// NOTE; keep the free Render dyno awake by responding on “/”
const express = require("express");
const app = express();

// # Load .env variables (DISCORD_TOKEN, GITHUB_WEBHOOK_SECRET, OPENAI_API_KEY)
require("dotenv").config();

// -------------------------------------------------------------------------------------
// NOTE; HTTP keep-alive endpoint — GitHub and health checks can hit this
app.get("/", (req, res) => res.send("✅ Bot is alive!"));

// NOTE; bodyParser is needed for Discord messages (not webhooks anymore)
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// -------------------------------------------------------------------------------------
// Discord.js client setup
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`);
});

// -------------------------------------------------------------------------------------
// NOTE; import & register GitHub webhook handlers (now using Express router)
const { router: webhookRouter } = require("./webhooks")(client);
app.use(webhookRouter);

// -------------------------------------------------------------------------------------
// NOTE; start Express + Discord login
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Web server listening on port ${PORT}`));
client.login(process.env.DISCORD_TOKEN);
