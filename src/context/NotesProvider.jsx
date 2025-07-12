import { createContext, useContext, useState, useEffect } from "react";

const NotesContext = createContext();

export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("");
  const [units, setUnits] = useState([]);
  const [note, setNote] = useState(null);

  const BASE_URL = "https://api-e5q6islzdq-uc.a.run.app/api";

  // 🔁 Convert hex to readable string
  const hexToString = (hex) => {
    try {
      return hex
        .match(/.{1,2}/g)
        .map((byte) => String.fromCharCode(parseInt(byte, 16)))
        .join("");
    } catch (err) {
      console.error("❌ Failed to decode hex:", hex);
      return hex;
    }
  };

  // 🔄 Fetch and store all subjects
  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${BASE_URL}/subjects`);
      const data = await res.json();
      const subjectList = data.subjects || [];
      setSubjects(subjectList);
      
    } catch (err) {
      console.error("❌ Error fetching subjects:", err);
      setSubjects([]);
    }
  };

  // 📂 Fetch and store units based on selected subject
  const fetchUnits = async (selectedSubject) => {
    try {
      setSubject(selectedSubject);
      setNote(null);
      const res = await fetch(`${BASE_URL}/units?subject=${selectedSubject}`);
      const data = await res.json();
      setUnits(data.units || []);
      console.log(`📦 Units for "${selectedSubject}":`, data.units);
    } catch (err) {
      console.error("❌ Error fetching units:", err);
      setUnits([]);
    }
  };

  // 📜 Fetch and store specific note
  const fetchNote = async (unitHeading) => {
    try {
      const res = await fetch(
        `${BASE_URL}/notes?subject=${subject}&unit=${encodeURIComponent(unitHeading)}`
      );
      const data = await res.json();

      if (!data || !data.data) {
        console.warn("⚠️ No note data found:", data);
        setNote(null);
        return;
      }

      const rawNote = data.data;

      // 🧹 Strip full HTML tags and extract body content
      if (rawNote?.content?.includes("<html")) {
        const bodyMatch = rawNote.content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          rawNote.content = bodyMatch[1]; // Only the body content
        }
      }

      // 🔓 Decode hex code
      if (rawNote?.code) {
        rawNote.code = hexToString(rawNote.code);
      }

      setNote(rawNote);
      console.log("📝 Note fetched:", rawNote);
    } catch (err) {
      console.error("❌ Error fetching note:", err);
      setNote(null);
    }
  };
 
  return (  
    <NotesContext.Provider
      value={{
        subjects,
        subject,
        units,
        note,
        fetchSubjects,
        fetchUnits,
        fetchNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
