// src/context/ProblemProvider.js
import React, { createContext, useContext, useEffect, useState } from "react";

// 🌱 Create the context
const ProblemContext = createContext();

// 🎣 Custom hook to use this context
export const useProblems = () => useContext(ProblemContext);

// 🔤 Hex decoder helper function
const decodeHex = (hexString) => {
  if (!hexString || typeof hexString !== "string") return "";
  try {
    return decodeURIComponent(
      hexString
        .replace(/\s+/g, "")
        .match(/.{1,2}/g)
        .map((byte) => `%${byte}`)
        .join("")
    );
  } catch (err) {
    console.error("❌ Failed to decode hex:", err);
    return hexString;
  }
};

// 🌍 Provider component
export const ProblemProvider = ({ children }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedMcqId, setSelectedMcqId] = useState(null);

  const [currentMcq, setCurrentMcq] = useState(null);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqError, setMcqError] = useState("");

  // 🧠 Subject map to match backend format
  const convertSubjectToApiFormat = (subject) => {
    const subjectMap = {
      "C Programming": "c_programming",
      "C++ Programming": "c++_programming",
      Java: "java",
      Python: "python",
      "Pseudo Code": "pseudo_code",
    };
    return subjectMap[subject] || subject.toLowerCase().replace(/\s+/g, "_");
  };

  // 🚀 Fetch all problems
  const fetchAllProblems = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://api-e5q6islzdq-uc.a.run.app/getallproblems"
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setProblems(data.data);
        setError("");
        console.log(`✅ Fetched ${data.data.length} problems`);
      } else {
        setError("Invalid data received from API");
      }
    } catch (err) {
      console.error("❌ Error fetching problems:", err);
      setError("Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Fetch 1 MCQ by subject + id
  const fetchMcq = async (subject, mcqId) => {
    if (!subject || !mcqId) {
      console.warn("⚠️ Missing subject or MCQ ID", { subject, mcqId });
      setMcqError("Subject and MCQ ID are required");
      return;
    }

    console.log("🔁 fetchMcq called:");
    console.log("👉 Subject (param):", subject);
    console.log("👉 MCQ ID (param):", mcqId);

    try {
      setMcqLoading(true);
      setMcqError("");

      const apiSubject = convertSubjectToApiFormat(subject);
      const apiUrl = `https://api-e5q6islzdq-uc.a.run.app/getmcq?subject=${apiSubject}&id=${mcqId}`;

      console.log(`🔍 API Fetching: ${apiUrl}`);

      const res = await fetch(apiUrl);
      const data = await res.json();

      if (data.success) {
        const raw = data.data;
        const answerMap = { "1": "a", "2": "b", "3": "c", "4": "d" };

        const decodedMcq = {
          ...raw,
          question: decodeHex(raw.question),
          options: {
            a: decodeHex(raw.option1),
            b: decodeHex(raw.option2),
            c: decodeHex(raw.option3),
            d: decodeHex(raw.option4),
          },
          correct_answer: answerMap[decodeHex(raw.ans)] || decodeHex(raw.ans),
          explanation: decodeHex(raw.solution || raw.Solution || ""),
        };

        setCurrentMcq(decodedMcq);
        console.log("✅ Decoded MCQ:", decodedMcq);
      } else {
        setMcqError(data.message || "Failed to fetch MCQ");
        setCurrentMcq(null);
      }
    } catch (err) {
      console.error("❌ Error fetching MCQ:", err);
      setMcqError("Failed to fetch MCQ");
      setCurrentMcq(null);
    } finally {
      setMcqLoading(false);
    }
  };

  // 💡 Keep MCQ fetch in sync with selected subject + ID
  useEffect(() => {
    if (selectedSubject && selectedMcqId) {
      console.log("🧠 useEffect triggered:", selectedSubject, selectedMcqId);
      fetchMcq(selectedSubject, selectedMcqId);
    } else {
      setCurrentMcq(null);
      setMcqError("");
    }
  }, [selectedSubject, selectedMcqId]);

  // 🚿 Reset all on clear
  const clearMcqSelection = () => {
    setSelectedSubject(null);
    setSelectedMcqId(null);
    setCurrentMcq(null);
    setMcqError("");
  };

  // ✅ Fix: Reset selectedMcqId when subject changes
  const handleSubjectSelect = (subject) => {
    const firstMcqId = getFirstMcqId(subject); // You must define this function!
    console.log("🎯 Subject selected:", subject, "→ First ID:", firstMcqId);
    setSelectedSubject(subject);
    setSelectedMcqId(firstMcqId);
  };

  // 🛫 Initial fetch
  useEffect(() => {
    fetchAllProblems();
  }, []);

  const contextValue = {
    problems,
    loading,
    error,
    refetchProblems: fetchAllProblems,
    selectedSubject,
    setSelectedSubject: handleSubjectSelect,
    selectedMcqId,
    setSelectedMcqId,
    currentMcq,
    mcqLoading,
    mcqError,
    fetchMcq,
    clearMcqSelection,
  };

  return (
    <ProblemContext.Provider value={contextValue}>
      {children}
    </ProblemContext.Provider>
  );
};
