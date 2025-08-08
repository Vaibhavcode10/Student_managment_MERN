import React, { useEffect, useState, useCallback } from "react";
import { useNotes } from "../context/NotesProvider";
import { useUser } from "../context/UserProvider";
import HtmlViewer from "./HtmlViewer";
import { useNavigate } from "react-router-dom";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowSidebar(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🔧 FIX 1: Only fetch subjects once, with proper loading guard
  useEffect(() => {
    if (subjects.length === 0) {  // Only fetch if we don't have subjects yet
      fetchSubjects();
    }
  }, []); // Empty dependency array is fine here since we have the guard

  // 🔧 FIX 2: Fix the missing dependencies and add proper guards
  useEffect(() => {
    // Guard: Only run if we have units and no active unit is set
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
  }, [units, activeUnit, fetchNote]); // 🔧 Added missing dependencies

  // 🔧 FIX 3: Memoize the unit click handler to prevent unnecessary re-renders
  const handleUnitClick = useCallback((unitId) => {
    setActiveUnit(unitId);
    fetchNote(unitId);
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [fetchNote, isMobile]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
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
      className={`flex h-screen font-sans overflow-hidden relative ${
        theme === "light" ? "bg-gray-100 text-gray-900" : "bg-[#121212] text-gray-200"
      }`}
    >
      {/* Mobile Overlay */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile ? 'fixed left-0 top-0 z-50' : 'relative'
        } h-full transition-all duration-300 ease-in-out ${
          showSidebar
            ? isMobile
              ? 'w-[85vw] max-w-[320px]'
              : 'w-[280px]'
            : isMobile
              ? '-translate-x-full w-[85vw] max-w-[320px]'
              : 'w-0'
        } ${
          theme === "light" 
            ? "bg-white border-gray-200" 
            : "bg-[#1e1e1e] border-gray-700"
        } border-r shadow-lg overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="">
            {isMobile && (
              <button
                onClick={() => setShowSidebar(false)}
                className={`p-2 rounded-md transition-colors ${
                  theme === "light"
                    ? "text-gray-600 hover:bg-gray-100"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Subject Selector */}
          <div className="p-3">
            <div className="relative">
              <div
                className="p-[2px] rounded-md bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-800 animate-borderFlash shadow-[0_0_20px_4px_rgba(99,102,241,0.5)]"
                style={{
                  backgroundSize: '300% 300%',
                }}
              >
                <select
                  onChange={(e) => {
                    fetchUnits(e.target.value);
                    setActiveUnit(null);
                  }}
                  value={subject}
                  className={`w-full p-3 my-scrollable-div rounded-md text-sm appearance-none focus:outline-none transition-all duration-300 ${
                    theme === "light"
                      ? "bg-white text-gray-900"
                      : "bg-[#1e1e1e] text-white"
                  }`}
                >
                  <option value="" disabled hidden>
                    -- Select Subject --
                  </option>
                  {subjects.map((subj, idx) => (
                    <option key={idx} value={subj} className="text-sm">
                      {subjectNameMap[subj] || subj}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Units List */}
          <div className="flex-1 overflow-y-auto max-h-[80vh] my-scrollable-div">
            <ul className="space-y-2 p-2 text-left">
              {sortedUnits.map((unit, idx) => {
                const unitId = unit.unit || `unit-${idx}`;
                const isActive = activeUnit === unitId;

                return (
                  <li
                    key={unitId}
                    onClick={() => handleUnitClick(unitId)}
                    className={`cursor-pointer px-2 py-3 rounded-xl border text-sm font-medium transition-all duration-200 shadow-sm 
                      ${
                        isActive
                          ? theme === "light"
                            ? "bg-blue-100 border-blue-300 text-blue-900"
                            : "bg-blue-900 border-blue-600 text-blue-100"
                          : theme === "light"
                            ? "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
                            : "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-200"
                      }`}
                  >
                    {getHeadingDisplay(unit)}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Floating Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`absolute top-4 left-4 z-10 p-2 rounded-md shadow-md transition-colors ${
            theme === "light"
              ? "bg-white text-gray-600 hover:bg-gray-100"
              : "bg-[#2b2b2b] text-gray-300 hover:bg-gray-700"
          }`}
          title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
        >
          {showSidebar ? (
            isMobile ? <X className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
          ) : (
            isMobile ? <Menu className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
          )}
        </button>

        {/* Notes Content */}
        <div
          className="flex-1 overflow-y-hidden"
          style={{
            backgroundColor: theme === "light" ? "#fdfdfd" : "#1e1e1e",
          }}
        >
          <div className="max-w-none mx-auto">
            <div
              className="prose max-w-none text-left"
              style={{
                overflowWrap: "break-word",
                wordBreak: "break-word",
                width: "100%",
              }}
            >
              {note?.content ? (
                <HtmlViewer htmlContent={note.content} />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-gray-400 italic text-lg mb-4">
                    {!subject
                      ? "Please select a subject to get started"
                      : units.length === 0
                      ? "No units available for this subject"
                      : "Select a unit to view the notes..."}
                  </div>
                  {!showSidebar && (
                    <button
                      onClick={() => setShowSidebar(true)}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        theme === "light"
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isMobile ? "Open Menu" : "Show Sidebar"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}