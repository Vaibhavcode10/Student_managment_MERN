import { createContext, useContext, useState } from "react";

const NotesContext = createContext();

export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("");
  const [units, setUnits] = useState([]);
  const [note, setNote] = useState(null);

  const BASE_URL = "https://api-e5q6islzdq-uc.a.run.app/api";

  // 🧠 Convert hex to readable string
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

  // ✂️ Clean up heading by removing unit number from heading text
  const cleanHeading = (unit, heading) => {
    if (!unit || !heading) return heading || "Untitled";
    
    const unitStr = unit.toString();
    const headingLower = heading.toLowerCase();
    const unitLower = unitStr.toLowerCase();
    
    // Check if heading starts with unit number or zero-padded version
    const startsWithUnit = headingLower.startsWith(unitLower) || 
                         headingLower.startsWith('0' + unitLower);
    
    if (startsWithUnit) {
      // Find where the unit number ends and remove it along with following separators
      let cleanHeading = heading;
      if (headingLower.startsWith(unitLower)) {
        cleanHeading = heading.substring(unitStr.length);
      } else if (headingLower.startsWith('0' + unitLower)) {
        cleanHeading = heading.substring(unitStr.length + 1);
      }
      
      // Remove leading separators (space, colon, dot, dash)
      return cleanHeading.replace(/^[\s:.\-]+/, '').trim();
    }
    
    return heading;
  };

  // 📚 Fetch subject list
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

  // 🧩 Fetch units for a subject
  const fetchUnits = async (selectedSubject) => {
    try {
      setSubject(selectedSubject);
      setNote(null);
      setUnits([]); // 🧼 Clear previous units instantly

      const res = await fetch(`${BASE_URL}/units?subject=${selectedSubject}`);
      const data = await res.json();

      const sorted = (data.units || []).sort((a, b) => {
        const aUnit = parseFloat(a.unit);
        const bUnit = parseFloat(b.unit);
        return aUnit - bUnit;
      });

      // ✂️ Clean up headings for all units
      const cleanedUnits = sorted.map(unit => ({
        ...unit,
        displayHeading: cleanHeading(unit.unit, unit.heading)
      }));

      setUnits(cleanedUnits);
      console.log(`📦 Units for "${selectedSubject}":`, cleanedUnits);
    } catch (err) {
      console.error("❌ Error fetching units:", err);
      setUnits([]);
    }
  };

  // 📄 Fetch note data
  const fetchNote = async (unitHeading) => {
    try {
      const res = await fetch(
        `${BASE_URL}/notes?subject=${subject}&unit=${encodeURIComponent(unitHeading)}`
      );
      const data = await res.json();

      if (!data?.data) {
        console.warn("⚠️ No note data found:", data);
        setNote(null);
        return;
      }

      const rawNote = data.data;

      // ✂️ Extract only body content if full HTML exists
      if (rawNote?.content?.includes("<html")) {
        const bodyMatch = rawNote.content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) rawNote.content = bodyMatch[1];
      }

      // 🔓 Decode hexadecimal code block
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
  // ✏️ Update note data (PATCH)
  const updateNote = async (unitId, updatedFields) => {
    try {
      const res = await fetch(`https://api-e5q6islzdq-uc.a.run.app/notes/${subject}/${encodeURIComponent(unitId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error || "Failed to update note");
      }
  
      console.log("✅ Note updated successfully:", data);
      return { success: true, message: data.message || "Note updated" };
    } catch (err) {
      console.error("❌ Error updating note:", err.message);
      return { success: false, error: err.message };
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
        updateNote
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};