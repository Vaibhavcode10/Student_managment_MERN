import React, { useEffect, useState, useRef } from "react";
import { useNotes } from "../context/NotesProvider";
import { useUser } from "../context/UserProvider";
import HtmlViewer from "./HtmlViewer";
import { useNavigate } from "react-router-dom";

export default function Notes() {
  const { theme } = useUser();
  const {
    subject,
    subjects,
    units,
    note,
    fetchSubjects,
    fetchUnits,
    fetchNote,
  } = useNotes();

  const [activeUnit, setActiveUnit] = useState(null);
  const navigate = useNavigate();

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
  }, [units]);

  const handleUnitClick = (unitId) => {
    setActiveUnit(unitId);
    fetchNote(unitId);
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

  const testHtml = `
  <h1 style="color: #007bff; text-align: center; text-shadow: 1px 1px 2px #aaa;">
    Java Operators
  </h1>

  <div class="box" style="
    border: 2px dashed #00bcd4;
    background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    font-size: 1.1rem;
    color: #333;
  ">
    <strong style="color: #d32f2f;">Tip:</strong> Wrap expressions in <code style="background: #f9f9f9; padding: 0.2rem 0.4rem;">parentheses</code>!
  </div>

  <pre style="
    background-color: #212121;
    color: #f1f1f1;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1.5rem;
    font-size: 1rem;
    overflow-x: auto;
  ">
    <code>
int a = (b + c) * d;
float result = (x - y) / (z + 1);
    </code>
  </pre>
`;

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

  const iframeRef = useRef(null);

  return (
    <div
      className={`flex flex-col md:flex-row h-screen font-sans overflow-y-hidden ${
        theme === "light" ? "bg-gray-100 text-gray-900" : "bg-[#121212] text-gray-200"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`w-full md:w-[280px] p-4 border-b md:border-b-0 md:border-r shadow-sm flex flex-col ${
          theme === "light" ? "bg-white border-gray-200" : "bg-[#1e1e1e] border-gray-700"
        }`}
      >
        <select
          onChange={(e) => {
            fetchUnits(e.target.value);
            setActiveUnit(null);
          }}
          value={subject}
          className="w-full p-2.5 mb-1 rounded-md border border-gray-300 text-sm"
        >
          <option value="">-- Select Subject --</option>
          {subjects.map((subj, idx) => (
            <option key={idx} value={subj}>
              {subjectNameMap[subj] || subj}
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
                  className={`cursor-pointer mb-2 p-2 rounded-md border text-sm transition-colors ${
                    isActive
                      ? theme === "light"
                        ? "bg-blue-100 border-blue-300"
                        : "bg-gray-700 border-gray-600"
                      : theme === "light"
                      ? "bg-gray-50 border-gray-300"
                      : "bg-gray-800 border-gray-700"
                  }`}
                >
                  {getHeadingDisplay(unit)}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Main Viewer */}
      <div
        className="flex-1 md:px-0 overflow-y-auto justify-center"
        style={{
          height: "100%", // Ensure the container takes full height
          backgroundColor: theme === "light" ? "#fdfdfd" : "#1e1e1e",
        }}
      >
        <div
          className="w-full h-full" // Ensure the inner div takes full height
          style={{
            width: "100%",
            overflowX: "hidden",
          }}
        >
          <div
            className="prose max-w-none h-full" // Ensure the prose div takes full height
            style={{
              overflowWrap: "break-word",
              wordBreak: "break-word",
              width: "100%",
              height: "100%", // Match the height of the container
            }}
          >
            {note?.content ? (
              <HtmlViewer htmlContent={note.content} />
            ) : (
              <div className="text-gray-400 italic">Select a unit to view the notes...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}