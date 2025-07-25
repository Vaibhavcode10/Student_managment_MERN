import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

// Mock theme provider
const useTheme = () => {
  const [theme, setTheme] = useState("light");
  return { theme, setTheme };
};

// Mock context for demonstration
const useProblems = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedMcqId, setSelectedMcqId] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  

  const getMockMcq = (id) => {
    const questions = [
      {
        question: "What is the correct way to declare a variable in C++?",
        code: `int main() {\n    // Which declaration is correct?\n    return 0;\n}`,
        options: {
          a: "int variable_name;",
          b: "variable_name int;",
          c: "declare int variable_name;",
          d: "var int variable_name;",
        },
        correct_answer: "a",
        explanation:
          "In C++, variables are declared with the data type followed by the variable name.",
      },
      {
        question: "Which loop guarantees at least one execution?",
        code: `for(int i=0; i<10; i++) { }\nwhile(condition) { }\ndo { } while(condition);`,
        options: {
          a: "for loop",
          b: "while loop",
          c: "do-while loop",
          d: "all loops guarantee execution",
        },
        correct_answer: "c",
        explanation:
          "The do-while loop executes the body at least once before checking the condition.",
      },
      {
        question: "What is the time complexity of binary search?",
        code: `int binarySearch(int arr[], int n, int x) {\n    int left = 0, right = n - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (arr[mid] == x) return mid;\n        if (arr[mid] < x) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}`,
        options: {
          a: "O(n)",
          b: "O(log n)",
          c: "O(n log n)",
          d: "O(1)",
        },
        correct_answer: "b",
        explanation:
          "Binary search divides the search space in half with each comparison.",
      },
    ];

    return questions[id % questions.length];
  };

  const currentMcq =
    selectedSubject && selectedMcqId ? getMockMcq(selectedMcqId) : null;

  return {
    selectedSubject,
    setSelectedSubject,
    selectedMcqId,
    setSelectedMcqId,
    currentMcq,
    mcqLoading: false,
    mcqError: null,
    selectedAnswer,
    setSelectedAnswer,
    showAnswer,
    setShowAnswer,
    clearMcqSelection: () => {
      setSelectedSubject(null);
      setSelectedMcqId(null);
      setSelectedAnswer(null);
      setShowAnswer(false);
    },
  };
};

export default function CompactMcqSelector() {
 
  const {
    selectedSubject,
    setSelectedSubject,
    selectedMcqId,
    setSelectedMcqId,
    currentMcq,
    selectedAnswer,
    setSelectedAnswer,
    showAnswer,
    setShowAnswer,
    theme, 
  
  } = useProblems();
  const navigate = useNavigate();
  
  const programmingLanguages = [
    "C Programming",
    "C++",
    "Java",
    "Python",
    "Pseudo Code",
  ];

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setSelectedMcqId(null);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  const handleMCQClick = (mcqNo) => {
    setSelectedMcqId(mcqNo);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    setShowAnswer(true);
  };

  const isCorrect = showAnswer && selectedAnswer === currentMcq?.correct_answer;

  // Theme classes
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-gray-900" : "bg-gray-50";
  const cardBgClass = isDark ? "bg-gray-800" : "bg-white";
  const textClass = isDark ? "text-gray-100" : "text-gray-900";
  const textSecondaryClass = isDark ? "text-gray-300" : "text-gray-600";
  const borderClass = isDark ? "border-gray-700" : "border-gray-200";

  // Generate 100 MCQ numbers
  const mcqNumbers = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className={`h-screen overflow-hidden ${bgClass} p-1 pt-0`}>
  <div className="h-full max-w-8xl mx-auto">
        {/* Ultra-Compact Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="w-full flex items-center justify-between ">
            {/* Left side - empty (you can use it later if needed) */}
            <div className="w-1/3"></div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-0 h-[calc(100vh-80px)]">
          {/* Left: MCQ Grid (25% width) */}
          <div className="col-span-2">
          <div className={`${cardBgClass} rounded border ${borderClass} p-2 w-full max-w-[300px] h-[80vh] flex flex-col`}>
  {/* 👉 Take Test Button */}
  <button
      onClick={() => navigate('/dashboard/test')}
      className="w-full mb-2 px-3 py-2 bg-white font-bold text-gray-800 border rounded hover:bg-blue-100 transition-all"
    >
      Take Test
    </button>


  {/* 👉 Subject Dropdown */}
  <select
    value={selectedSubject || ""}
    onChange={(e) => handleSubjectClick(e.target.value)}
    className={`w-full px-2 py-1 rounded text-sm font-medium border focus:outline-none ${
      isDark
        ? "bg-gray-700 text-gray-200 border-gray-600"
        : "bg-white text-gray-700 border-gray-300"
    }`}
  >
    <option value="" disabled>
      Select Subject
    </option>
    {programmingLanguages.map((lang) => (
      <option key={lang} value={lang}>
        {lang}
      </option>
    ))}
  </select>

  {/* 👉 MCQ Numbers Grid */}
  {selectedSubject ? (
    <div className="flex-1 overflow-y-auto scrollbar-custom mt-3 pr-1">
      <div className="grid grid-cols-5 gap-2">
        {mcqNumbers.map((num) => (
          <button
            key={num}
            onClick={() => handleMCQClick(num)}
            className={`w-10 h-10 rounded-full text-[15px] font-semibold flex items-center justify-center transition-all duration-150 ${
              selectedMcqId === num
                ? "bg-blue-500 text-white shadow-sm scale-105"
                : isDark
                ? "bg-gray-700 text-gray-200 hover:bg-blue-600 hover:text-white"
                : "bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center flex-1">
      <p className={`text-sm ${textSecondaryClass} text-center`}>
        Select a subject first
      </p>
    </div>
  )}
</div>

          </div>

          {/* Right: Main Content (75% width) */}
          <div className="col-span-10 flex flex-col">
            {currentMcq ? (
              <div
                className={`${cardBgClass} rounded border ${borderClass} flex-1 flex flex-col `}
              >
                {/* Question Header - Left-aligned & Larger */}
                <div
                  className={`px-4 py-2 border-b ${borderClass} ${
                    isDark ? "bg-gray-700/30" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-1 mt-3 bg-blue-500 text-white rounded text-xs font-bold">
                      Q{selectedMcqId}
                    </span>
                    <p
                      className={`text-base font-semibold ${textClass} text-left`}
                    >
                      {currentMcq.question}
                    </p>
                  </div>
                </div>

                {/* Code Block - Compact but readable */}
                {currentMcq.code && (
                  <div
                    className={`px-4 m-1 py-3 rounded-md ${
                      isDark
                        ? "bg-gray-800 text-gray-100"
                        : "bg-gray-200 text-gray-800"
                    } font-mono text-base border ${borderClass}`}
                  >
                    <pre className="whitespace-pre-wrap break-words leading-snug text-left">
                      <code>{currentMcq.code}</code>
                    </pre>
                  </div>
                )}

                {/* Options */}
                <div className="p-3 flex-1 flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {Object.entries(currentMcq.options).map(([key, value]) => {
                      const isSelected = selectedAnswer === key;
                      const isCorrectAnswer =
                        showAnswer && key === currentMcq.correct_answer;
                      const isWrongAnswer =
                        showAnswer &&
                        isSelected &&
                        key !== currentMcq.correct_answer;

                      return (
                        <button
                          key={key}
                          onClick={() => !showAnswer && handleAnswerClick(key)}
                          disabled={showAnswer}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md border text-[15px] font-medium transition-all duration-200 ${
                            isCorrectAnswer
                              ? "bg-green-100 border-green-500 text-green-800"
                              : isWrongAnswer
                              ? "bg-red-100 border-red-500 text-red-800"
                              : isSelected
                              ? isDark
                                ? "bg-blue-900/50 border-blue-500 text-blue-200"
                                : "bg-blue-50 border-blue-500 text-blue-700"
                              : isDark
                              ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-blue-500"
                              : "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                          } ${
                            showAnswer ? "cursor-default" : "cursor-pointer"
                          } shadow-sm hover:shadow-md active:scale-[0.98]`}
                        >
                          <span
                            className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                              isCorrectAnswer
                                ? "bg-green-500 text-white"
                                : isWrongAnswer
                                ? "bg-red-500 text-white"
                                : isSelected
                                ? "bg-blue-500 text-white"
                                : isDark
                                ? "bg-gray-600 text-gray-200"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {key.toUpperCase()}
                          </span>
                          <span className="flex-1 text-left">{value}</span>
                          {showAnswer && isCorrectAnswer && (
                            <span className="text-green-500 text-sm">✔</span>
                          )}
                          {showAnswer && isWrongAnswer && (
                            <span className="text-red-500 text-sm">✖</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Submit & Feedback */}
                  <div className="space-y-2">
                    {selectedAnswer && !showAnswer && (
                      <button
                        onClick={handleSubmitAnswer}
                        className="w-full py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition"
                      >
                        Submit Answer
                      </button>
                    )}

                    {showAnswer && (
                      <div
                        className={`p-3 rounded text-sm border ${
                          isCorrect
                            ? isDark
                              ? "bg-green-900/20 border-green-700 text-green-400"
                              : "bg-green-50 border-green-200 text-green-800"
                            : isDark
                            ? "bg-red-900/20 border-red-700 text-red-400"
                            : "bg-red-50 border-red-200 text-red-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span>{isCorrect ? "✅" : "❌"}</span>
                          <span className="font-bold">
                            {isCorrect ? "Correct!" : "Incorrect"}
                          </span>
                          {!isCorrect && (
                            <span>
                              Correct:{" "}
                              <strong>
                                {currentMcq.correct_answer.toUpperCase()}
                              </strong>
                            </span>
                          )}
                        </div>
                        {currentMcq.explanation && (
                          <p className="leading-snug">
                            <strong>💡</strong> {currentMcq.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`${cardBgClass} rounded border ${borderClass} flex-1 flex items-center justify-center`}
              >
                <div className="text-center">
                  <span className="text-4xl block mb-2">
                    {selectedSubject ? "💻" : "📚"}
                  </span>
                  <p className={`text-sm ${textSecondaryClass}`}>
                    {selectedSubject
                      ? "Select an MCQ number →"
                      : "Choose a subject above"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
