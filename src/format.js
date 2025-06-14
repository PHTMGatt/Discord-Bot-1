// Note; OpenAI client for GPT commit cleanup
const { Configuration, OpenAIApi } = require("openai");

// Note; fallback formatter if GPT fails or no API key
function cleanLocalMessage(msg) {
  return msg.replace(/\n/g, " ").trim().slice(0, 80);
}

// Note; GPT-based formatter using OPENAI_API_KEY from .env
async function cleanWithChatGPT(rawMessage) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return cleanLocalMessage(rawMessage);

  try {
    const config = new Configuration({ apiKey });
    const openai = new OpenAIApi(config);

    const prompt = `Rewrite this Git commit message to be short, clear, and Discord-ready:\n\n"${rawMessage}"`;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 60,
    });

    return response.data.choices?.[0]?.message?.content.trim() || cleanLocalMessage(rawMessage);
  } catch (err) {
    console.error("⚠️ GPT formatting failed:", err.message);
    return cleanLocalMessage(rawMessage);
  }
}

// Note; Format each commit from a GitHub push into a readable line
async function formatCommits(commits) {
  const lines = await Promise.all(
    commits.map(async (commit) => {
      const author = commit.author?.username || "unknown";
      const cleaned = await cleanWithChatGPT(commit.message);
      return `🪝 ${author} pushed: ${cleaned}`;
    })
  );
  return lines.join("\n");
}

module.exports = {
  formatCommits,
};
