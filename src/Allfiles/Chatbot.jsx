import React, { useState } from "react";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5050/deepseek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await res.json();
      const botMessage = {
        role: "assistant",
        content: data.reply || "🤖 Something went wrong!",
      };

      setMessages([...updatedMessages, botMessage]);
    } catch (err) {
      console.error("Error talking to DeepSeek:", err);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "⚠️ Failed to get response from DeepSeek API.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#1e1e1e] text-gray-800 dark:text-white flex flex-col items-center p-4">
      <div className="w-full max-w-3xl p-4 rounded-xl shadow-lg bg-white dark:bg-gray-900 flex flex-col h-[85vh]">
        <h1 className="text-2xl font-bold mb-4 text-center">🤖 DeepSeek Chatbot</h1>

        <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg w-fit max-w-[75%] ${
                msg.role === "user"
                  ? "ml-auto bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="animate-pulse bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg p-3 w-32">
              Thinking...
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
