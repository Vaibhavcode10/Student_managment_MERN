import React, { useEffect } from "react";
import { useNotes } from "../context/NotesProvider"; // ✅ Correct hook name

const TryModule = () => {
  const { trydata, testFetchNote} = useNotes(); // ✅ Correct usage

  useEffect(() => {
    testFetchNote(); // test fetch when component mounts
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md text-left ">
      <h2 className="text-2xl font-semibold mb-4">🧪 Test Note Fetch Result</h2>

      {trydata ? (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-bold mb-2">Title: {trydata.title || "Untitled Note"}</h3>

          <div className="mb-2">
            <strong>Unit:</strong> {trydata.unit || "N/A"}
          </div>

          <div className="mb-2">
            <strong>Subject:</strong> {trydata.subject || "N/A"}
          </div>

          {trydata.content && (
            <div className="mb-4">
              <strong>Content:</strong>
              <div
                className="prose max-w-none mt-2 p-2 border rounded bg-white"
                dangerouslySetInnerHTML={{ __html: trydata.content }}
              />
            </div>
          )}

          {trydata.code && (
            <div className="bg-black text-white p-4 rounded mt-4 overflow-x-auto">
              <pre>{trydata.code}</pre>
            </div>
          )}
        </div>
      ) : (
        <p className="text-red-500">No data fetched yet... 👀</p>
      )}
    </div>
  );
};

export default TryModule;
