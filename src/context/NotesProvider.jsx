import { createContext, useContext, useState, useCallback, useRef } from "react";

const NotesContext = createContext();

export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("");
  const [units, setUnits] = useState([]);
  const [note, setNote] = useState(null);
  const [trydata, settrydata] = useState([]);
  
  // 🔧 Add loading states and cache to prevent duplicate calls
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  
  // Cache to prevent duplicate API calls
  const cache = useRef({
    subjects: null,
    units: new Map(), // subject -> units
    notes: new Map()  // subject+unit -> note
  });

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
    
    const startsWithUnit = headingLower.startsWith(unitLower) || 
                         headingLower.startsWith('0' + unitLower);
    
    if (startsWithUnit) {
      let cleanHeading = heading;
      if (headingLower.startsWith(unitLower)) {
        cleanHeading = heading.substring(unitStr.length);
      } else if (headingLower.startsWith('0' + unitLower)) {
        cleanHeading = heading.substring(unitStr.length + 1);
      }
      
      return cleanHeading.replace(/^[\s:.\-]+/, '').trim();
    }
    
    return heading;
  };

  // 📚 Fetch subject list with caching and duplicate prevention
  const fetchSubjects = useCallback(async () => {
    // 🔧 Prevent duplicate calls
    if (isLoadingSubjects) {
      console.log("📚 fetchSubjects already in progress, skipping...");
      return;
    }
    
    // 🔧 Return cached data if available
    if (cache.current.subjects && subjects.length > 0) {
      console.log("📚 Using cached subjects");
      return;
    }

    setIsLoadingSubjects(true);
    
    try {
      console.log("📚 Fetching subjects from API...");
      const res = await fetch(`${BASE_URL}/subjects`);
      const data = await res.json();
      const subjectList = data.subjects || [];
      
      // Cache the result
      cache.current.subjects = subjectList;
      setSubjects(subjectList);
      console.log("✅ Subjects fetched:", subjectList.length);
    } catch (err) {
      console.error("❌ Error fetching subjects:", err);
      setSubjects([]);
    } finally {
      setIsLoadingSubjects(false);
    }
  }, [isLoadingSubjects, subjects.length]);

  // 🧩 Fetch units for a subject with caching
  const fetchUnits = useCallback(async (selectedSubject) => {
    if (!selectedSubject) return;
    
    // 🔧 Prevent duplicate calls
    if (isLoadingUnits) {
      console.log("🧩 fetchUnits already in progress, skipping...");
      return;
    }

    // 🔧 Return cached data if available
    const cachedUnits = cache.current.units.get(selectedSubject);
    if (cachedUnits && subject === selectedSubject) {
      console.log("🧩 Using cached units for", selectedSubject);
      return;
    }

    setIsLoadingUnits(true);
    
    try {
      setSubject(selectedSubject);
      setNote(null);
      setUnits([]); // Clear previous units instantly

      console.log("🧩 Fetching units for:", selectedSubject);
      const res = await fetch(`${BASE_URL}/units?subject=${selectedSubject}`);
      const data = await res.json();

      const sorted = (data.units || []).sort((a, b) => {
        const aUnit = parseFloat(a.unit);
        const bUnit = parseFloat(b.unit);
        return aUnit - bUnit;
      });

      // Clean up headings for all units
      const cleanedUnits = sorted.map(unit => ({
        ...unit,
        displayHeading: cleanHeading(unit.unit, unit.heading)
      }));

      // Cache the result
      cache.current.units.set(selectedSubject, cleanedUnits);
      setUnits(cleanedUnits);
      console.log(`✅ Units for "${selectedSubject}":`, cleanedUnits.length);
    } catch (err) {
      console.error("❌ Error fetching units:", err);
      setUnits([]);
    } finally {
      setIsLoadingUnits(false);
    }
  }, [isLoadingUnits, subject]);

  // 📄 Fetch note data with caching
  const fetchNote = useCallback(async (unitHeading) => {
    if (!subject || !unitHeading) return;
    
    const cacheKey = `${subject}-${unitHeading}`;
    
    // 🔧 Prevent duplicate calls
    if (isLoadingNote) {
      console.log("📄 fetchNote already in progress, skipping...");
      return;
    }

    // 🔧 Return cached data if available
    const cachedNote = cache.current.notes.get(cacheKey);
    if (cachedNote) {
      console.log("📄 Using cached note for", cacheKey);
      setNote(cachedNote);
      return;
    }

    setIsLoadingNote(true);
    
    try {
      console.log("📄 Fetching note for:", cacheKey);
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
      
      if (rawNote?.code) {
        rawNote.code = hexToString(rawNote.code);
      }

      // Cache the result
      cache.current.notes.set(cacheKey, rawNote);
      setNote(rawNote);
      console.log("✅ Note fetched for:", cacheKey);
    } catch (err) {
      console.error("❌ Error fetching note:", err);
      setNote(null);
    } finally {
      setIsLoadingNote(false);
    }
  }, [subject, isLoadingNote]);

  // ✏️ Update note data (PATCH)
// ✏️ Fixed Update note data (PATCH) - ADD /api/ to the URL
const updateNote = async (unitId, updatedFields) => {
  try {
    console.log("🚀 Sending PATCH request:", {
      url: `${BASE_URL}/notes/${subject}/${encodeURIComponent(unitId)}`,
      body: updatedFields
    });

    const res = await fetch(`${BASE_URL}/notes/${subject}/${encodeURIComponent(unitId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFields),
    });

    const data = await res.json();
    console.log("📡 API Response:", { status: res.status, data });

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: Failed to update note`);
    }

    // 🔧 Invalidate cache for updated note
    const cacheKey = `${subject}-${unitId}`;
    cache.current.notes.delete(cacheKey);

    console.log("✅ Note updated successfully:", data);
    return { success: true, message: data.message || "Note updated" };
  } catch (err) {
    console.error("❌ Error updating note:", err.message);
    return { success: false, error: err.message };
  }
};

  // Test function - will delete later 
  const testFetchNote = async () => {
    const subject = "java";
    const unitHeading = "1";

    try {
      const res = await fetch(
        `${BASE_URL}/notes?subject=${subject}&unit=${encodeURIComponent(unitHeading)}`
      );
      const data = await res.json();

      if (!data?.data) {
        console.warn("⚠️ No note data found:", data);
        return;
      }

      const rawNote = data.data;
      settrydata(rawNote);
      console.log("✅ Raw Note from API:", rawNote);
    } catch (err) {
      console.error("❌ Error fetching note:", err);
    }
  };

  return (
    <NotesContext.Provider
      value={{
        subjects,
        subject,
        units,
        note,
        trydata,
        // Loading states
        isLoadingSubjects,
        isLoadingUnits,
        isLoadingNote,
        // Functions
        testFetchNote,
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