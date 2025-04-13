// components/DeleteConfirmDialog.jsx
import React from "react";
import "./DeleteConfirmDialog.css";

const DeleteConfirmDialog = ({ isOpen, onClose, document, onDelete, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-confirm-overlay">
      <div className="delete-confirm-dialog">
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete "{document.name}"?</p>
        <p className="delete-warning">This action cannot be undone.</p>
        <div className="delete-confirm-actions">
          <button
            className="delete-cancel-button"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="delete-confirm-button"
            onClick={() => onDelete(document)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;