// components/DocumentGrid.jsx
import React from "react";
import "./DocumentGrid.css";
import { getDownloadUrl } from "../services/DocumentService";

const DocumentGrid = ({ documents, isLoading }) => {
  const handleDownload = async (document) => {
    try {
      const downloadUrl = await getDownloadUrl(document.nodePath);
      // Open the download URL in a new tab
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download document. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="loading-message">Loading documents...</div>;
  }

  if (!documents || documents.length === 0) {
    return <div className="no-documents-message">No documents available</div>;
  }

  return (
    <div className="document-grid">
      {documents.map((document) => (
        <div key={document.id} className="document-card">
          <div className="document-thumbnail">
            {document.thumbnail ? (
              <img
                src={document.thumbnail}
                alt={document.name}
                className="thumbnail-image"
              />
            ) : (
              <div className="no-thumbnail">No Preview</div>
            )}
          </div>
          <div className="document-info">
            <div className="document-name" title={document.name}>
              {document.name}
            </div>
            <button
              className="download-button"
              onClick={() => handleDownload(document)}
              disabled={!document.actions.includes("Download")}
            >
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentGrid;