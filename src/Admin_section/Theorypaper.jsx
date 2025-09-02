import React, { useEffect, useState, useCallback } from "react";
import { useNotes } from "../context/NotesProvider"; // adjust path if needed
import { useNavigate } from "react-router-dom";

const Theorypaper = () => {
  const {
    subject,
    subjects,
    units,
    note,
    fetchSubjects,
    fetchUnits,
    fetchNote,
    generateTheoryContent,
    generatedContent,
  } = useNotes();

  const [activeUnit, setActiveUnit] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  // Example subjectNameMap (adjust based on your actual mapping)
  const subjectNameMap = {
    "adv-python": "adv-python",
    // Add more mappings as needed
  };

  // Fetch subjects once
  useEffect(() => {
    if (subjects.length === 0) {
      fetchSubjects();
    }
  }, [subjects, fetchSubjects]);

  // Auto-select first unit
  useEffect(() => {
    if (units.length > 0 && !activeUnit) {
      const sorted = [...units].sort(
        (a, b) => parseFloat(a.unit || 9999) - parseFloat(b.unit || 9999)
      );
      const first = sorted[0];
      if (first?.docId) {
        setActiveUnit(first.docId);
        fetchNote(first);
      }
    }
  }, [units, activeUnit, fetchNote]);

  // On click unit
  const handleUnitClick = useCallback(
    (unitObj) => {
      setActiveUnit(unitObj.docId);
      fetchNote(unitObj);
    },
    [fetchNote]
  );

  // Handle subject selection
  const handleSubjectChange = (e) => {
    const subjValue = e.target.value;
    const subj = subjects.find(
      (s) => (typeof s === "string" ? s : s.subjectName || s.name || s.title || s) === subjValue
    );
    setSelectedSubject(subjValue);
    setActiveUnit(null);
    if (subj) {
      fetchUnits(subj);
    }
  };

  // Handle generate content
  const handleGenerateContent = () => {
    if (selectedSubject && note) {
      generateTheoryContent(selectedSubject, note, prompt);
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

  // Find the selected unit object for displaying its ID
  const selectedUnitObj = sortedUnits.find((unit) => unit.docId === activeUnit);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {/* Left Section: Dropdown and Units */}
        <div className="space-y-4">
          {/* Subject Dropdown at Top Left */}
          <select
            className="w-full p-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={selectedSubject}
            onChange={handleSubjectChange}
          >
            <option value="">Select a Subject</option>
            {subjects.map((subj, idx) => (
              <option
                key={idx}
                value={typeof subj === "string" ? subj : subj.subjectName || subj.name || subj.title || subj}
                className="text-sm"
              >
                {subjectNameMap[subj] || (typeof subj === "string" ? subj : subj.subjectName || subj.name || subj.title || "NO NAME")}
              </option>
            ))}
          </select>

          {/* Units Display */}
          <div className="bg-white p-4 rounded-md shadow-md h-full">
            <h1 className="text-xl font-bold mb-4">Theory Paper</h1>
            {selectedSubject && sortedUnits.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  Units for {subjectNameMap[selectedSubject] || selectedSubject}:
                </h2>
                <p className="flex flex-wrap gap-2">
                  {sortedUnits.map((unit) => (
                    <span
                      key={unit.docId}
                      className={`inline-block px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-blue-100 ${
                        activeUnit === unit.docId ? "bg-blue-200 text-blue-800 font-medium" : "bg-gray-200 text-gray-800"
                      }`}
                      onClick={() => handleUnitClick(unit)}
                    >
                      {getHeadingDisplay(unit)}
                    </span>
                  ))}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">
                {selectedSubject
                  ? "No units available for this subject."
                  : "Select a subject to view its units."}
              </p>
            )}
          </div>

          {/* Generate Content Section */}
          <div className="bg-white p-4 rounded-md shadow-md">
            <h2 className="text-lg font-semibold mb-2">Generate Content</h2>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
              placeholder="Enter a prompt (optional)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleGenerateContent}
              disabled={!selectedSubject || !note}
            >
              Generate
            </button>
            {generatedContent && (
              <div className="mt-4 p-2 bg-gray-100 rounded-md">
                <h3 className="text-md font-semibold">Generated Content:</h3>
                <pre className="whitespace-pre-wrap">{generatedContent}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Tweaks */}
        <div className="bg-white p-6 rounded-md shadow-md space-y-6">
          <h2 className="text-lg font-semibold">Tweaks</h2>
          <div>
            <p className="text-md font-medium">Selected Subject:</p>
            <p className="text-gray-700 text-lg">{subjectNameMap[selectedSubject] || selectedSubject || "None"}</p>
          </div>
          <div>
            <p className="text-md font-medium">Selected Unit:</p>
            <p className="text-gray-700 text-lg">
              {selectedUnitObj ? getHeadingDisplay(selectedUnitObj) : "None"}
            </p>
          </div>
          <div>
            <p className="text-md font-medium">Unit ID:</p>
            <p className="text-gray-700 text-lg">{selectedUnitObj?.docId || "None"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Theorypaper;