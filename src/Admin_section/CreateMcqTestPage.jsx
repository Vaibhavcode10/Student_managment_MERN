import React, { useState } from "react";
import { Plus, X, Calendar, ExternalLink, Copy, CheckCircle, Book, FileText, Link2 } from "lucide-react";

const CreateMcqTestPage = () => {
  const [tests, setTests] = useState([
    { testName: "Java Summer Test", createdAt: "2025-07-30", docId: "123abc" },
    { testName: "React Test", createdAt: "2025-07-30", docId: "456def" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [testName, setTestName] = useState("");
  const [subject, setSubject] = useState("java");
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreateTest = async () => {
    setLoading(true);
    try {
      if (!subject || !testName || !jsonInput) {
        alert("Please fill in all fields");
        return;
      }

      const mcqData = JSON.parse(jsonInput);

      if (!Array.isArray(mcqData) || mcqData.length === 0) {
        alert("MCQ data must be a non-empty array");
        return;
      }

      for (let q of mcqData) {
        if (
          typeof q.question !== "string" ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          typeof q.correctAnswer !== "string"
        ) {
          alert("Each MCQ must have a question, 4 options, and a correctAnswer");
          return;
        }
      }

      // Simulate API call
      const mockResponse = {
        link: `https://yourapp.com/dashboard/customquiz/${subject}/${Date.now()}`
      };
      
      setCreatedLink(mockResponse.link);
      
      // Add to tests list
      const newTest = {
        testName,
        createdAt: new Date().toISOString().split('T')[0],
        docId: Date.now().toString()
      };
      setTests(prev => [newTest, ...prev]);
      
      // Reset form
      setTestName("");
      setJsonInput("");
      
    } catch (err) {
      console.error("Failed to create test:", err);
      alert("Something went wrong. Possibly invalid JSON or server issue.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (createdLink) {
      try {
        await navigator.clipboard.writeText(createdLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Management</h1>
            <p className="text-gray-600">Create and manage your MCQ tests</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setCreatedLink(null);
              setCopied(false);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:scale-105 ${
              showForm 
                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? "Cancel" : "Create New Test"}
          </button>
        </div>

        {/* Success Message with Link */}
        {createdLink && (
          <div className="mb-8 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-emerald-800 mb-2">Test Created Successfully! 🎉</h3>
                <p className="text-emerald-700 mb-4">Your test is ready and can be accessed using the link below:</p>
                
                <div className="bg-white rounded-xl border-2 border-emerald-300 p-4 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Link2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">Test Link:</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-700 break-all">
                    {createdLink}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      copied 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white text-emerald-700 border-2 border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  
                  <a
                    href={createdLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Test
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test List Section */}
        {!showForm && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Recent Tests</h2>
              <span className="text-sm text-gray-500">{tests.length} tests</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Test #{i + 1}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{test.testName}</h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(test.createdAt)}</span>
                  </div>
                  
                  <a
                    href={`/dashboard/customquiz/${subject}/${test.docId}`}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Test
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Test Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Create New Test</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Test Name</label>
                <input
                  type="text"
                  placeholder="Enter test name (e.g., Java Basics Quiz)"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="Enter subject (e.g., java, react, python)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">MCQ Data (JSON Format)</label>
              <div className="relative">
                <textarea
                  rows="10"
                  placeholder={`Enter your MCQ data in JSON format. Example:
[
  {
    "question": "What is Java?",
    "options": ["Programming Language", "Coffee", "Island", "Framework"],
    "correctAnswer": "0"
  }
]`}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none font-mono text-sm resize-none"
                />
                <div className="absolute top-3 right-3">
                  <Book className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Make sure your JSON is valid and each question has exactly 4 options with correctAnswer as string index ("0", "1", "2", or "3")
              </p>
            </div>
            
            <button
              onClick={handleCreateTest}
              disabled={loading || !testName || !subject || !jsonInput}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                loading || !testName || !subject || !jsonInput
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:scale-[1.02] shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Test...
                </div>
              ) : (
                'Create Test'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateMcqTestPage;