import React, { useState, useEffect } from "react";
import { useNotes } from "../context/NotesProvider";
import { useUser } from "../context/UserProvider";
import { Menu, Eye, Edit3, Save, CheckCircle, XCircle, Code, X } from "lucide-react";
import MonacoEditor from "@monaco-editor/react";
import DOMPurify from "dompurify";
import HtmlViewer from "./HtmlViewer";

export default function Editnotes() {
  const { theme } = useUser();
  const {
    subject,
    subjects,
    units,
    fetchSubjects,
    fetchUnits,
    note,
    fetchNote,
    updateNote,
    isLoadingNote,
  } = useNotes();

  const [activeUnit, setActiveUnit] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [mode, setMode] = useState("view");
  const [editedHtml, setEditedHtml] = useState("");
  const [editedCode, setEditedCode] = useState("");
  const [editedHeading, setEditedHeading] = useState("");
  const [editedUnit, setEditedUnit] = useState("");
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    if (units.length > 0 && !activeUnit) {
      const sorted = [...units].sort(
        (a, b) => parseFloat(a.unit || 9999) - parseFloat(b.unit || 9999)
      );
      const first = sorted[0];
      if (first?.unit) {
        setActiveUnit(first.unit);
        fetchNote(first.unit);
      }
    }
  }, [units, fetchNote]);

  useEffect(() => {
    console.log("Syncing note:", note);
    if (note) {
      setEditedHtml(note.content || "");
      setEditedCode(note.code || "");
      setEditedUnit(note.unit || "");
      setEditedHeading(note.heading || "");
    }
  }, [note]);

  const handleUnitClick = (unitId) => {
    setActiveUnit(unitId);
    fetchNote(unitId);
    setSaveStatus(null);
  };

const saveChanges = async () => {
  if (!subject || !activeUnit) {
    console.warn("No subject or unit selected");
    setSaveStatus("error");
    setTimeout(() => setSaveStatus(null), 5000);
    return;
  }

  const updatedFields = {};
  if (editedHtml != null) updatedFields.content = editedHtml;
  if (editedCode != null) updatedFields.code = editedCode;
  if (editedHeading != null) updatedFields.heading = editedHeading;
  if (editedUnit != null && Number(editedUnit) !== Number(activeUnit)) {
    updatedFields.unit = Number(editedUnit);
  }

  if (Object.keys(updatedFields).length === 0) {
    console.warn("🟡 Nothing to update.");
    setSaveStatus("warning");
    setTimeout(() => setSaveStatus(null), 3000);
    return;
  }

  console.log("Saving note:", { subject, unitId: activeUnit, updatedFields });

  setIsSaving(true);
  setSaveStatus(null);

  try {
    const response = await updateNote(activeUnit, updatedFields, subject);

    if (response.success) {
      await fetchNote(activeUnit); // Refresh note
      setSaveStatus("success");
      console.log("✅ Note saved successfully!");
    } else {
      throw new Error(response.error || "Unknown error");
    }
  } catch (err) {
    setSaveStatus("error");
    console.error("❌ Error saving note:", err.message);
  } finally {
    setIsSaving(false);
    // Reset status after 3-5s depending on type
    setTimeout(() => setSaveStatus(null), 4000);
  }
};

  const sortedUnits = [...units].sort(
    (a, b) => parseFloat(a.unit || 9999) - parseFloat(b.unit || 9999)
  );

  const getHeadingDisplay = (unitObj) => {
    const unitNum = unitObj.unit || "???";
    let headingText = unitObj.heading || "Untitled";
    if (headingText.startsWith(unitNum)) {
      headingText = headingText
        .replace(unitNum, "")
        .replace(/^[:.\s-]+/, "")
        .trim();
    }
    return `Unit ${unitNum}: ${headingText}`;
  };

  const getSanitizedHtml = () => {
    return DOMPurify.sanitize(editedHtml || "", {
      ADD_TAGS: ["iframe", "video"],
      ADD_ATTR: ["target", "allowfullscreen"],
    });
  };

  const subjectNameMap = {
    "adv-python": "Advanced Python",
    bootstrap: "Bootstrap",
    c: "C Programming",
    cpp: "C++ Programming",
    css: "CSS",
    dsa: "Data Structures & Algorithms",
    dsaj: "DSA with Java",
    express: "Express.js",
    flutter: "Flutter",
    html: "HTML",
    java: "Java",
    javascript: "JavaScript",
    "kid-python": "Python for Kids",
    mongo: "MongoDB",
    mysql: "MySQL",
    nextjs: "Next.js",
    postgres: "PostgreSQL",
    power_bi: "Power BI",
    python: "Python",
    react: "React.js",
  };

  return (
    <div
      className={`flex h-screen overflow-hidden font-sans ${
        theme === "light" ? "bg-gray-100 text-gray-900" : "bg-[#121212] text-white"
      }`}
    >
      {/* Sidebar */}
      {showSidebar && (
        <div
          className={`w-[280px] p-4 border-r shadow-sm flex flex-col transition-all duration-300 ${
            theme === "light" ? "bg-white border-gray-200" : "bg-[#1e1e1e] border-gray-700"
          }`}
        >
          <select
            onChange={(e) => {
              fetchUnits(e.target.value);
              setActiveUnit(null);
              setSaveStatus(null);
            }}
            value={subject}
            className={`w-full p-2.5 mb-4 rounded-md border text-sm transition-colors ${
              theme === "light"
                ? "bg-white border-gray-300 text-gray-900"
                : "bg-gray-800 border-gray-600 text-white"
            }`}
          >
            <option value="">-- Select Subject --</option>
           {subjects.map((subj) => (
  <option key={subj} value={subj} className="text-base text-black dark:text-white">
    {subjectNameMap[subj] || subj}
  </option>
))}

          </select>

          <div className="flex-1 overflow-y-auto my-scrollable-div">
            <ul className="list-none p-0 m-0 text-left">
{sortedUnits.map((unit, idx) => {
  // Combine unit.unit + index + heading to guarantee unique key
  const unitId = unit.unit != null ? `${unit.unit}-${idx}` : `unit-${idx}-${unit.heading || ""}`;
  const isActive = activeUnit === unit.unit; // activeUnit can still be the plain unit value

  return (
    <li
      key={unitId}
      onClick={() => handleUnitClick(unit.unit)}
      className={`cursor-pointer mb-2 p-3 rounded-md border text-sm transition-all duration-200 hover:shadow-sm ${
        isActive
          ? theme === "light"
            ? "bg-blue-100 border-blue-300 text-blue-900"
            : "bg-blue-900 border-blue-600 text-blue-100"
          : theme === "light"
            ? "bg-gray-50 border-gray-300 hover:bg-gray-100"
            : "bg-gray-800 border-gray-700 hover:bg-gray-700"
      }`}
    >
      {getHeadingDisplay(unit)}
    </li>
  );
})}

            </ul>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Top Header with Controls */}
        <div
          className={`absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b ${
            theme === "light" ? "bg-white border-gray-200" : "bg-[#1e1e1e] border-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar((prev) => !prev)}
              className={`p-2 rounded-md transition-colors ${
                theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 hover:bg-gray-700"
              }`}
              title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMode("view")}
              className={`p-2 rounded-md transition-colors ${
                mode === "view"
                  ? theme === "light"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-blue-900 text-blue-300"
                  : theme === "light"
                    ? "text-gray-600 hover:bg-gray-100"
                    : "text-gray-300 hover:bg-gray-700"
              }`}
              title="View Mode"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMode("edit")}
              className={`p-2 rounded-md transition-colors ${
                mode === "edit"
                  ? theme === "light"
                    ? "bg-green-100 text-green-600"
                    : "bg-green-900 text-green-300"
                  : theme === "light"
                    ? "text-gray-600 hover:bg-gray-100"
                    : "text-gray-300 hover:bg-gray-700"
              }`}
              title="Edit Mode"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            {mode === "edit" && (
              <button
                onClick={() => setShowCodePanel(!showCodePanel)}
                className={`p-2 rounded-md transition-colors ${
                  showCodePanel
                    ? theme === "light"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-purple-900 text-purple-300"
                    : theme === "light"
                      ? "text-gray-600 hover:bg-gray-100"
                      : "text-gray-300 hover:bg-gray-700"
                }`}
                title={showCodePanel ? "Hide Code Panel" : "Show Code Panel"}
              >
                <Code className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={saveChanges}
              disabled={isSaving || !subject || !activeUnit}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isSaving
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
              title="Save Changes"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label
              className={`text-sm font-medium ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}
            >
              Heading:
            </label>
            {mode === "edit" ? (
              <input
                type="text"
                value={editedHeading}
                onChange={(e) => setEditedHeading(e.target.value)}
                placeholder="Enter Heading"
                className={`px-2 py-1.5 rounded-md border text-sm w-auto min-w-[200px] transition-colors ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    : "bg-gray-800 border-gray-600 text-white focus:border-blue-500"
                }`}
              />
            ) : (
              <span
                className={`text-left px-2 py-1.5 rounded-md text-sm min-w-[200px] ${
                  theme === "light" ? "bg-gray-100 text-gray-800" : "bg-gray-700 text-white"
                }`}
              >
                {editedHeading || "No heading"}
              </span>
            )}
            <label
              className={`text-sm font-medium ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}
            >
              Unit no:
            </label>
            {mode === "edit" ? (
              <input
                type="text"
                value={editedUnit}
                onChange={(e) => setEditedUnit(e.target.value)}
                placeholder="Unit #"
                className={`px-2 py-1.5 rounded-md border text-sm w-14 text-center transition-colors ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    : "bg-gray-800 border-gray-600 text-white focus:border-blue-500"
                }`}
              />
            ) : (
              <span
                className={`px-2 py-1.5 rounded-md text-sm w-14 text-center ${
                  theme === "light" ? "bg-gray-100 text-gray-800" : "bg-gray-700 text-white"
                }`}
              >
                {editedUnit || "N/A"}
              </span>
            )}
          </div>
        </div>

        {/* Save Status Message */}
        {saveStatus && (
          <div
            className={`absolute top-16 right-4 z-30 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-md transition-all duration-300 ${
              saveStatus === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : saveStatus === "warning"
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {saveStatus === "success" ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Note saved successfully!
              </>
            ) : saveStatus === "warning" ? (
              <>
                <XCircle className="w-4 h-4" />
                Nothing to update
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Failed to save note
              </>
            )}
          </div>
        )}

        {/* Editor or Viewer */}
        <div className="h-full w-full overflow-hidden text-left pt-16">
          {isLoadingNote ? (
            <div className="p-4 text-gray-400 italic">Loading note...</div>
          ) : mode === "view" ? (
            <div
              className={`h-full w-full overflow-auto my-scrollable-div ${
                theme === "light" ? "bg-white" : "bg-[#1e1e1e]"
              }`}
            >
              {editedHtml || editedCode ? (
                <HtmlViewer htmlContent={getSanitizedHtml()} codeContent={editedCode} />
              ) : (
                <div className="p-4 text-gray-400 italic">Select a unit to view the notes...</div>
              )}
            </div>
          ) : (
            <div className="h-full w-full flex relative">
              <div className={`h-full transition-all duration-300 ${showCodePanel ? "w-[50%]" : "w-full"}`}>
                <MonacoEditor
                  height="100%"
                  language="html"
                  theme={theme === "light" ? "light" : "vs-dark"}
                  value={editedHtml}
                  onChange={(value) => {
                    console.log("Monaco Editor value:", value);
                    setEditedHtml(value || "");
                  }}
                  options={{
                    fontSize: 14,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    minimap: { enabled: true },
                    lineNumbers: "on",
                    wordWrap: "on",
                    folding: true,
                    bracketMatching: "always",
                    autoIndent: "full",
                    renderWhitespace: "selection",
                    tabSize: 2,
                    insertSpaces: true,
                    cursorStyle: "line",
                    lineHeight: 22,
                    fontFamily: "Consolas, 'Courier New', monospace",
                  }}
                />
              </div>
              {showCodePanel && (
                <div
                  className={`w-[50%] h-full border-l flex flex-col transition-all duration-300 ${
                    theme === "light" ? "bg-gray-50 border-gray-200" : "bg-[#252525] border-gray-700"
                  }`}
                >
                  <div
                    className={`px-3 py-2 border-b flex items-center justify-between ${
                      theme === "light" ? "bg-gray-100 border-gray-200" : "bg-[#2d2d2d] border-gray-700"
                    }`}
                  >
                    <h6 className="text-sm font-medium">Code Blocks</h6>
                    <button
                      onClick={() => setShowCodePanel(false)}
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      }`}
                      title="Close Code Panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 p-3">
                    <textarea
                      value={editedCode}
                      onChange={(e) => setEditedCode(e.target.value)}
                      className={`w-full h-full p-3 text-sm font-mono rounded-md border resize-none transition-colors ${
                        theme === "light"
                          ? "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                          : "bg-gray-900 border-gray-700 text-gray-100 focus:border-blue-500"
                      }`}
                      placeholder="Enter code snippets here..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
///
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


  // ✏️ Fixed Update note data (PATCH) - ADD /api/ to the URL here
  const updateNote = async (unitId, updatedFields, subjectParam) => {
    try {
      const url = `${BASE_URL}/notes/${subjectParam}/${encodeURIComponent(unitId)}`;
      console.log("🚀 Sending PATCH request:", { url, body: updatedFields });

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      console.log("📡 API Response:", { status: res.status, data });

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Failed to update note`);
      }

      // Invalidate cache
      const cacheKey = `${subjectParam}-${unitId}`;
      cache?.current?.notes?.delete(cacheKey);

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