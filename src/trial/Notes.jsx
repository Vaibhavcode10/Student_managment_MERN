import React, { useEffect, useRef, useState } from "react";
import { useNotes } from "../context/NotesProvider";
import { useUser } from "../context/UserProvider";
import DOMPurify from "dompurify";

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
  const contentRef = useRef(null);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // 🔁 Auto-select first unit after units load
  useEffect(() => {
    if (units.length > 0 && !activeUnit) {
      const sorted = [...units].sort((a, b) => parseFloat(a.unit || 9999) - parseFloat(b.unit || 9999));
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

  const sanitizedContent = note?.content
    ? DOMPurify.sanitize(note.content, {
        ALLOWED_TAGS: [
          "p", "div", "span", "ul", "ol", "li", "h1", "h2",
          "h3", "h4", "h5", "h6", "strong", "em", "a", "img",
          "table", "tr", "td", "th", "tbody", "thead", "br", "code", "pre"
        ],
        ALLOWED_ATTR: ["href", "src", "alt", "class"],
      })
    : "";

  // 🧹 Fix broken image links
  useEffect(() => {
    if (contentRef.current) {
      const images = contentRef.current.querySelectorAll("img");
      images.forEach((img) => {
        img.onerror = () => {
          img.src = "https://via.placeholder.com/200x120?text=Image+Not+Found";
          img.style.objectFit = "contain";
          img.style.margin = "1rem auto";
          img.style.display = "block";
          img.style.maxWidth = "100%";
          img.style.height = "auto";
        };
      });
    }
  }, [sanitizedContent]);

  // 📚 Sort units by their numeric unit field
  const sortedUnits = [...units].sort(
    (a, b) => parseFloat(a.unit || 9999) - parseFloat(b.unit || 9999)
  );

  // ✂️ Clean up heading by removing unit number from heading text
  const getHeadingDisplay = (unitObj) => {
    const unitNum = unitObj.unit || "???";
    let headingText = unitObj.heading || "Untitled";

    // If heading starts with same unit number, remove it
    if (headingText.startsWith(unitNum)) {
      headingText = headingText.replace(unitNum, "").replace(/^[:.\s-]+/, "").trim();
    }

    return `Unit ${unitNum}: ${headingText}`;
  };

  return (
    <div className={`flex h-screen font-sans overflow-auto ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-[#121212] text-gray-200"}`}>
      {/* Sidebar */}
      <div className={`w-[280px] p-4 border-r shadow-sm flex flex-col ${theme === "light" ? "bg-white border-gray-200" : "bg-[#1e1e1e] border-gray-700"}`}>
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
            <option key={idx} value={subj}>{subj}</option>
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

      {/* Content Area */}
      <div className={`flex-1 overflow-y-auto p-6 ${theme === "light" ? "bg-gray-100" : "bg-[#1a1a1a]"}`}>
        {note ? (
          <div
            ref={contentRef}
            className={`leading-relaxed text-base rounded-lg shadow-sm px-6 py-6 ${
              theme === "light" ? "bg-white" : "bg-[#1e1e1e]"
            } text-left prose max-w-full`}
          >
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            {note.code && (
              <pre className={`mt-4 px-4 py-3 rounded border overflow-x-auto text-sm font-mono ${
                theme === "light"
                  ? "bg-gray-100 text-gray-800 border-gray-300"
                  : "bg-[#1e1e1e] text-green-200 border-gray-600"
              }`}>
                <code>{note.code}</code>
              </pre>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-20 text-base">
            👈 Select a unit to view the notes
          </div>
        )}
      </div>
    </div>
  );
}
