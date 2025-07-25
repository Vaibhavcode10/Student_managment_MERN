import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblems } from '../context/ProblemProvider';
import { useUser } from '../context/UserProvider'; // Assuming useUser is imported from the correct context

const InterviewPrep = () => {
  const { problems, loading } = useProblems();
  const { theme } = useUser(); // Get the theme from the user context
  const [searchType, setSearchType] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 });
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    if (!loading) {
      const filtered = problems.filter((prob) => {
        const typeMatch =
          searchType === "name"
            ? prob.header
            : searchType === "subject"
            ? prob.subject
            : prob.file_context;

        const matchesSearch = typeMatch
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const matchesSubject =
          !subjectFilter || prob.subject === subjectFilter;
        const matchesDifficulty =
          !difficultyFilter || prob.difficulty === difficultyFilter;

        return matchesSearch && matchesSubject && matchesDifficulty;
      });

      setFilteredProblems(filtered);

      const counts = { easy: 0, medium: 0, hard: 0 };
      filtered.forEach((p) => {
        const level = p.difficulty?.toLowerCase();
        if (level && counts[level] !== undefined) {
          counts[level]++;
        }
      });

      setStats(counts);
    }
  }, [searchTerm, searchType, subjectFilter, difficultyFilter, problems, loading]);

  const getThemeClass = (lightClass, darkClass) => {
    return theme === 'light' ? lightClass : darkClass;
  };

  return (
    <>
   <div className={`h-[100dvh] md:h-screen overflow-hidden bg-${getThemeClass('gray-100', 'gray-900')} text-${getThemeClass('black', 'white')} p-1 pt-0`}>
   {/* Back button – shown only on mobile */}
      <div className="mb-2 md:hidden px-2">
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-${getThemeClass('gray-200', 'gray-700')} text-${getThemeClass('black', 'white')} font-medium rounded-full shadow hover:bg-${getThemeClass('gray-300', 'gray-600')} transition-all duration-200`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      


      {/* Controls */}
      <div className={`mb-2 mt-2 bg-${getThemeClass('gray-200', 'gray-800')}/60 backdrop-blur-xl border border-${getThemeClass('gray-300', 'gray-700')} p-2 rounded-lg`}>
      
      {/* 🔘 Top Section: Filter Toggle + Stats */}
      <div className="flex justify-between items-center mb-1">
        <div className={`text-base text-${getThemeClass('purple-600', 'purple-400')} px-1`}>
          Showing <span className="font-semibold">{filteredProblems.length}</span> of <span className="font-semibold">{problems.length}</span> problems
        </div>

        <button
          onClick={() => setShowFilters(prev => !prev)}
          className="text-base px-3 py-1 rounded-md bg-purple-500 text-white hover:bg-purple-600 transition-all"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* 🧪 Filters Section */}
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems..."
            className={`w-full md:flex-1 px-3 py-2 text-base bg-${getThemeClass('white', 'gray-900')} border border-${getThemeClass('gray-300', 'gray-700')} rounded-md focus:ring-1 focus:ring-purple-500`}
          />

          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className={`w-full md:w-1/4 px-3 py-2 text-sm bg-${getThemeClass('white', 'gray-900')} border border-${getThemeClass('gray-300', 'gray-700')} rounded-md focus:ring-1 focus:ring-purple-500`}
          >
            <option value="name">By Name</option>
            <option value="subject">By Subject</option>
            <option value="platform">By Platform</option>
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className={`w-full md:w-1/4 px-3 py-2 text-sm bg-${getThemeClass('white', 'gray-900')} border border-${getThemeClass('gray-300', 'gray-700')} rounded-md focus:ring-1 focus:ring-purple-500`}
          >
            <option value="">All Subjects</option>
            <option value="Stack & Queue">Stack & Queue</option>
            <option value="Tree">Tree</option>
            <option value="Recursion & Backtracking">Recursion & Backtracking</option>
            <option value="String">String</option>
            <option value="Linked List">Linked List</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
            <option value="Greedy Algorithm">Greedy Algorithm</option>
            <option value="Binary Search">Binary Search</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className={`w-full md:w-1/4 px-3 py-2 text-sm bg-${getThemeClass('white', 'gray-900')} border border-${getThemeClass('gray-300', 'gray-700')} rounded-md focus:ring-1 focus:ring-purple-500`}
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      )}
    </div>


      {/* Scrollable Table Container */}
      <div className={`bg-${getThemeClass('gray-200', 'gray-800')}/60 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg`}>
        <div className="max-h-[120vh] overflow-y-auto mb-5">
          <table className="w-full table-auto text-lg">
            <thead className={`bg-${getThemeClass('gray-200', 'gray-800')} text-sm text-${getThemeClass('gray-600', 'gray-400')} uppercase sticky top-0 z-10`}>
              <tr>
                <th className="w-[5%] px-5 py-3 text-left">#</th>
                <th className={`${(subjectFilter || difficultyFilter || searchTerm) ? 'w-[35%]' : 'w-[45%]'} px-2 py-3 text-left`}>Problem</th>
                <th className={`${(subjectFilter || difficultyFilter || searchTerm) ? 'w-[25%]' : 'w-[30%]'} px-8 py-3 text-left`}>Subject</th>
                <th className={`${(subjectFilter || difficultyFilter || searchTerm) ? 'w-[15%]' : 'w-[20%]'} px-8 py-3 text-left`}>Difficulty</th>
               
                  <th className="w-[20%] px-4 py-3 text-center">Action</th>
                
              </tr>
            </thead>

            <tbody className={`divide-y divide-${getThemeClass('gray-300', 'gray-700')}`}>
              {filteredProblems.length > 0 ? (
                filteredProblems.map((prob, index) => (
                  <tr
                    key={prob.id}
                    className={`hover:bg-${getThemeClass('gray-200', 'gray-800')}/40 transition-all`}
                  >
                    {/* # */}
                    <td className="px-5 py-2 text-left">{index + 1}</td>

                    {/* Problem */}
                    <td className={`px-2 py-2 font-semibold text-${getThemeClass('black', 'purple-200')} text-left`}>
                      {prob.header}
                    </td>

                    {/* Subject */}
                    <td className={`px-8 py-2 font-medium text-${getThemeClass('gray-800', 'purple-400')} text-left`}>
                      {prob.subject}
                    </td>

                    {/* Difficulty */}
                    <td className="px-8 py-2 text-left">
                      <span
                        className={`text-sm font-semibold ${
                          prob.difficulty === 'Easy'
                            ? 'text-green-600'
                            : prob.difficulty === 'Medium'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {prob.difficulty}
                      </span>
                    </td>

                    {/* Action - Only show when filters are applied */}
               
                      <td className="px-4 py-2 text-center">
                        <a
                          href={prob.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-[6px] bg-${getThemeClass(
                            'purple-600',
                            'purple-500'
                          )} hover:bg-${getThemeClass(
                            'purple-700',
                            'purple-400'
                          )} text-white text-xs rounded-md`}
                        >
                          Solve
                        </a>
                      </td>
                   
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={(subjectFilter || difficultyFilter || searchTerm) ? "5" : "4"} className={`text-center py-6 text-${getThemeClass('gray-600', 'gray-400')}`}>
                    No problems found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default InterviewPrep;