// components/ApproveConfirmDialog.jsx
import React from "react";
import "./ApproveConfirmDialog.css";

const ApproveConfirmDialog = ({ isOpen, onClose, document, onApprove, isProcessing = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="confirm-dialog">
        <h2>Force Approve Document</h2>
        <p>Are you sure you want to force approve "{document.name}"?</p>

        <div className="dialog-actions">
          <button
            className="cancel-button"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className="confirm-button"
            onClick={() => onApprove(document)}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Force Approve"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveConfirmDialog;