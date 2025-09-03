import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNotes } from "../context/NotesProvider"; // Assuming this is Airesposnseprovider
import { useUser } from "../context/UserProvider";
import { X, Menu } from "lucide-react";
import { useAi } from "../context/Airesposnseprovider";

const Theorypaper = () => {
  const { subjects, units, fetchSubjects, fetchUnits, fetchNote, note } =
    useNotes();

  const { generateTheoryContent, generatedContent, setCreatepdf } = useAi();
  const { theme } = useUser();
  const [selUnits, setSelUnits] = useState([]);
  const [selSubj, setSelSubj] = useState("");
  const [prompt, setPrompt] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedNotesContent, setSelectedNotesContent] = useState({});
  const fetchingUnits = useRef(new Set());
  const isLight = theme === "light";

  const cls = {
    bg: isLight ? "bg-gray-100" : "bg-gray-900",
    card: isLight ? "bg-white" : "bg-[#1e1e1e]",
    border: isLight ? "border-gray-200" : "border-gray-700",
    text: isLight ? "text-gray-900" : "text-white",
    muted: isLight ? "text-gray-600" : "text-gray-400",
    hover: isLight ? "hover:bg-gray-100" : "hover:bg-gray-700",
  };

  const extractMarkdownContent = (noteObj) => {
    if (!noteObj?.content && typeof noteObj !== "string") return "";
    const content = typeof noteObj === "string" ? noteObj : noteObj.content;
    return content
      .replace(
        /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<\/?[^>]+(>|$)/gi,
        ""
      )
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/\n\s*\n/g, "\n")
      .trim()
      .replace(/^Data Structures\s*$/gm, "## Data Structures")
      .replace(/^(\s*-|\d+\.\s)/gm, "  - ");
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!subjects.length) fetchSubjects();
  }, [subjects, fetchSubjects]);

  useEffect(() => {
    if (note && fetchingUnits.current.size) {
      const unitId = Array.from(fetchingUnits.current)[0];
      setSelectedNotesContent((prev) => ({
        ...prev,
        [unitId]: extractMarkdownContent(note),
      }));
      fetchingUnits.current.delete(unitId);
    }
  }, [note]);

  useEffect(() => {
    if (units.length && !selUnits.length) {
      const first = [...units].sort(
        (a, b) => parseFloat(a.unit || 9999) - parseFloat(b.unit || 9999)
      )[0];
      if (first?.docId) {
        fetchingUnits.current.add(first.docId);
        fetchNote(first);
        setSelUnits([first.docId]);
      }
    }
  }, [units, selUnits.length, fetchNote]);

  const handleUnitClick = useCallback(
    (unitObj) => {
      const unitId = unitObj.docId;
      setSelUnits((prev) =>
        prev.includes(unitId)
          ? prev.filter((id) => id !== unitId)
          : [...prev, unitId]
      );
      if (!selectedNotesContent[unitId] && !fetchingUnits.current.has(unitId)) {
        fetchingUnits.current.add(unitId);
        fetchNote(unitObj);
      }
      if (isMobile) setShowSidebar(false);
    },
    [fetchNote, isMobile, selectedNotesContent]
  );

  const handleSubjectChange = (e) => {
    const subjValue = e.target.value;
    const subj = subjects.find(
      (s) =>
        (typeof s === "string" ? s : s.subjectName || s.name || s) === subjValue
    );
    setSelSubj(subjValue);
    setSelUnits([]);
    setSelectedNotesContent({});
    if (subj) fetchUnits(subj);
  };

  const handleGenerate = () => {
    if (selSubj && selUnits.length) {
      // Concatenate all selected notes content into a single string
      const notesContent = selUnits
        .map((unitId) => selectedNotesContent[unitId] || "")
        .filter(Boolean)
        .join("\n\n");
      if (notesContent) {
        generateTheoryContent(selSubj, notesContent, prompt);
      } else {
        console.error("No notes content available for selected units.");
      }
    }
  };

  const sortedUnits = [...units].sort(
    (a, b) => parseFloat(a.unit || 9999) - parseFloat(b.unit || 9999)
  );

  const getHeading = (unitObj) => {
    const unitNum = unitObj.unit || "???";
    const heading = unitObj.heading || "Untitled";
    return heading.startsWith(unitNum)
      ? `Unit ${unitNum}: ${heading
          .replace(unitNum, "")
          .replace(/^[:.\s-]+/, "")
          .trim()}`
      : `Unit ${unitNum}: ${heading}`;
  };

  const selUnitObjs = sortedUnits.filter((unit) =>
    selUnits.includes(unit.docId)
  );
  const genratepdf = () => {
    setCreatepdf(true);
  };

  return (
    <div className={`min-h-screen ${cls.bg}`}>
      <div className="flex h-screen">
        {isMobile && showSidebar && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowSidebar(false)}
          />
        )}
        <div
          className={`${
            isMobile ? "fixed left-0 top-0 z-50" : "relative"
          } h-full transition-all duration-300 ${
            showSidebar
              ? isMobile
                ? "w-[85vw] max-w-[320px]"
                : "w-[280px]"
              : isMobile
              ? "-translate-x-full w-[85vw] max-w-[320px]"
              : "w-0"
          } ${cls.card} ${cls.border} border-r shadow-lg overflow-hidden`}
        >
          <div className="h-full flex flex-col">
            <div className="pt-2">
              {isMobile && (
                <button
                  onClick={() => setShowSidebar(false)}
                  className={`p-2 rounded-md ${cls.hover}`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className={`${isMobile ? "pt-4" : "pt-0"}`}>
              <div className="p-[2px] rounded-md bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-800 animate-pulse">
                <select
                  onChange={handleSubjectChange}
                  value={selSubj}
                  className={`w-full p-3 rounded-md text-sm appearance-none focus:outline-none ${cls.card} ${cls.text}`}
                >
                  <option value="" disabled hidden>
                    -- Select Subject --
                  </option>
                  {subjects.map((subj, idx) => (
                    <option key={idx} value={subj}>
                      {{
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
                      }[subj] || subj}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-medium px-2 ${cls.muted}`}>
                  Units ({selUnits.length} selected)
                </h3>
                {selUnits.length > 0 && (
                  <button
                    onClick={() => {
                      setSelUnits([]);
                      setSelectedNotesContent({});
                    }}
                    className={`text-xs px-2 py-1 rounded ${
                      isLight
                        ? "text-red-600 hover:bg-red-50"
                        : "text-red-400 hover:bg-red-900/20"
                    }`}
                  >
                    Clear all
                  </button>
                )}
              </div>
              <ul className="space-y-1 ps-1 m-0">
                {sortedUnits.map((unit, idx) => {
                  const unitId = unit.docId || `unit-${idx}`;
                  const isSelected = selUnits.includes(unitId);
                  return (
                    <li
                      key={unitId}
                      onClick={() => handleUnitClick(unit)}
                      className={`cursor-pointer px-3 py-2 rounded-md text-left text-sm transition-colors border border-transparent ${
                        isSelected
                          ? isLight
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-blue-800 text-blue-100 border-blue-600"
                          : isLight
                          ? "text-gray-700 hover:bg-gray-100 hover:border-gray-200"
                          : "text-gray-300 hover:bg-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{getHeading(unit)}</span>
                        {isSelected && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isLight
                                ? "bg-blue-200 text-blue-800"
                                : "bg-blue-700 text-blue-100"
                            }`}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className={`p-2 rounded-md ${cls.hover}`}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 pt-1 h-full min-h-0">
            <div className="h-full overflow-auto">
              <div
                className={`${cls.card} rounded-lg shadow-md p-3 flex flex-col min-h-0`}
              >
                <div className="flex items-center gap-2">
                  <input
                    className={`flex-[3] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight
                        ? "border-gray-300 bg-white text-gray-900"
                        : "border-gray-600 bg-gray-800 text-white"
                    }`}
                    placeholder="Enter a prompt (optional)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <button
                    className="flex-[1] px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    onClick={handleGenerate}
                    disabled={!selSubj || !selUnits.length}
                  >
                    Generate
                  </button>
                </div>

                <div className={`${cls.card} mt-3`}>
                  {selUnitObjs.length ? (
                    <div className="flex flex-wrap gap-1">
                      {selUnitObjs.map((unit) => (
                        <div
                          key={unit.docId}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.8rem] ${
                            isLight
                              ? "bg-blue-50 border border-blue-200 text-blue-900"
                              : "bg-blue-900/20 border border-blue-800 text-blue-200"
                          }`}
                        >
                          <span>{getHeading(unit)}</span>
                          <button
                            onClick={() => {
                              setSelUnits((prev) =>
                                prev.filter((id) => id !== unit.docId)
                              );
                              setSelectedNotesContent((prev) => {
                                const newContent = { ...prev };
                                delete newContent[unit.docId];
                                return newContent;
                              });
                            }}
                            className={
                              isLight
                                ? "text-red-600 hover:bg-red-100"
                                : "text-red-400 hover:bg-red-900/30"
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-xs ${cls.muted}`}>No units selected</p>
                  )}
                </div>
                {generatedContent && (
                  <div className="mt-6 p-6 rounded-lg shadow-sm border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-600 flex-1 overflow-auto">
                    <div className="flex justify-between items-center mb-5">
                      <h2 className="text-xl font-semibold text-[#1F2A44]">
                        Question Paper
                      </h2>
                      <button
                        onClick={genratepdf}
                        className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1D4ED8] transition-colors duration-200"
                      >
                        Generate PDF
                      </button>
                    </div>

                    <div className="space-y-6 text-left dark:text-gray-900 text-base">
                      {generatedContent.split("\n\n").map((section, idx) => (
                        <div key={idx} className="space-y-3">
                          {section.split("\n").map((line, i) => {
                            // Highlight code blocks
                            if (line.startsWith("```")) {
                              return (
                                <pre
                                  key={i}
                                  className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md text-sm font-mono text-[#1F2A44] dark:text-gray-200 overflow-auto"
                                >
                                  {line.replace(/```/g, "")}
                                </pre>
                              );
                            }
                            return (
                              <p
                                key={i}
                                className="leading-relaxed tracking-wide"
                              >
                                {line}
                              </p>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Theorypaper;
