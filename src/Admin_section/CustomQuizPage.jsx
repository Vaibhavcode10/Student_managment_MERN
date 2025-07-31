import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const CustomQuizPage = () => {
  const { subject, docId } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(
          `https://api-e5q6islzdq-uc.a.run.app/customquiz/${subject}/${docId}`
        );
        setQuizData(response.data);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    if (subject && docId) fetchQuiz();
  }, [subject, docId]);

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
    if (!quizData?.mcqData) return 0;
    let correct = 0;
    quizData.mcqData.forEach((mcq, index) => {
      if (selectedAnswers[index] === mcq.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quizData.mcqData.length) * 100);
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

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No Data State
  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Quiz Found</h2>
          <p className="text-gray-600">The quiz you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const totalQuestions = quizData.mcqData?.length || 0;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Quiz Assessment
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 capitalize">
            {quizData.subject} Quiz
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600 font-medium">{quizData.testName}</h2>
          
          {!showResults && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Progress</span>
                <span>{answeredQuestions}/{totalQuestions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h3>
              <p className="text-xl text-gray-600 mb-4">Your Score: <span className="font-bold text-green-600">{calculateScore()}%</span></p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{Object.values(selectedAnswers).filter((ans, idx) => ans === quizData.mcqData[idx]?.correctAnswer).length}</div>
                  <div className="text-sm text-gray-500">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{totalQuestions - Object.values(selectedAnswers).filter((ans, idx) => ans === quizData.mcqData[idx]?.correctAnswer).length}</div>
                  <div className="text-sm text-gray-500">Wrong</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Section */}
        {quizData.mcqData && quizData.mcqData.length > 0 ? (
          <div className="space-y-6">
            {quizData.mcqData.map((mcq, questionIndex) => {
              const isAnswered = selectedAnswers.hasOwnProperty(questionIndex);
              const selectedOption = selectedAnswers[questionIndex];
              const isCorrect = showResults && selectedOption === mcq.correctAnswer;
              const isWrong = showResults && selectedOption !== mcq.correctAnswer && isAnswered;

              return (
                <div
                  key={questionIndex}
                  className={`bg-white rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
                    isAnswered ? 'border-blue-200' : 'border-gray-200'
                  } ${isCorrect ? 'border-green-300 bg-green-50' : ''} ${isWrong ? 'border-red-300 bg-red-50' : ''}`}
                >
                  <div className="p-6 md:p-8">
                    {/* Question Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isCorrect ? 'bg-green-100 text-green-700' :
                        isWrong ? 'bg-red-100 text-red-700' :
                        isAnswered ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {questionIndex + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
                          {mcq.question}
                        </h3>
                        {showResults && (
                          <div className="mt-2 flex items-center gap-2">
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Correct
                              </span>
                            ) : isWrong ? (
                              <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Incorrect
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm">Not answered</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 ml-14">
                      {mcq.options.map((option, optionIndex) => {
                        const isSelected = selectedAnswers[questionIndex] === optionIndex;
                        const isCorrectOption = showResults && optionIndex === mcq.correctAnswer;
                        const isWrongSelection = showResults && isSelected && optionIndex !== mcq.correctAnswer;

                        return (
                          <button
                            key={optionIndex}
                            onClick={() => !showResults && handleAnswerSelect(questionIndex, optionIndex)}
                            disabled={showResults}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                              showResults
                                ? isCorrectOption
                                  ? 'border-green-300 bg-green-100 text-green-800'
                                  : isWrongSelection
                                  ? 'border-red-300 bg-red-100 text-red-800'
                                  : 'border-gray-200 bg-gray-50 text-gray-600'
                                : isSelected
                                ? 'border-blue-400 bg-blue-50 text-blue-800 shadow-md'
                                : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                            } ${!showResults ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                showResults
                                  ? isCorrectOption
                                    ? 'border-green-400 bg-green-400 text-white'
                                    : isWrongSelection
                                    ? 'border-red-400 bg-red-400 text-white'
                                    : 'border-gray-300 bg-white text-gray-500'
                                  : isSelected
                                  ? 'border-blue-400 bg-blue-400 text-white'
                                  : 'border-gray-300 bg-white text-gray-500'
                              }`}>
                                {String.fromCharCode(65 + optionIndex)}
                              </div>
                              <span className="font-medium">{option}</span>
                              {showResults && isCorrectOption && (
                                <svg className="w-5 h-5 text-green-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {showResults && isWrongSelection && (
                                <svg className="w-5 h-5 text-red-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </div>
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
              <div className="text-center pt-8">
                <button
                  onClick={handleSubmitQuiz}
                  disabled={answeredQuestions === 0}
                  className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg ${
                    answeredQuestions === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl'
                  }`}
                >
                  Submit Quiz ({answeredQuestions}/{totalQuestions} answered)
                </button>
              </div>
            )}

            {/* Retry Button */}
            {showResults && (
              <div className="text-center pt-8">
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setShowResults(false);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Retake Quiz
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Questions Available</h3>
            <p className="text-gray-600">This quiz doesn't contain any questions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomQuizPage;