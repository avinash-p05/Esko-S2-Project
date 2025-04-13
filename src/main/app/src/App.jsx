// App.jsx
import React, { useState, useEffect } from "react";
import UploadButton from "./components/UploadButton";
import DocumentGrid from "./components/DocumentGrid";
import { fetchDocuments } from "./services/DocumentService";
import "./App.css";

const App = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError("Failed to load documents. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load documents on initial render
  useEffect(() => {
    loadDocuments();
  }, []);

  // This function will be called after successful upload
  const handleUploadSuccess = (nodeId) => {
    console.log("Document uploaded successfully with node ID:", nodeId);
    // Refresh document list
    loadDocuments();
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Share and Approve</h1>

      <div className="document-container">
        <div className="header-row">
          <h2 className="section-title">Documents</h2>
          <button
            className="refresh-button"
            onClick={loadDocuments}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <DocumentGrid documents={documents} isLoading={isLoading} />
      </div>

      {/* Upload button positioned at bottom right */}
      <UploadButton onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};

export default App;