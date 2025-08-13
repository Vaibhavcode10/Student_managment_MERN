import { createContext, useContext, useState, useCallback, useRef } from "react";

const NotesContext = createContext();

export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("");
  const [units, setUnits] = useState([]);
  const [note, setNote] = useState(null);
  const [trydata, settrydata] = useState([]);

  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);

  const cache = useRef({
    subjects: null,
    units: new Map(),
    notes: new Map(),
  });

  const BASE_URL = "https://api-e5q6islzdq-uc.a.run.app/api";

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

  const fetchSubjects = useCallback(async () => {
    if (isLoadingSubjects) {
      console.log("📚 fetchSubjects already in progress, skipping...");
      return;
    }

    if (cache.current.subjects && subjects.length > 0) {
      console.log("📚 Using cached subjects");
      return;
    }

    setIsLoadingSubjects(true);

    try {
      console.log("📚 Fetching subjects from API...");
      const res = await fetch(`${BASE_URL}/subjects`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch subjects`);
      const data = await res.json();
      const subjectList = data.subjects || [];

      cache.current.subjects = subjectList;
      setSubjects(subjectList);
      console.log("✅ Subjects fetched:", subjectList.length);
    } catch (err) {
      console.error("❌ Error fetching subjects:", err.message);
      setSubjects([]);
      throw err; // Propagate error to caller
    } finally {
      setIsLoadingSubjects(false);
    }
  }, [isLoadingSubjects, subjects.length]);

  const fetchUnits = useCallback(async (selectedSubject) => {
    if (!selectedSubject) return;

    if (isLoadingUnits) {
      console.log("🧩 fetchUnits already in progress, skipping...");
      return;
    }

    const cachedUnits = cache.current.units.get(selectedSubject);
    if (cachedUnits && subject === selectedSubject) {
      console.log("🧩 Using cached units for", selectedSubject);
      return;
    }

    setIsLoadingUnits(true);

    try {
      setSubject(selectedSubject);
      setNote(null);
      setUnits([]);

      console.log("🧩 Fetching units for:", selectedSubject);
      const res = await fetch(`${BASE_URL}/units?subject=${selectedSubject}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch units`);
      const data = await res.json();

      const sorted = (data.units || []).sort((a, b) => {
        const aUnit = parseFloat(a.unit);
        const bUnit = parseFloat(b.unit);
        return aUnit - bUnit;
      });

      const cleanedUnits = sorted.map((unit) => ({
        ...unit,
        displayHeading: cleanHeading(unit.unit, unit.heading),
      }));

      cache.current.units.set(selectedSubject, cleanedUnits);
      setUnits(cleanedUnits);
      console.log(`✅ Units for "${selectedSubject}":`, cleanedUnits.length);
    } catch (err) {
      console.error("❌ Error fetching units:", err.message);
      setUnits([]);
      throw err;
    } finally {
      setIsLoadingUnits(false);
    }
  }, [isLoadingUnits, subject]);

  const fetchNote = useCallback(async (unitId) => {
    if (!subject || !unitId) return;

    const cacheKey = `${subject}-${unitId}`;

    if (isLoadingNote) {
      console.log("📄 fetchNote already in progress, skipping...");
      return;
    }

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
        `${BASE_URL}/notes?subject=${subject}&unit=${encodeURIComponent(unitId)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch note`);
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

      cache.current.notes.set(cacheKey, rawNote);
      setNote(rawNote);
      console.log("✅ Note fetched for:", cacheKey);
    } catch (err) {
      console.error("❌ Error fetching note:", err.message);
      setNote(null);
      throw err; // Propagate error to caller
    } finally {
      setIsLoadingNote(false);
    }
  }, [subject, isLoadingNote]);

const updateNote = async (unitId, updatedFields) => {
  console.log("\n🚀 === UPDATE NOTE DEBUG START ===");
  console.log("📍 Input parameters:", {
    unitId: unitId,
    unitIdType: typeof unitId,
    updatedFields: updatedFields,
    currentSubject: subject
  });

  try {
    // Validate inputs
    if (!subject) {
      console.error("❌ No subject selected");
      throw new Error("No subject selected");
    }
    if (!unitId) {
      console.error("❌ No unit ID provided");
      throw new Error("No unit ID provided");
    }
    if (!updatedFields || Object.keys(updatedFields).length === 0) {
      console.error("❌ No fields to update");
      throw new Error("No fields to update");
    }

    // Build the URL exactly like Postman
    const encodedUnitId = encodeURIComponent(unitId);
    const url = `https://api-e5q6islzdq-uc.a.run.app/notes/${subject}/${encodedUnitId}`;
    
    console.log("🌐 Request details:", {
      baseUrl: BASE_URL,
      subject: subject,
      originalUnitId: unitId,
      encodedUnitId: encodedUnitId,
      finalUrl: url
    });

    const requestBody = JSON.stringify(updatedFields);
    console.log("📦 Request body:", {
      raw: requestBody,
      parsed: updatedFields,
      bodySize: requestBody.length
    });

    // Make the request
    console.log("📡 Making PATCH request...");
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // Add any other headers that might be needed
      },
      body: requestBody,
    });

    console.log("📨 Response received:", {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      headers: Object.fromEntries(res.headers.entries())
    });

    // Get response as text first to handle any parsing issues
    const responseText = await res.text();
    console.log("📄 Raw response:", responseText);

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      console.error("❌ Response text was:", responseText);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
    }

    console.log("✅ Parsed response:", data);

    if (!res.ok) {
      console.error("❌ HTTP Error details:", {
        status: res.status,
        statusText: res.statusText,
        errorData: data
      });
      
      const errorMessage = data.error || data.message || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
    }

    // Handle successful response
    console.log("🎉 Update successful! Processing response...");
    
    // Invalidate caches
    const cacheKey = `${subject}-${unitId}`;
    console.log("🗑️ Clearing cache for:", cacheKey);
    cache.current.notes.delete(cacheKey);
    cache.current.units.delete(subject);

    // Update local state if API returns updated note
    if (data.data) {
      console.log("📝 Updating local state with returned data...");
      const rawNote = data.data;
      if (rawNote?.code) {
        rawNote.code = hexToString(rawNote.code);
      }
      cache.current.notes.set(cacheKey, rawNote);
      setNote(rawNote);
      console.log("✅ Local state updated");
    } else {
      console.log("ℹ️ No data in response, cache cleared for fresh fetch");
    }

    console.log("🚀 === UPDATE NOTE DEBUG END ===\n");
    return { 
      success: true, 
      message: data.message || "Note updated successfully",
      data: data 
    };

  } catch (err) {
    console.error("\n❌ === UPDATE NOTE ERROR ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("=== END ERROR ===\n");
    
    return { 
      success: false, 
      error: err.message,
      details: {
        name: err.name,
        stack: err.stack
      }
    };
  }
};

  const testFetchNote = async () => {
    const subject = "java";
    const unitHeading = "1";

    try {
      const res = await fetch(
        `${BASE_URL}/notes?subject=${subject}&unit=${encodeURIComponent(unitHeading)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch test note`);
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
        isLoadingSubjects,
        isLoadingUnits,
        isLoadingNote,
        testFetchNote,
        fetchSubjects,
        fetchUnits,
        fetchNote,
        updateNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};