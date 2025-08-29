import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Plus,
} from "lucide-react";

// Convert string to hex
const stringToHex = (str) =>
  str
    .split("")
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");

// Convert hex to string
const hexToString = (hex) => {
  try {
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  } catch (err) {
    return hex; // Return original if conversion fails
  }
};

// Check if already in hex
const isHex = (str) => /^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0;

const CreateMcqTestPage = () => {
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEditTest, setCurrentEditTest] = useState(null);
  const [testName, setTestName] = useState("");
  const [subject, setSubject] = useState("java");
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [recentlyCreatedLink, setRecentlyCreatedLink] = useState(null);
  const [copiedStates, setCopiedStates] = useState({});
  const [aimcq, setAimcq] = useState([]);
  const [genratedmcq, setGenratedmcq] = useState([]);
  const API_BASE = "https://api-e5q6islzdq-uc.a.run.app";

  const fetchTests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/alltests`);
      const groupedData = res.data;
      const allTests = [];
      for (const subject in groupedData) {
        groupedData[subject].forEach((test) => {
          allTests.push({
            testId: test.id,
            testName: test.testName,
            subject,
          });
        });
      }
      setTests(allTests);
    } catch (err) {
      console.error("Failed to fetch tests:", err);
      alert("Failed to fetch tests from server");
    }
  };

  const fetchTestDetails = async (subject, testId) => {
    try {
      const res = await axios.get(`${API_BASE}/test/${subject}/${testId}`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch test details:", err);
      alert("Failed to fetch test details");
      return null;
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      setLoadingTests(true);
      await fetchTests();
      setLoadingTests(false);
    };
    initialFetch();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTests();
    setRefreshing(false);
  };

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
      const transformedData = mcqData.map((q, index) => {
        if (
          typeof q.question !== "string" ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          typeof q.answer !== "string" ||
          typeof q.subtopic !== "string"
        ) {
          throw new Error("Invalid MCQ format");
        }
        return {
          id: q.id || `q${index + 1}`,
          subtopic: q.subtopic,
          question: isHex(q.question) ? q.question : stringToHex(q.question),
          options: q.options.map((opt) =>
            isHex(opt) ? opt : stringToHex(opt)
          ),
          answer: isHex(q.answer) ? q.answer : stringToHex(q.answer),
        };
      });

      const response = await axios.post(`${API_BASE}/create`, {
        subject,
        testName,
        mcqData: transformedData,
      });

      setRecentlyCreatedLink(response.data.link);
      setJsonInput("");
      setTestName("");
      setSubject("java");
    } catch (err) {
      console.error("Failed to create test:", err);
      alert("Invalid JSON format or server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setShowForm(false);
    setEditMode(false);
    setCurrentEditTest(null);
    setRecentlyCreatedLink(null);
    setTestName("");
    setSubject("java");
    setJsonInput("");
    await handleRefresh();
  };

  const handleDelete = async (subject, testId) => {
    if (!confirm("Are you sure you want to delete this test?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/delete/${subject}/${testId}`);
      setTests((prevTests) =>
        prevTests.filter(
          (test) => !(test.testId === testId && test.subject === subject)
        )
      );
      alert("Test deleted successfully!");
    } catch (err) {
      console.error("Failed to delete test:", err);
      alert("Failed to delete the test.");
      await handleRefresh();
    }
  };

  const handleCopyLink = async (testId, subject) => {
    try {
      const link = `${window.location.origin}/dashboard/customquiz/${subject}/${testId}`;
      await navigator.clipboard.writeText(link);

      setCopiedStates((prev) => ({ ...prev, [testId]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [testId]: false }));
      }, 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = `${window.location.origin}/dashboard/customquiz/${subject}/${testId}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopiedStates((prev) => ({ ...prev, [testId]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [testId]: false }));
      }, 2000);
    }
  };

  const handleUpdate = async (testId, subject) => {
    try {
      setLoadingEdit(true);
      const testDetails = await fetchTestDetails(subject, testId);

      if (testDetails) {
        setCurrentEditTest({ testId, subject });
        setEditMode(true);
        setShowForm(true);

        // Pre-populate form with existing data (convert hex to string for display)
        setTestName(testDetails.testName || "");
        setSubject(subject);

        // Convert mcqData from hex to string for editing
        if (testDetails.mcqData && Array.isArray(testDetails.mcqData)) {
          const readableData = testDetails.mcqData.map((q) => ({
            id: q.id,
            subtopic: q.subtopic,
            question: isHex(q.question) ? hexToString(q.question) : q.question,
            options: q.options.map((opt) =>
              isHex(opt) ? hexToString(opt) : opt
            ),
            answer: isHex(q.answer) ? hexToString(q.answer) : q.answer,
          }));
          setJsonInput(JSON.stringify(readableData, null, 2));
        } else {
          setJsonInput("");
        }
      }
    } catch (err) {
      console.error("Failed to load test for editing:", err);
      alert("Failed to load test details for editing.");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleSaveUpdate = async () => {
    if (!currentEditTest) return;

    setLoading(true);
    try {
      const updateData = {};

      // Add testName if changed
      const originalTest = tests.find(
        (t) =>
          t.testId === currentEditTest.testId &&
          t.subject === currentEditTest.subject
      );
      if (testName !== originalTest?.testName) {
        updateData.testName = testName;
      }

      // Add mcqData if provided and changed
      if (jsonInput.trim()) {
        const newMcqData = JSON.parse(jsonInput);
        if (!Array.isArray(newMcqData) || newMcqData.length === 0) {
          alert("MCQ data must be a non-empty array");
          return;
        }

        const transformedData = newMcqData.map((q, index) => {
          if (
            typeof q.question !== "string" ||
            !Array.isArray(q.options) ||
            q.options.length !== 4 ||
            typeof q.answer !== "string" ||
            typeof q.subtopic !== "string"
          ) {
            throw new Error("Invalid MCQ format");
          }
          return {
            id: q.id || `q${index + 1}`,
            subtopic: q.subtopic,
            question: isHex(q.question) ? q.question : stringToHex(q.question),
            options: q.options.map((opt) =>
              isHex(opt) ? opt : stringToHex(opt)
            ),
            answer: isHex(q.answer) ? q.answer : stringToHex(q.answer),
          };
        });

        // Compare with original mcqData to detect changes
        const originalDetails = await fetchTestDetails(
          currentEditTest.subject,
          currentEditTest.testId
        );
        const originalMcqData = originalDetails.mcqData || [];
        const hasMcqChanges =
          JSON.stringify(transformedData) !== JSON.stringify(originalMcqData);

        if (hasMcqChanges) {
          updateData.mcqData = transformedData;
        }
      }

      if (Object.keys(updateData).length === 0) {
        alert("No changes detected");
        return;
      }

      await axios.patch(
        `${API_BASE}/update/${currentEditTest.subject}/${currentEditTest.testId}`,
        updateData
      );

      // Update local state
      if (updateData.testName) {
        setTests((prevTests) =>
          prevTests.map((test) =>
            test.testId === currentEditTest.testId &&
            test.subject === currentEditTest.subject
              ? { ...test, testName: updateData.testName }
              : test
          )
        );
      }

      alert("Test updated successfully!");
      handleCancel();
    } catch (err) {
      console.error("Failed to update test:", err);
      alert("Failed to update the test. Please check your data format.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRecentLink = async () => {
    try {
      await navigator.clipboard.writeText(recentlyCreatedLink);
      setCopiedStates((prev) => ({ ...prev, recent: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, recent: false }));
      }, 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = recentlyCreatedLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopiedStates((prev) => ({ ...prev, recent: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, recent: false }));
      }, 2000);
    }
  };

  //ai mcq genrator

  const fetchAIMCQs = async (question) => {
    if (!question) return;

    try {
      const res = await axios.post(`${API_BASE}/api/ask-ai`, { question });

      let aiAnswer = res.data.answer;

      // Try parsing AI response to JSON
      try {
        aiAnswer = JSON.parse(aiAnswer);
      } catch (parseErr) {
        console.warn("AI response is not valid JSON:", parseErr);
        // Keep as string if parsing fails
      }

      setAimcq(aiAnswer);
    } catch (err) {
      console.error("Failed to fetch AI MCQs:", err);
      alert("Failed to generate MCQs from AI");
    }
  };

  const handleGenerateMCQs = async () => {
    if (!subject) {
      alert("Please enter the subject at the top first!");
      return;
    }
    if (!aimcq) {
      alert("Please enter a prompt for AI MCQ generation");
      return;
    }

    const question = `${subject}: ${aimcq}`; // Combine subject + user prompt
    await fetchAIMCQs(question, setGenratedmcq);
    console.log("AI MCQs:", genratedmcq);
  };

  return (
    <div>
      <div className="flex justify-between items-center"></div>

      {/* Show recently created link only when in Add Test mode */}
      {showForm && recentlyCreatedLink && (
        <div className="mt-4 p-4 border rounded-md bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-semibold">
                Test Created Successfully!
              </p>
              <p className="text-sm text-green-600 break-all">
                {recentlyCreatedLink}
              </p>
            </div>
            <button
              onClick={handleCopyRecentLink}
              className="ml-4 p-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              {copiedStates.recent ? <Check size={16} /> : <Copy size={16} />}
              {copiedStates.recent ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {!showForm && !editMode && (
        <div className="p-6">
          <div className="flex gap-2 justify-end">
            {!showForm && !editMode && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-gray-600 text-white px-4 py-2 rounded-md shadow hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2 relative group"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />

                {/* Tooltip */}
                <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Refresh
                </span>
              </button>
            )}
            <button
              onClick={() => {
                if (showForm || editMode) {
                  handleCancel();
                } else {
                  setShowForm(true);
                  setRecentlyCreatedLink(null);
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 flex items-center relative group"
            >
              {showForm || editMode ? "Cancel" : <Plus />}

              {/* Tooltip */}
              {!showForm && !editMode && (
                <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Add test
                </span>
              )}
            </button>
          </div>
          {loadingTests ? (
            <p className="text-gray-500">Loading tests...</p>
          ) : tests.length === 0 ? (
            <p className="text-gray-500">No tests available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {tests.map((test) => (
                <div
                  key={test.testId}
                  className="relative border p-4 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow"
                >
                  <div className="absolute top-2 right-2 flex gap-2">
                    <a
                      href={`/dashboard/customquiz/${test.subject}/${
                        test.testId || ""
                      }`}
                      className="p-2 border rounded-full flex items-center justify-center hover:bg-purple-100 transition"
                    >
                      <Eye size={16} className="text-purple-600" />
                    </a>
                    <button
                      className="p-2 border rounded-full flex items-center justify-center hover:bg-green-100 transition"
                      onClick={() => handleUpdate(test.testId, test.subject)}
                      title="Edit test"
                      disabled={loadingEdit}
                    >
                      <Edit size={16} className="text-green-600" />
                    </button>
                    <button
                      className="p-2 border rounded-full flex items-center justify-center hover:bg-blue-100 transition"
                      onClick={() => handleCopyLink(test.testId, test.subject)}
                      title="Copy and share test link"
                    >
                      {copiedStates[test.testId] ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Share2 size={16} className="text-blue-600" />
                      )}
                    </button>
                    <button
                      className="p-2 border rounded-full flex items-center justify-center hover:bg-red-100 transition"
                      onClick={() => handleDelete(test.subject, test.testId)}
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold text-purple-700 mt-6">
                    {test.testName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Subject: <span className="font-medium">{test.subject}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(showForm || editMode) && (
    <div className="grid grid-cols-1 gap-4 p-4">
  <input
    type="text"
    placeholder="Enter Test Name"
    value={testName}
    onChange={(e) => setTestName(e.target.value)}
    className="p-2 border rounded-md"
  />
  <input
    type="text"
    placeholder="Enter Subject"
    value={subject}
    onChange={(e) => setSubject(e.target.value)}
    className="p-2 border rounded-md"
    disabled={editMode}
  />

  {/* Optional AI MCQ generator */}
  <div className="flex gap-2 items-center">
    <input
      type="text"
      placeholder="Optional: enter what MCQs to generate (AI)"
      value={aimcq}
      onChange={(e) => setAimcq(e.target.value)}
      className="p-2 border rounded-md flex-1"
    />
    <button
      onClick={handleGenerateMCQs}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow flex items-center gap-2 transition"
    >
      <Plus size={16} />
      Generate MCQs
    </button>
  </div>

  {/* Textarea for MCQs (AI generated or manual) */}
  <textarea
    rows="12"
    placeholder={
      editMode
        ? "Edit MCQ data (shown as readable text, will be stored as hex)"
        : `Optional: enter your MCQs manually in this JSON format:
[
  {
    "id": "q1",
    "subtopic": "loops",
    "question": "What is a loop in Java?",
    "options": ["Condition", "Function", "Loop", "Array"],
    "answer": "Loop"
  },
  {
    "id": "q2",
    "subtopic": "datatypes",
    "question": "Which is not a Java primitive type?",
    "options": ["int", "float", "boolean", "string"],
    "answer": "string"
  }
]`
    }
    value={JSON.stringify(genratedmcq, null, 2)} // Show generated MCQs here
    readOnly
    className="p-2 border rounded-md font-mono"
  ></textarea>

  {/* Create / Save button */}
  <button
    onClick={editMode ? handleSaveUpdate : handleCreateTest}
    disabled={loading || loadingEdit}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow disabled:opacity-50 transition"
  >
    {loading || loadingEdit
      ? editMode
        ? "Saving..."
        : "Creating..."
      : editMode
      ? "Save Changes"
      : "Create Test"}
  </button>
</div>

      )}

      {loadingEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md">
            <p className="text-gray-700">Loading test details...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMcqTestPage;
