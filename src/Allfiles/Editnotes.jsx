import React, { useState, useEffect } from "react";
import { useNotes } from "../context/NotesProvider";
import { useUser } from "../context/UserProvider";
import {
  Menu,
  Eye,
  Edit3,
  Save,
  CheckCircle,
  XCircle,
  Code,
  X,
  Trash2,
} from "lucide-react";
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
    addNote,
    deleteNote, // Add this
    isDeletingNote, // Add this
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
  const [activeDocId, setActiveDocId] = useState(null); // instead of activeUnit

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    if (units.length > 0 && !activeDocId) {
      const sorted = [...units].sort(
        (a, b) => parseFloat(a.unit || 9999) - parseFloat(b.unit || 9999)
      );
      const first = sorted[0];
      if (first?.docId) {
        setActiveDocId(first.docId);
        fetchNote(first); // pass full unit object
      }
    }
  }, [units, activeDocId, fetchNote]);

  useEffect(() => {
    if (note) {
      setEditedHtml(note.content || "");
      setEditedCode(note.code || "");
      setEditedUnit(note.unit || "");
      setEditedHeading(note.heading || "");
      setActiveDocId(note.docId || "");
    }
  }, [note]);

  const handleUnitClick = (unitObj) => {
    setActiveDocId(unitObj.docId);
    fetchNote(unitObj); // pass full object
    setSaveStatus(null);
  };

  const saveChanges = async () => {
    console.log("saved changes");
    if (!subject || !activeDocId) {
      console.warn("No subject or docId selected");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 5000);
      return;
    }

    const updatedFields = {};
    if (editedHtml != null) updatedFields.content = editedHtml;
    if (editedCode != null) updatedFields.code = editedCode;
    if (editedHeading != null) updatedFields.heading = editedHeading;
    if (editedUnit != null) updatedFields.unit = Number(editedUnit);

    if (Object.keys(updatedFields).length === 0) {
      setSaveStatus("warning");
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    try {
      const response = await updateNote(
        { docId: activeDocId },
        updatedFields,
        subject
      );
      if (response.success) {
        await fetchNote({ docId: activeDocId }); // refresh
        setSaveStatus("success");
      } else {
        throw new Error(response.error || "Unknown error");
      }
    } catch (err) {
      setSaveStatus("error");
      console.error(
        `❌ Error saving note for docId: ${activeDocId}`,
        err.message
      );
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const sortedUnits = [...units].sort(
    (a, b) => parseFloat(a.unit || 9999) - parseFloat(b.unit || 9999)
  );

  const getHeadingDisplay = (unitObj) => {
    const unitNum = unitObj.unit || "???";
    let headingText = unitObj.heading || "Untitled";

    // Remove unitNum from the start of headingText if it exists
    if (headingText.startsWith(unitNum)) {
      headingText = headingText
        .replace(unitNum, "")
        .replace(/^[:.\s-]+/, "")
        .trim();
    }

    // Remove all remaining numbers and periods from headingText, keeping only characters
    headingText = headingText.replace(/[0-9.]/g, "").trim();

    // Return formatted string with unit number and cleaned heading
    return `Unit ${unitNum}: ${headingText || "Unit"}`;
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

  //add note
  const handleAddNote = async () => {
    const result = await addNote({
      subject: "react",
      heading: "React Hooks Introduction",
      unit: 1,
      content: "<p>Learn about useState and useEffect</p>",
      code: "const [count, setCount] = useState(0);",
    });

    if (result.success) {
      console.log("Note added with ID:", result.docId);
    } else {
      console.error("Failed to add note:", result.error);
    }
  };

  const handleDeleteNote = async () => {
    if (!subject || !activeDocId) {
      console.warn("No subject or docId selected for deletion");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 5000);
      return;
    }
console.log(subject,activeDocId);
   
      try {
        const result = await deleteNote(subject, activeDocId);
        if (result.success) {
          setSaveStatus("success");
          setNote(note);
          setActiveDocId(null);
         
          if (units.length > 1) {
            const remainingUnits = units.filter(
              (unit) => unit.docId !== activeDocId
            );
            if (remainingUnits.length > 0) {
              const firstUnit = remainingUnits[0];
              setActiveDocId(firstUnit.docId);
              fetchNote(firstUnit);
            }
          }
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        setSaveStatus("error");
        console.error("Failed to delete note:", err.message);
      } finally {
        setTimeout(() => setSaveStatus(null), 4000);
      }
    
  };
  return (
    <div
      className={`flex h-screen overflow-hidden font-sans ${
        theme === "light"
          ? "bg-gray-100 text-gray-900"
          : "bg-[#121212] text-white"
      }`}
    >
      {/* Sidebar */}
      {showSidebar && (
        <div
          className={`w-[280px] p-4 border-r shadow-sm flex flex-col transition-all duration-300 ${
            theme === "light"
              ? "bg-white border-gray-200"
              : "bg-[#1e1e1e] border-gray-700"
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
              <option
                key={subj}
                value={subj}
                className="text-base text-black dark:text-white"
              >
                {subjectNameMap[subj] || subj}
              </option>
            ))}
          </select>

          <div className="flex-1 overflow-y-auto my-scrollable-div">
            <ul className="list-none p-0 m-0 text-left">
              {sortedUnits.map((unit, idx) => {
                const unitId = unit.docId || `unit-${idx}`;
                const isActive = activeDocId === unit.docId;

                return (
                  <li
                    key={unitId}
                    onClick={() => handleUnitClick(unit)} // ✅ pass full unit object
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
            theme === "light"
              ? "bg-white border-gray-200"
              : "bg-[#1e1e1e] border-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar((prev) => !prev)}
              className={`p-2 rounded-md transition-colors ${
                theme === "light"
                  ? "text-gray-600 hover:bg-gray-100"
                  : "text-gray-300 hover:bg-gray-700"
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
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isSaving
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
              title="Save Changes"
            >
              <Save className="w-4 h-4" />
            </button>

            <button
              onClick={handleDeleteNote}
              disabled={isDeletingNote || !activeDocId}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                isDeletingNote || !activeDocId
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
              title="Delete Note"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
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
                  theme === "light"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-gray-700 text-white"
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
                  theme === "light"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-gray-700 text-white"
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
        <div className="h-full w-full overflow-hidden text-left pt-16 bg-white">
          {mode === "view" ? (
            <div
              className={`h-full w-full overflow-auto my-scrollable-div ${
                theme === "light" ? "bg-white" : "bg-[#1e1e1e]"
              }`}
            >
              {editedHtml || editedCode ? (
                <HtmlViewer
                  htmlContent={getSanitizedHtml()}
                  codeContent={editedCode}
                />
              ) : (
                <div className="p-4 text-grey-400 italic">
                  {isLoadingNote
                    ? "Loading note..."
                    : "Select a unit to view the notes..."}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full w-full flex relative">
              <div
                className={`h-full transition-all duration-300 ${
                  showCodePanel ? "w-[50%]" : "w-full"
                }`}
              >
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
                    theme === "light"
                      ? "bg-gray-50 border-gray-200"
                      : "bg-[#252525] border-gray-700"
                  }`}
                >
                  <div
                    className={`px-3 py-2 border-b flex items-center justify-between ${
                      theme === "light"
                        ? "bg-gray-100 border-gray-200"
                        : "bg-[#2d2d2d] border-gray-700"
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
