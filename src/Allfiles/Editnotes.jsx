import React, { useState, useEffect } from "react";
import { useNotes } from "../context/NotesProvider";
import { useUser } from "../context/UserProvider";
import { Menu, Eye, Edit3, Save, CheckCircle, XCircle } from "lucide-react";
import MonacoEditor from "@monaco-editor/react";
import DOMPurify from "dompurify";

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
    updateNote, // Using the updateNote function from NotesProvider
  } = useNotes();

  const [activeUnit, setActiveUnit] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [mode, setMode] = useState("view"); // "view" or "edit"
  const [editedHtml, setEditedHtml] = useState(""); // Persistent edited content
  const [editedCode, setEditedCode] = useState(""); // Persistent edited code
  const [editedHeading, setEditedHeading] = useState("");
  const [editedUnit, setEditedUnit] = useState("");

  const [saveStatus, setSaveStatus] = useState(null); // "success", "error", or null
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

  // Sync local editable content when note changes (only if not currently editing)
  useEffect(() => {
    if (note) {
      setEditedHtml(note.content || "");
      setEditedCode(note.code || "");
    }
  }, [note]);

  // Handle unit click
  const handleUnitClick = (unitId) => {
    setActiveUnit(unitId);
    fetchNote(unitId);
    setSaveStatus(null); // Clear save status when switching units
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

  return (
    <div
      className={`flex h-screen overflow-hidden font-sans ${
        theme === "light"
          ? "bg-gray-100 text-gray-900"
          : "bg-[#121212] text-white"
      }`}
    >
      {/* Toggle Sidebar Button */}

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
            {subjects.map((subj, idx) => (
              <option key={idx} value={subj}>
                {subj}
              </option>
            ))}
          </select>

          <div className="flex-1 overflow-y-auto">
            <ul className="list-none p-0 m-0 text-left">
              {sortedUnits.map((unit, idx) => {
                const unitId = unit.unit || `unit-${idx}`;
                const isActive = activeUnit === unitId;

                return (
                  <li
                    key={unitId}
                    onClick={() => handleUnitClick(unitId)}
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
        {/* Floating Action Buttons */}

        <div className="absolute top-4 right-4 z-40 flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
          {/* Sidebar Toggle Button */}

          <button
            onClick={() => setShowSidebar((prev) => !prev)}
            className={`p-2 rounded-md shadow-md transition-colors ${
              theme === "light"
                ? "bg-white text-black border border-gray-300 hover:bg-gray-100"
                : "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700"
            }`}
            title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* View Button */}
          <button
            onClick={() => setMode("view")}
            className={`px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm ${
              mode === "view"
                ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                : theme === "light"
                ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            }`}
            title="View Mode"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View</span>
          </button>

          {/* Edit Button */}
          <button
            onClick={() => setMode("edit")}
            className={`px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm ${
              mode === "edit"
                ? "bg-green-500 text-white border-green-500 hover:bg-green-600"
                : theme === "light"
                ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            }`}
            title="Edit Mode"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          {/* Save Button */}
          <button
            onClick={saveChanges}
            disabled={isSaving || !subject || !activeUnit}
            className={`px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm ${
              isSaving
                ? "bg-gray-400 text-white border-gray-400 cursor-not-allowed"
                : "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
            }`}
            title="Save Changes"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isSaving ? "Saving..." : "Save"}
            </span>
          </button>
        </div>

        {/* Save Status Message */}
        {saveStatus && (
          <div
            className={`absolute top-16 right-4 z-30 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-md transition-all duration-300 ${
              saveStatus === "success"
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
        <div className="h-full w-full overflow-hidden">
          {mode === "view" ? (
            // View Mode - Full height with proper scrolling
            <div
              className={`h-full w-full overflow-auto p-6 pt-20 ${
                theme === "light" ? "bg-white" : "bg-[#1e1e1e]"
              }`}
            >
              <div
                className={`prose max-w-none text-left${
                  theme === "dark" ? "prose-invert" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: getSanitizedHtml() }}
              />

              {/* Code Block Display */}
              {editedCode && (
                <div className="mt-8">
                  <h3
                    className={`text-lg font-semibold mb-3 ${
                      theme === "light" ? "text-gray-900" : "text-gray-100"
                    }`}
                  >
                    Code Block:
                  </h3>
                  <pre
                    className={`p-4 rounded-md text-sm font-mono overflow-x-auto ${
                      theme === "light"
                        ? "bg-gray-100 text-gray-900 border border-gray-300"
                        : "bg-gray-900 text-gray-100 border border-gray-700"
                    }`}
                  >
                    <code>{editedCode}</code>
                  </pre>
                </div>
              )}
            </div>
          ) : (
            // Edit Mode - Full height Monaco Editor
            <div className="h-full w-full pt-20 pb-6 px-6">
              <div className="h-full flex flex-col gap-4">
                {/* HTML Content Editor */}
                <div className="min-h-0 flex flex-col gap-4">
                  {/* 🔹 Left-aligned input field (default behavior) */}
                  <input
                    type="text"
                    value={editedUnit}
                    onChange={(e) => setEditedUnit(e.target.value)}
                    placeholder="Enter Unit Number"
                    className="w-48 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500   dark:text-white dark:border-zinc-700"
                  />

                  {/* 🔹 HTML Editor */}
                  <div className="h-full border rounded-md overflow-hidden">
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
                        minimap: { enabled: false },
                        lineNumbers: "on",
                        wordWrap: "on",
                        folding: true,
                        bracketMatching: "always",
                        autoIndent: "full",
                      }}
                      className="text-left"
                    />
                  </div>
                </div>

                {/* Code Block Editor */}
                <div className="h-48 flex-shrink-0">
                  <h3
                    className={`text-sm font-semibold mb-2 ${
                      theme === "light" ? "text-gray-900" : "text-gray-100"
                    }`}
                  >
                    Code Block:
                  </h3>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
