// components/UploadButton.jsx
import React, { useState, useRef } from "react";
import { uploadFileToRepo } from "../services/FileUploadService";
import "./UploadButton.css"; // We'll create this next

const UploadButton = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("Idle");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("No file selected");
      return;
    }

    setIsUploading(true);
    try {
      const nodeId = await uploadFileToRepo(file, setStatus);
      if (nodeId && onUploadSuccess) {
        onUploadSuccess(nodeId);
      }
    } catch (error) {
      console.error("Upload process failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-button-container">
      {status !== "Idle" && (
        <div className="status-box">
          Status: {status}
        </div>
      )}

      <div className="button-group">
        {file && (
          <span className="file-name">
            {file.name}
          </span>
        )}

        <button
          onClick={handleFileSelect}
          className="select-file-button"
        >
          Select File
        </button>

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`upload-button ${!file || isUploading ? "disabled" : ""}`}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default UploadButton;