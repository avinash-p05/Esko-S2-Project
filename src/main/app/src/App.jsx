// App.jsx (continued)
import React, { useState } from "react";
import UploadButton from "./components/UploadButton";
import "./App.css"; // We'll create this CSS file next

const App = () => {
  // This will be used later for displaying documents
  const [documents, setDocuments] = useState([]);

  // This function will be called after successful upload
  const handleUploadSuccess = (nodeId) => {
    console.log("Document uploaded successfully with node ID:", nodeId);
    // Later you can fetch the updated document list here
    // fetchDocuments();
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Document Repository</h1>
      
      {/* This area will be used for document display later */}
      <div className="document-container">
        <h2 className="section-title">Documents</h2>
        {documents.length === 0 ? (
          <p className="no-documents-message">No documents available</p>
        ) : (
          <div>
            {/* Document list will go here */}
            <p className="placeholder-message">Document list will be implemented later</p>
          </div>
        )}
      </div>
      
      {/* Upload button positioned at bottom right */}
      <UploadButton onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};

export default App;