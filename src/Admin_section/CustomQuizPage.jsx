import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, RotateCcw, Award, TrendingUp, Clock } from "lucide-react";

const CustomMcqPage = () => {
  const { subject, docId } = useParams();
  const [quizData, setQuizData] = useState({ mcqData: [], testName: "" });
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startTime] = useState(new Date());
  const [submitTime, setSubmitTime] = useState(null);

  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds

  useEffect(() => {
    if (submitted) return; // Stop the timer if quiz is submitted

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Optional: auto-submit quiz here
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [submitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const decodeIfHex = (value) => {
    if (!value || typeof value !== "string") return value;
    try {
      const decoded = decodeURIComponent(value.replace(/(..)/g, "%$1"));
      JSON.parse(JSON.stringify(decoded)); // sanity check
      return decoded;
    } catch {
      return value;
    }
  };

  useEffect(() => {
    const fetchMcqs = async () => {
      try {
        const res = await axios.get(
          `https://api-e5q6islzdq-uc.a.run.app/customquiz/${subject}/${docId}`
        );

        let mcqData = res.data.mcqData;

        if (typeof mcqData === "string") {
          const decoded = decodeIfHex(mcqData);
          mcqData = JSON.parse(decoded);
        }

        setQuizData({
          mcqData,
          testName: res.data.testName || subject
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load quiz data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMcqs();
  }, [subject, docId]);

  const handleOptionChange = (qIndex, option) => {
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setSubmitTime(new Date());
  };

  const handleRetake = () => {
    setSubmitted(false);
    setUserAnswers({});
    setSubmitTime(null);
  };

  const calculateResults = () => {
    const totalQuestions = quizData.mcqData.length;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;

    quizData.mcqData.forEach((q, index) => {
      const correctAnswer = decodeIfHex(q.answer || q.correctAnswer);
      const userAnswer = userAnswers[index];

      if (!userAnswer) {
        unanswered++;
      } else if (userAnswer === correctAnswer) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    });

    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered,
      percentage
    };
  };

  const getTimeTaken = () => {
    if (!submitTime) return '0m 0s';
    const diff = submitTime - startTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (percentage) => {
    if (percentage >= 80) return 'bg-emerald-50 border-emerald-200';
    if (percentage >= 60) return 'bg-blue-50 border-blue-200';
    if (percentage >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-700">🔄 Loading quiz...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-xl font-semibold text-red-600">{error}</p>
      </div>
    </div>
  );

  const results = calculateResults();
  const answeredQuestions = Object.keys(userAnswers).length;
  const progressPercentage = quizData.mcqData.length > 0 ? (answeredQuestions / quizData.mcqData.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-screen-2xl mx-auto ">

        {/* Header */}
        <div>
          {!submitted && (
            <div className="bg-white  p-3   ">
              <div className="flex items-center justify-between mb-2">
                {/* Left: Progress */}
                <span className="text-gray-600 font-medium">Progress</span>

                {/* Right: Answered + Timer */}
                <div className="flex items-center gap-3">
                  <span className="bg-white text-black font-bold text-xl px-3 py-1 rounded-2xl shadow-sm font-mono">
                    {formatTime(timeLeft)}
                  </span>

                  <span className="text-blue-600 font-bold">
                    {answeredQuestions}/{quizData.mcqData.length} answered
                  </span>

                </div>
              </div>


              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {submitted && (
          <div className={`mb-1 p-6 rounded-2xl border-2 ${getScoreBg(results.percentage)}`}>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Award className={`w-6 h-6 ${getScoreColor(results.percentage)}`} />
                  <span className={`text-2xl font-bold ${getScoreColor(results.percentage)}`}>
                    {results.percentage}%
                  </span>
                </div>
                <div className="text-gray-600">
                  <span className="font-semibold">{results.correctAnswers}/{results.totalQuestions}</span> correct
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{getTimeTaken()}</span>
                </div>
                <button
                  onClick={handleRetake}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-lg font-bold text-emerald-600">{results.correctAnswers}</span>
                </div>
                <div className="text-xs text-gray-600">Correct</div>
              </div>
              <div className="text-center bg-white/60 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-lg font-bold text-red-600">{results.incorrectAnswers}</span>
                </div>
                <div className="text-xs text-gray-600">Incorrect</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <span className="text-lg font-bold text-gray-600">{results.unanswered}</span>
                </div>
                <div className="text-xs text-gray-600">Skipped</div>
              </div>
            </div>

            {/* Performance Message */}
            <div className=" text-center">
              <span className={`text-sm font-medium ${getScoreColor(results.percentage)}`}>
                {results.percentage >= 90 ? '🎉 Outstanding! You have mastered this topic!' :
                  results.percentage >= 80 ? '👏 Excellent work! Great understanding shown!' :
                    results.percentage >= 70 ? '👍 Good job! You have a solid grasp of the material!' :
                      results.percentage >= 60 ? '📚 Not bad! Review the topics you missed!' :
                        '💪 Keep practicing! Review the material and try again!'}
              </span>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="grid grid-cols-1 gap-1 text-left">
          
          {quizData.mcqData.map((q, index) => {
            const question = decodeIfHex(q.question);
            const options = q.options.map(decodeIfHex);
            const correctAnswer = decodeIfHex(q.answer || q.correctAnswer);
            const isCorrect = submitted && userAnswers[index] === correctAnswer;
            const isWrong = submitted && userAnswers[index] && userAnswers[index] !== correctAnswer;

            return (
            <>
              <div
                key={index}
                className={`w-full    transition-all duration-300  ${submitted
                  ? isCorrect
                    ? "bg-green-50 border-green-200"
                    : isWrong
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                  : "bg-white border-gray-200"
                  }`}
              >
                
                <div className="text-xs text-gray-500 mb-1 text-end me-2">
                  ID: {q.id} &nbsp;&bull;&nbsp; Subtopic: {q.subtopic}
                </div>

                <div className="flex items-start gap-3  ms-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${submitted
                    ? isCorrect
                      ? 'bg-emerald-500 text-white'
                      : isWrong
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-400 text-white'
                    : userAnswers[index]
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }`}>
                    {index + 1}
                  </div>
                  <h2 className="text-base font-semibold text-gray-800 mt-1">
                    {question}
                  </h2>
                </div>

                {submitted && (
                  <div className="mb-2 ml-11">
                    {isCorrect ? (
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Correct Answer!
                      </div>
                    ) : isWrong ? (
                      <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Incorrect - Correct answer: {correctAnswer}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">Not answered - Correct answer: {correctAnswer}</div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 ms-2 me-2 pb-3">
                  {options.map((opt, i) => {
                    const isSelected = userAnswers[index] === opt;
                    const isCorrectOption = opt === correctAnswer;

                    return (
                      <label
                        key={i}
                        className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-colors ${submitted && isCorrectOption
                          ? "border-green-500 bg-green-100 text-green-800 font-semibold"
                          : submitted && isSelected && !isCorrectOption
                            ? "border-red-400 bg-red-100 text-red-700 line-through"
                            : isSelected
                              ? "border-blue-500 bg-blue-100 text-blue-800"
                              : "border-gray-300 hover:bg-gray-100"
                          }`}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={opt}
                          disabled={submitted}
                          checked={isSelected}
                          onChange={() => handleOptionChange(index, opt)}
                          className="mr-3 accent-blue-600"
                        />
                        <span>{opt}</span>
                        {submitted && isCorrectOption && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
                        {submitted && isSelected && !isCorrectOption && <XCircle className="w-4 h-4 text-red-600 ml-auto" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
            );
          })}
        </div>

        {!submitted && (
          <div className="text-center mt-3 mb-2.5">
            <button
              onClick={handleSubmit}
              disabled={answeredQuestions === 0}
              className={`px-8 py-3 text-lg font-medium rounded-lg shadow-md transition duration-300 ${answeredQuestions === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
            >
              Submit Quiz ({answeredQuestions}/{quizData.mcqData.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomMcqPage;