import React, { useState } from "react";
import axios from "axios";

const CreateMcqTestPage = () => {
  const [tests, setTests] = useState([ // dummy recent test data
    { testName: "Java Summer Test", createdAt: "2025-07-30", docId: "123abc" },
    { testName: "React Test", createdAt: "2025-07-30", docId: "456def" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [testName, setTestName] = useState("");
  const [subject, setSubject] = useState("java");
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);
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

    const response = await axios.post("https://api-e5q6islzdq-uc.a.run.app/create", {
      subject,
      testName,
      mcqData,
    });

    const { link } = response.data;
    setCreatedLink(link);
  } catch (err) {
    console.error("Failed to create test:", err);
    alert("Something went wrong. Possibly invalid JSON or server issue.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Tests</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setCreatedLink(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow"
        >
          {showForm ? "Cancel" : "Add Test"}
        </button>
      </div>

      {/* Test List Section */}
      {!showForm && (
        <div className="grid grid-cols-1 gap-4">
          {tests.map((test, i) => (
            <div key={i} className="border p-4 rounded-md shadow">
              <h2 className="text-lg font-semibold">{test.testName}</h2>
              <p className="text-sm text-gray-600">Created: {test.createdAt}</p>
              <a
                href={`/dashboard/customquiz/${subject}/${test.docId}`}
                className="text-blue-500 hover:underline"
              >
                View Test
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Add Test Form */}
      {showForm && (
        <div className="grid grid-cols-1 gap-4">
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
          />
          <textarea
            rows="12"
            placeholder="Enter full JSON array here"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="p-2 border rounded-md font-mono"
          ></textarea>
          <button
            onClick={handleCreateTest}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700"
          >
            {loading ? "Creating..." : "Create Test"}
          </button>

          {createdLink && (
            <div className="mt-4 p-4 border rounded-md bg-gray-100">
              <p className="text-green-700 font-semibold">Test Created Successfully!</p>
              <p className="break-all text-blue-700">{createdLink}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateMcqTestPage;
