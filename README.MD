# 🪝 Captain Hook: WebHook Bot

<p align="center">
  <img src="images/CapHook2.png" alt="Captain Hook Bot" width="200" />
</p>

<p align="center">
  A smart and lightweight GitHub → Discord bot that automatically formats push commit messages using GPT and sends them to your Discord channel via webhook — no bot login required.
</p>

---

## 💡 What It Does

Whenever someone pushes to your GitHub repository:

```
🪝 PHTMGatt pushed: Updated README and cleaned up styling
```

Captain Hook formats and posts the message in your Discord server using your webhook.

---

## ⚙️ How to Use This Bot

### 1. Create a Discord WebHook

1. Go to your Discord **channel settings**
2. Select **Integrations → Webhooks**
3. Click **New Webhook**
4. Name it and copy the **Webhook URL**

---

### 2. Register Your GitHub Repo

Visit the live form at:

```
https://discord-webhook-bot-1f23.onrender.com/register
```

There, enter:
- Your GitHub repo (e.g., `yourName/yourRepo`)
- Your Discord WebHook URL

✅ That’s it. No bot token. No deployment. Just register and push!

---

### 3. Add the GitHub WebHook

In your GitHub repo:

1. Go to **Settings → Webhooks**
2. Click **Add Webhook**
3. Use this as the **Payload URL**:
```
https://discord-webhook-bot-1f23.onrender.com/github
```
4. Set **Content Type**: `application/json`
5. Select **Just the push event**

---

## 🔧 Optional `.env` (for personal/local use)

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook
OPENAI_API_KEY=sk-...
```

---

## 🤖 Powered by GPT

This bot uses your `OPENAI_API_KEY` (if available) to clean up commit messages with ChatGPT.

If the API key is missing, it falls back to simple formatting.

---

## 📸 Demo

<p align="center">
  <img src="./images/BotUsage.webp" alt="Captain Hook Bot Demo" width="450" />
</p>

---

## 🧠 Why It’s Awesome

- 🔗 Works for any GitHub repo
- 💬 No Discord bot needed
- ⚙️ Hosted and ready to use
- 🪝 Just register your info and push

---

<p align="center">
  Built with 🧠, ⚙️, and GPT by <strong>BryGuy</strong>
</p>
