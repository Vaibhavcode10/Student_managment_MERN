// deepseek.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5050;

app.post("/api/ask", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("🔥 DeepSeek API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get response from DeepSeek" });
  }
});
app.get("/", (req, res) => {
  res.send("✅ DeepSeek API is alive, ready to answer!");
});

app.listen(PORT, () => {
  console.log(`🧠 DeepSeek API running at http://localhost:${PORT}`);
});
