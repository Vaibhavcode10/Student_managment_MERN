import React, { useState, useEffect } from "react";
import axios from "axios";

// Helper function to convert string to hex
const stringToHex = (str) =>
  str
    .split("")
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");

// Check if string is already in hex
const isHex = (str) => /^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0;

const CreateMcqTestPage = () => {
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [testName, setTestName] = useState("");
  const [subject, setSubject] = useState("java");
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get("https://api-e5q6islzdq-uc.a.run.app/api/all-tests");
        setTests(res.data);
      } catch (err) {
        console.error("Failed to fetch tests:", err);
      } finally {
        setLoadingTests(false);
      }
    };

    fetchTests();
  }, []);

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

      const transformedData = mcqData.map((q) => {
        if (
          typeof q.question !== "string" ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          typeof q.answer !== "string" ||
          typeof q.id !== "string" ||
          typeof q.subtopic !== "string"
        ) {
          throw new Error("Invalid MCQ format");
        }

        return {
          id: q.id,
          subtopic: q.subtopic,
          question: isHex(q.question) ? q.question : stringToHex(q.question),
          options: q.options.map((opt) =>
            isHex(opt) ? opt : stringToHex(opt)
          ),
          answer: isHex(q.answer) ? q.answer : stringToHex(q.answer),
        };
      });

      const response = await axios.post(
        "https://api-e5q6islzdq-uc.a.run.app/create",
        {
          subject,
          testName,
          mcqData: transformedData,
        }
      );

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

      {createdLink && (
        <div className="mt-4 p-4 border rounded-md bg-gray-100">
          <p className="text-green-700 font-semibold">
            Test Created Successfully!
          </p>
          <p className="break-all text-blue-700">{createdLink}</p>
        </div>
      )}

      {!showForm && (
        <div className="grid grid-cols-1 gap-4">
          {loadingTests ? (
            <p className="text-gray-500">Loading tests...</p>
          ) : tests.length === 0 ? (
            <p className="text-gray-500">No tests available.</p>
          ) : (
            tests.map((test, i) => (
              <div key={i} className="border p-4 rounded-md shadow">
                <h2 className="text-lg font-semibold">{test.testName}</h2>
                <p className="text-sm text-gray-600">Subject: {test.subject}</p>
                <a
                  href={`/dashboard/customquiz/${test.subject}/${test.testId}`}
                  className="text-blue-500 hover:underline"
                >
                  View Test
                </a>
              </div>
            ))
          )}
        </div>
      )}

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
        </div>
      )}
    </div>
  );
};

export default CreateMcqTestPage;
