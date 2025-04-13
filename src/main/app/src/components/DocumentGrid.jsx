// components/DocumentGrid.jsx
import React, { useState } from "react";
import "./DocumentGrid.css";
import { getDownloadUrl, approveDocument, deleteDocument } from "../services/DocumentService";
import ApprovalModal from "./ApprovalModal";
import ApproveConfirmDialog from "./ApproveConfirmDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

const DocumentGrid = ({ documents, isLoading, onDocumentsUpdate }) => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showApproveConfirmDialog, setShowApproveConfirmDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = async (document) => {
    try {
      const downloadUrl = await getDownloadUrl(document.nodePath);
      const nodeID = document.id;
      // Open the download URL in a new tab
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download document. Please try again.");
    }
  };

  const handleSetupApproval = (document) => {
    setSelectedDocument(document);
    setShowApprovalModal(true);
  };

  const handleApproveDocument = (document) => {
    setSelectedDocument(document);
    setShowApproveConfirmDialog(true);
  };

  const handleDeleteDocument = (document) => {
    setSelectedDocument(document);
    setShowDeleteConfirmDialog(true);
  };

  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedDocument(null);
  };

  const closeApproveConfirmDialog = () => {
    setShowApproveConfirmDialog(false);
    setSelectedDocument(null);
  };

  const closeDeleteConfirmDialog = () => {
    setShowDeleteConfirmDialog(false);
    setSelectedDocument(null);
  };

  const handleConfirmApproval = async (document) => {
    setIsApproving(true);
    try {
      await approveDocument(document);
      // Update the local state to reflect the approved status
      const updatedDocuments = documents.map(doc => {
        if (doc.id === document.id) {
          return { ...doc, approveStatus: "approved" };
        }
        return doc;
      });

      // If a callback for document updates was provided, call it with the updated documents
      if (typeof onDocumentsUpdate === 'function') {
        onDocumentsUpdate(updatedDocuments);
      }

      alert(`Document "${document.name}" has been approved successfully.`);
    } catch (error) {
      console.error("Error approving document:", error);
      alert(`Failed to approve document: ${error.message}`);
    } finally {
      setIsApproving(false);
      closeApproveConfirmDialog();
    }
  };

  const handleConfirmDelete = async (document) => {
    setIsDeleting(true);
    try {
      // Format the path correctly for the API
      const documentPath = `${document.organizationId}/${document.siteName}/${encodeURIComponent(document.name)}`;

      await deleteDocument(documentPath);

      // Remove the deleted document from the local state
      const updatedDocuments = documents.filter(doc => doc.id !== document.id);

      // If a callback for document updates was provided, call it with the updated documents
      if (typeof onDocumentsUpdate === 'function') {
        onDocumentsUpdate(updatedDocuments);
      }

      alert(`Document "${document.name}" has been deleted successfully.`);
    } catch (error) {
      console.error("Error deleting document:", error);
      alert(`Failed to delete document: ${error.message}`);
    } finally {
      setIsDeleting(false);
      closeDeleteConfirmDialog();
    }
  };

  const renderApprovalButton = (document) => {
    // Check if document has approveStatus
    if (document.approveStatus) {
      if (document.approveStatus === "pending") {
        return (
          <button
            className="approve-pending-button"
            onClick={() => handleApproveDocument(document)}
          >
            Pending
          </button>
        );
      } else if (document.approveStatus === "approved") {
        return (
          <button
            className="approved-button"
            disabled
          >
            Approved
          </button>
        );
      }
      else if (document.approveStatus === "force_approved") {
        return (
          <button
            className="approved-button"
            disabled
          >
            Force Approved
          </button>
        );
      }
    }

    // Default case - Setup Approval
    return (
      <button
        className="approve-button"
        onClick={() => handleSetupApproval(document)}
        disabled={!document.actions.includes("Setup Approval")}
      >
        Setup Approval
      </button>
    );
  };

  if (isLoading) {
    return <div className="loading-message">Loading documents...</div>;
  }

  if (!documents || documents.length === 0) {
    return <div className="no-documents-message">No documents available</div>;
  }

  return (
    <>
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
              <button
                className="delete-button"
                onClick={() => handleDeleteDocument(document)}
                title="Delete document"
              >
                <svg className="delete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
            <div className="document-info">
              <div className="document-name" title={document.name}>
                {document.name}
              </div>
              {renderApprovalButton(document)}
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

      {showApprovalModal && selectedDocument && (
        <ApprovalModal
          isOpen={showApprovalModal}
          onClose={closeApprovalModal}
          document={selectedDocument}
        />
      )}

      {showApproveConfirmDialog && selectedDocument && (
        <ApproveConfirmDialog
          isOpen={showApproveConfirmDialog}
          onClose={closeApproveConfirmDialog}
          document={selectedDocument}
          onApprove={handleConfirmApproval}
          isProcessing={isApproving}
        />
      )}

      {showDeleteConfirmDialog && selectedDocument && (
        <DeleteConfirmDialog
          isOpen={showDeleteConfirmDialog}
          onClose={closeDeleteConfirmDialog}
          document={selectedDocument}
          onDelete={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default DocumentGrid;