import { createContext, useContext  } from "react";

const AiProvider = createContext();

export const useAi = () => useContext(AiProvider);

export const Chatbotprovider = ({ children }) => {
  
    const askAI = async (question) => {
        try {
          const response = await fetch("http://localhost:8000/api/ask-ai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ question }),
          });
      
          const data = await response.json();
          return data.answer;
        } catch (err) {
          console.error("Error asking AI:", err);
          return "Oops! AI broke 🤖💔";
        }
      };
  return (
    <Chatbotprovider.Provider
      value={{
        askAI
      }}
    >
      {children}
    </Chatbotprovider.Provider>
  );
};