import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Award, Clock, TrendingUp } from 'lucide-react';

const CustomQuizPage = () => {
  // Mock data based on your API structure
  const [quizData] = useState({
    mcqData: [
      {
        question: "What is the output of the following code? Integer a = 127; Integer b = 127; System.out.println(a == b);",
        options: ["true", "false", "Compile-time error", "Runtime exception"],
        correctAnswer: 0
      },
      {
        question: "Which of the following is NOT a primitive data type in Java?",
        options: ["int", "String", "boolean", "char"],
        correctAnswer: 1
      },
      {
        question: "What does JVM stand for?",
        options: ["Java Virtual Machine", "Java Variable Method", "Java Version Manager", "Java Visual Model"],
        correctAnswer: 0
      },
      {
        question: "Which keyword is used to inherit a class in Java?",
        options: ["implements", "extends", "inherits", "super"],
        correctAnswer: 1
      },
      {
        question: "What is the default value of a boolean variable in Java?",
        options: ["true", "false", "null", "0"],
        correctAnswer: 1
      }
    ]
  });

  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizStartTime] = useState(new Date());

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!quizData?.mcqData) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    quizData.mcqData.forEach((mcq, index) => {
      if (selectedAnswers[index] === mcq.correctAnswer) {
        correct++;
      }
    });
    return { 
      correct, 
      total: quizData.mcqData.length, 
      percentage: Math.round((correct / quizData.mcqData.length) * 100) 
    };
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

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Quiz...</h2>
          <p className="text-gray-500">Preparing your questions</p>
        </div>
      </div>
    );
  }

  const totalQuestions = quizData.mcqData?.length || 0;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  const score = calculateScore();

  return (
 <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-left ">
      <div className="max-w-9xl mx-auto ">
        
        {/* Header with Progress */}
         

        {/* Results Summary (only shown after submission) */}
        {showResults && (
          <div className={` p-4 rounded-xl border-2  ${getScoreBg(score.percentage)}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Award className={`w-5 h-5 ${getScoreColor(score.percentage)}`} />
                  <span className={`text-lg font-bold ${getScoreColor(score.percentage)}`}>
                    {score.percentage}% ({score.correct}/{score.total})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">
                    {score.percentage >= 80 ? 'Excellent!' : 
                     score.percentage >= 60 ? 'Good Job!' : 
                     score.percentage >= 40 ? 'Keep Practicing!' : 'Need More Practice'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setShowResults(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </button>
            </div>
          </div>
        )}

        {/* Questions */}
        {quizData.mcqData && quizData.mcqData.length > 0 ? (
          <div className="bg-white  shadow-lg  border-gray-100 overflow-hidden">
            {quizData.mcqData.map((mcq, questionIndex) => {
              const isAnswered = selectedAnswers.hasOwnProperty(questionIndex);
              const selectedOption = selectedAnswers[questionIndex];
              const isCorrect = showResults && selectedOption === mcq.correctAnswer;
              const isWrong = showResults && selectedOption !== mcq.correctAnswer && isAnswered;

              return (
                <div key={questionIndex} className="border-b border-gray-100 last:border-b-0">
                  <div className="p-1 ps-3">
                    <div className="flex items-start gap-3 ">
                      <div className={`w-7 h-7 mt-3 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                        isCorrect ? 'bg-emerald-500 text-white' :
                        isWrong ? 'bg-red-500 text-white' :
                        isAnswered ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {questionIndex + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-800 mb-1 ">{mcq.question}</h3>
                        {showResults && (
                          <div className="flex items-center gap-2 mb-2">
                            {isCorrect ? (
                              <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Correct
                              </div>
                            ) : isWrong ? (
                              <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                                <XCircle className="w-4 h-4" />
                                Incorrect
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">Not answered</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-12">
                      {mcq.options.map((option, optionIndex) => {
                        const isSelected = selectedAnswers[questionIndex] === optionIndex;
                        const isCorrectOption = showResults && optionIndex === mcq.correctAnswer;
                        const isWrongSelection = showResults && isSelected && optionIndex !== mcq.correctAnswer;

                        return (
                          <button
                            key={optionIndex}
                            onClick={() => !showResults && handleAnswerSelect(questionIndex, optionIndex)}
                            disabled={showResults}
                            className={`w-full text-left p-3 rounded-lg border-2 flex items-center gap-2 text-sm transition-all duration-200 ${
                              showResults
                                ? isCorrectOption
                                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                                  : isWrongSelection
                                    ? 'border-red-400 bg-red-50 text-red-800'
                                    : 'border-gray-200 bg-gray-50 text-gray-600'
                                : isSelected
                                  ? 'border-blue-400 bg-blue-50 text-blue-800 scale-[1.02]'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-[1.01]'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                              showResults
                                ? isCorrectOption
                                  ? 'bg-emerald-500 text-white border-emerald-500'
                                  : isWrongSelection
                                    ? 'bg-red-500 text-white border-red-500'
                                    : 'bg-white text-gray-500 border-gray-300'
                                : isSelected
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'bg-white text-gray-500 border-gray-300'
                            }`}>
                              {String.fromCharCode(65 + optionIndex)}
                            </div>
                            <span className="flex-1">{option}</span>
                            {showResults && isCorrectOption && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                            {showResults && isWrongSelection && <XCircle className="w-4 h-4 text-red-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Submit Button */}
            {!showResults && (
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="text-center">
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={answeredQuestions === 0}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      answeredQuestions === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg'
                    }`}
                  >
                    Submit Quiz ({answeredQuestions}/{totalQuestions})
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No Questions Available</h3>
            <p className="text-gray-600 text-sm">This quiz doesn't contain any questions yet.</p>
          </div>
        )}
      </div>
    </div></>
  );
};

export default CustomQuizPage;