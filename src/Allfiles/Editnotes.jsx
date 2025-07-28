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

  // Load subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Auto-select first unit after units load
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
  }, [units]);

  // Sync local editable content when note changes
  useEffect(() => {
    if (note) {
      setEditedHtml(note.content || "");
      setEditedCode(note.code || "");
      setEditedUnit(note.unit || "");
      setEditedHeading(note.heading || "");
    }
  }, [note]);

  // Handle unit click
  const handleUnitClick = (unitId) => {
    setActiveUnit(unitId);
    fetchNote(unitId);
    setSaveStatus(null);
  };

  const saveChanges = async () => {
    if (!subject || !activeUnit) return;

    const updatedFields = {};

    if (editedHtml !== null && editedHtml !== undefined) {
      updatedFields.content = editedHtml;
    }

    if (editedCode !== null && editedCode !== undefined) {
      updatedFields.code = editedCode;
    }

    if (editedHeading !== null && editedHeading !== undefined) {
      updatedFields.heading = editedHeading;
    }

    if (
      editedUnit !== null &&
      editedUnit !== undefined &&
      editedUnit !== activeUnit
    ) {
      updatedFields.unit = Number(editedUnit);
    }

    if (Object.keys(updatedFields).length === 0) {
      console.warn("🟡 Nothing to update.");
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      await updateNote(activeUnit, updatedFields);
      setSaveStatus("success");
      console.log("✅ Note saved successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus("error");
      console.error("❌ Error saving note:", err);
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setIsSaving(false);
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

  // Get sanitized HTML for safe rendering
  const getSanitizedHtml = () => {
    return DOMPurify.sanitize(editedHtml || "");
  };

  const subjectNameMap = {
    "adv-python": "Advanced Python",
    "bootstrap": "Bootstrap",
    "c": "C Programming",
    "cpp": "C++ Programming",
    "css": "CSS",
    "dsa": "Data Structures & Algorithms",
    "dsaj": "DSA with Java",
    "express": "Express.js",
    "flutter": "Flutter",
    "html": "HTML",
    "java": "Java",
    "javascript": "JavaScript",
    "kid-python": "Python for Kids",
    "kidpython": "Python for Kids",
    "mongo": "MongoDB",
    "mysql": "MySQL",
    "nextjs": "Next.js",
    "postgres": "PostgreSQL",
    "power_bi": "Power BI",
    "python": "Python",
    "react": "React.js"
  };

  return (
    <div
      className={`flex h-screen overflow-hidden font-sans ${theme === "light"
          ? "bg-gray-100 text-gray-900"
          : "bg-[#121212] text-white"
        }`}
    >
      {/* Sidebar */}
      {showSidebar && (
        <div
          className={`w-[280px] p-4 border-r shadow-sm flex flex-col transition-all duration-300 ${theme === "light"
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
            className={`w-full p-2.5 mb-4 rounded-md border text-sm transition-colors ${theme === "light"
                ? "bg-white border-gray-300 text-gray-900"
                : "bg-gray-800 border-gray-600 text-white"
              }`}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((subj, idx) => (
              <option key={idx} value={subj} className="text-base text-black dark:text-white">
                {subjectNameMap[subj] || subj}
              </option>
            ))}
          </select>

          <div className="flex-1 overflow-y-auto my-scrollable-div">
            <ul className="list-none p-0 m-0 text-left">
              {sortedUnits.map((unit, idx) => {
                const unitId = unit.unit || `unit-${idx}`;
                const isActive = activeUnit === unitId;

                return (
                  <li
                    key={unitId}
                    onClick={() => handleUnitClick(unitId)}
                    className={`cursor-pointer mb-2 p-3 rounded-md border text-sm transition-all duration-200 hover:shadow-sm ${isActive
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
          className={`absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b ${theme === "light"
              ? "bg-white border-gray-200"
              : "bg-[#1e1e1e] border-gray-700"
            }`}
        >
          {/* Left Side - View/Edit/Save Buttons */}
          <div className="flex items-center gap-2">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setShowSidebar((prev) => !prev)}
              className={`p-2 rounded-md transition-colors ${theme === "light"
                  ? "text-gray-600 hover:bg-gray-100"
                  : "text-gray-300 hover:bg-gray-700"
                }`}
              title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* View Button */}
            <button
              onClick={() => setMode("view")}
              className={`p-2 rounded-md transition-colors ${mode === "view"
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

            {/* Edit Button */}
            <button
              onClick={() => setMode("edit")}
              className={`p-2 rounded-md transition-colors ${mode === "edit"
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

            {/* Code Panel Toggle Button - moved to header for better visibility */}
            {mode === "edit" && (
              <button
                onClick={() => setShowCodePanel(!showCodePanel)}
                className={`p-2 rounded-md transition-colors ${showCodePanel
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

            {/* Save Button */}
            <button
              onClick={saveChanges}
              disabled={isSaving || !subject || !activeUnit}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isSaving
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              title="Save Changes"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>

          {/* Right Side - Unit and Heading Input Fields */}
          <div className="flex flex-wrap items-center gap-3">
            <label
              className={`text-sm font-medium ${theme === "light" ? "text-gray-900" : "text-white"
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
                className={`px-2 py-1.5 rounded-md border text-sm w-auto min-w-[200px] transition-colors ${theme === "light"
                    ? "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    : "bg-gray-800 border-gray-600 text-white focus:border-blue-500"
                  }`}
              />
            ) : (
              <span
                className={`text-left px-2 py-1.5 rounded-md text-sm min-w-[200px] ${theme === "light"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-gray-700 text-white"
                  }`}
              >
                {editedHeading || "No heading"}
              </span>
            )}

            <label
              className={`text-sm font-medium ${theme === "light" ? "text-gray-900" : "text-white"
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
                className={`px-2 py-1.5 rounded-md border text-sm w-14 text-center transition-colors ${theme === "light"
                    ? "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    : "bg-gray-800 border-gray-600 text-white focus:border-blue-500"
                  }`}
              />
            ) : (
              <span
                className={`px-2 py-1.5 rounded-md text-sm w-14 text-center ${theme === "light"
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
            className={`absolute top-16 right-4 z-30 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-md transition-all duration-300 ${saveStatus === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
              }`}
          >
            {saveStatus === "success" ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Note saved successfully!
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Failed to save note
              </>
            )}
          </div>
        )}

        {/* Editor or Viewer - Full Height */}
        <div className="h-full w-full overflow-hidden text-left pt-16">
          {mode === "view" ? (
            // View Mode - Full height with proper scrolling
            <div
              className={`h-full w-full overflow-auto my-scrollable-div ${theme === "light" ? "bg-white" : "bg-[#1e1e1e]"
                }`}
            >
              {note?.content ? (
                <HtmlViewer htmlContent={note.content} codeContent={editedCode} />
              ) : (
                <div className="p-4 text-gray-400 italic">Select a unit to view the notes...</div>
              )}
            </div>
          ) : (
            // Edit Mode - Full VS Code-like editor
            <div className="h-full w-full flex relative">
              {/* HTML Editor - Takes most of the space */}
              <div className={`h-full transition-all duration-300 ${showCodePanel ? 'w-[50%]' : 'w-full'}`}>
                <MonacoEditor
                  height="100%"
                  language="html"
                  theme={theme === "light" ? "light" : "vs-dark"}
                  value={editedHtml}
                  onChange={(value) => setEditedHtml(value || "")}
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

              {/* Code Block Editor - Side panel */}
              {showCodePanel && (
                <div
                  className={`w-[50%] h-full border-l flex flex-col transition-all duration-300 ${theme === "light"
                      ? "bg-gray-50 border-gray-200"
                      : "bg-[#252525] border-gray-700"
                    }`}
                >
                  <div
                    className={`px-3 py-2 border-b flex items-center justify-between ${theme === "light"
                        ? "bg-gray-100 border-gray-200"
                        : "bg-[#2d2d2d] border-gray-700"
                      }`}
                  >
                    <h6 className="text-sm font-medium">Code Blocks</h6>
                    <button
                      onClick={() => setShowCodePanel(false)}
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${theme === "light" ? "text-gray-500" : "text-gray-400"
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
                      className={`w-full h-full p-3 text-sm font-mono rounded-md border resize-none transition-colors ${theme === "light"
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