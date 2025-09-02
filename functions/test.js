import fetch from "node-fetch";

const API_KEY = "sk-2cd642210ef24f79bc39f4a584db9c24"; // replace with your real DeepSeek key

async function testDeepSeek() {
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat", // correct model
        messages: [
          { role: "user", content: "Hello, are you working?" }
        ]
      })
    });

    const data = await response.json(); // DeepSeek now returns proper JSON
    console.log(data);

  } catch (err) {
    console.error("Error:", err);
  }
}

testDeepSeek();
