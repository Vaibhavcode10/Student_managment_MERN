import React, { createContext, useContext, useState, useEffect } from "react";

const Aicontext = createContext();

export function useAi() {
  const context = useContext(Aicontext);
  if (!context) {
    throw new Error('useAi must be used within an Airesposnseprovider');
  }
  return context;
}

export function Airesposnseprovider({ children }) {
  const [subject, setSubject] = useState("");
  const [units, setUnits] = useState([]);
  const [note, setNote] = useState(null);
  const [generatedContent, setGeneratedContent] = useState("");
 const[craetepdf,setCreatepdf]=useState(false);
 console.log(craetepdf);
  // Mock fetch functions (replace with actual API calls if needed)
  const fetchSubjects = () => {
    // Placeholder: Replace with actual API call to fetch subjects
    setSubject("adv-python"); // Example
  };

  const fetchUnits = (selectedSubject) => {
    // Placeholder: Replace with actual API call to fetch units
    setUnits([
      { docId: "u1", unit: "1", heading: "Pandas Basics" },
      { docId: "u2", unit: "2", heading: "Data Manipulation" },
    ]);
  };

  const fetchNote = (unitObj) => {
    // Placeholder: Replace with actual API call to fetch note
    setNote(`Note for ${unitObj.heading}: Detailed content here.`);
  };

  // API function to generate questions/notes
  const generateTheoryContent = async (subject, note, prompt = "") => {
    try {
      console.log("Generating content with:");
      const response = await fetch("https://api-e5q6islzdq-uc.a.run.app/api/generate-que", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, note, prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const markdownContent = await response.text();
      setGeneratedContent(markdownContent);
    } catch (error) {
      console.error("Error generating content:", error);
      setGeneratedContent("Error generating content.");
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const value = {
    subject,
    subjects: ["adv-python"], // Example subjects array
    units,
    note,
    fetchSubjects,
    fetchUnits,
    fetchNote,
    generateTheoryContent,
    generatedContent,
    setCreatepdf
  };

  return <Aicontext.Provider value={value}>{children}</Aicontext.Provider>;
}