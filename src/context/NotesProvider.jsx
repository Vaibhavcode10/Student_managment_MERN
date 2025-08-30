import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

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
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  // Cache to prevent duplicate API calls
  const cache = useRef({
    subjects: null,
    units: new Map(), // subject -> units
    notes: new Map(), // subject+unit -> note
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

    const startsWithUnit =
      headingLower.startsWith(unitLower) ||
      headingLower.startsWith("0" + unitLower);

    if (startsWithUnit) {
      let cleanHeading = heading;
      if (headingLower.startsWith(unitLower)) {
        cleanHeading = heading.substring(unitStr.length);
      } else if (headingLower.startsWith("0" + unitLower)) {
        cleanHeading = heading.substring(unitStr.length + 1);
      }

      return cleanHeading.replace(/^[\s:.\-]+/, "").trim();
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
  const fetchUnits = useCallback(
    async (selectedSubject) => {
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
        const cleanedUnits = sorted.map((unit) => ({
          ...unit,
          displayHeading: cleanHeading(unit.unit, unit.heading),
          docId: unit.docId || unit.id || "", // carry docId forward
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
    },
    [isLoadingUnits, subject]
  );

  // 📄 Fetch note data with caching
  const fetchNote = useCallback(
    async (unitObj) => {
      if (!subject || !unitObj?.docId) return;

      const cacheKey = `${subject}-${unitObj.docId}`;

      if (isLoadingNote) return;

      const cachedNote = cache.current.notes.get(cacheKey);
      if (cachedNote) {
        setNote(cachedNote);
        return;
      }

      setIsLoadingNote(true);
      try {
        const res = await fetch(
          `${BASE_URL}/notes?subject=${subject}&docId=${encodeURIComponent(
            unitObj.docId
          )}`
        );
        const data = await res.json();

        if (!data) {
          setNote(null);
          return;
        }

        if (data.code) data.code = hexToString(data.code);

        cache.current.notes.set(cacheKey, data);
        setNote(data);
      } catch (err) {
        console.error("❌ Error fetching note:", err);
        setNote(null);
      } finally {
        setIsLoadingNote(false);
      }
    },
    [subject, isLoadingNote]
  );

  // 💾 Update existing note
  const updateNote = async (noteData, updatedFields, subject) => {
    console.log("Saving note with docId:", noteData.docId);

    try {
      // Basic validation
      if (!noteData?.docId) {
        throw new Error("No docId found for this note!");
      }
      if (!subject) {
        throw new Error("No subject provided!");
      }
      if (!updatedFields || Object.keys(updatedFields).length === 0) {
        throw new Error("No fields to update!");
      }

      // Construct URL using path parameters
      const url = `${BASE_URL}/notes/${encodeURIComponent(
        subject
      )}/${encodeURIComponent(noteData.docId)}`;

      // Send PATCH request
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      // Safely parse JSON response
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`HTTP ${res.status}: Failed to parse JSON`);
      }

      // Handle unsuccessful response
      if (!res.ok) {
        throw new Error(
          data.error || `HTTP ${res.status}: Failed to update note`
        );
      }

      // Optionally invalidate local cache
      const cacheKey = `${subject}-${noteData.unit || noteData.docId}`;
      cache?.current?.notes?.delete(cacheKey);

      console.log("✅ Note updated successfully:", data);
      return { success: true, message: data.message || "Note updated" };
    } catch (err) {
      console.error("❌ Error updating note:", err.message);
      return { success: false, error: err.message };
    }
  };

  // ➕ Add new note
  const addNote = useCallback(async (noteData) => {
    const { subject: noteSubject, code, content, heading, unit } = noteData;

    // Validation
    if (!noteSubject || !heading || !unit) {
      return { 
        success: false, 
        error: 'Missing required fields: subject, heading, unit' 
      };
    }

    setIsAddingNote(true);

    try {
      console.log("➕ Adding new note...", noteData);
      
      const res = await fetch(`${BASE_URL}/add-note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: noteSubject,
          code: code || '',
          content: content || ' ',
          heading,
          unit: parseFloat(unit)
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`HTTP ${res.status}: Failed to parse JSON response`);
      }

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Failed to add note`);
      }

      // Invalidate cache for this subject to force refresh
      if (cache.current.units.has(noteSubject)) {
        cache.current.units.delete(noteSubject);
      }

      // If we're currently viewing this subject, refresh the units
      if (subject === noteSubject) {
        await fetchUnits(noteSubject);
      }

      console.log("✅ Note added successfully:", data);
      return { 
        success: true, 
        message: data.message || "Note added successfully",
        docId: data.docId 
      };

    } catch (err) {
      console.error("❌ Error adding note:", err.message);
      return { success: false, error: err.message };
    } finally {
      setIsAddingNote(false);
    }
  }, [subject, fetchUnits]);

  // 🗑️ Delete note
// 🗑️ Delete note - Updated version
const deleteNote = useCallback(async (noteSubject, docId) => {
  // Validation
  if (!noteSubject || !docId) {
    return { 
      success: false, 
      error: 'Missing required fields: subject, docId' 
    };
  }

  setIsDeletingNote(true);

  try {
    console.log("🗑️ Deleting note...", { subject: noteSubject, docId });
    
    const res = await fetch(`https://api-e5q6islzdq-uc.a.run.app/delete-note`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: noteSubject,
        docid: docId // Note: API expects 'docid', not 'docId'
      }),
    });

    // Check if response is ok first
    if (!res.ok) {
      // Try to get error message, but handle cases where response isn't JSON
      let errorMessage = `HTTP ${res.status}: Request failed`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use status text or generic message
        errorMessage = res.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Only try to parse JSON if response was successful
    let data;
    try {
      data = await res.json();
    } catch {
      // If successful but no JSON, create a success response
      data = { message: "Note deleted successfully" };
    }

    // Invalidate relevant caches
    const cacheKey = `${noteSubject}-${docId}`;
    cache.current.notes.delete(cacheKey);
    
    // Invalidate units cache for this subject to force refresh
    if (cache.current.units.has(noteSubject)) {
      cache.current.units.delete(noteSubject);
    }

    // If we're currently viewing this subject, refresh the units
    if (subject === noteSubject) {
      await fetchUnits(noteSubject);
      // If the deleted note was currently active, clear it
      if (note?.docId === docId) {
        setNote(null);
      }
    }

    console.log("✅ Note deleted successfully:", data);
    return { 
      success: true, 
      message: data.message || "Note deleted successfully" 
    };

  } catch (err) {
    console.error("❌ Error deleting note:", err.message);
    return { success: false, error: err.message };
  } finally {
    setIsDeletingNote(false);
  }
}, [subject, fetchUnits, note]);
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
        isAddingNote,
        isDeletingNote,
        // Functions
        fetchSubjects,
        fetchUnits,
        fetchNote,
        updateNote,
        addNote,
        deleteNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};