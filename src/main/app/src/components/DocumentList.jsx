// components/DocumentList.jsx
import React, { useState } from "react";
import "./DocumentList.css";
import { getDownloadUrl, approveDocument, deleteDocument } from "../services/DocumentService";
import ApprovalModal from "./ApprovalModal";
import ApproveConfirmDialog from "./ApproveConfirmDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { useToast } from "./Toast/ToastProvider";


const DocumentList = ({ documents, isLoading, onDocumentsUpdate }) => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showApproveConfirmDialog, setShowApproveConfirmDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();


  const handleDownload = async (document) => {
    try {
      const downloadUrl = await getDownloadUrl(document.nodePath);
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document. Please try again.");
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

  const handleDeleteDocument = (document, event) => {
    event.stopPropagation(); // Prevent row click event
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
      const updatedDocuments = documents.map(doc => {
        if (doc.id === document.id) {
          return { ...doc, approveStatus: "approved" };
        }
        return doc;
      });

      if (typeof onDocumentsUpdate === 'function') {
        onDocumentsUpdate(updatedDocuments);
      }

      toast.success(`Document "${document.name}" has been approved successfully.`);
    } catch (error) {
      console.error("Error approving document:", error);
      toast.error(`Failed to approve document: ${error.message}`);
    } finally {
      setIsApproving(false);
      closeApproveConfirmDialog();
    }
  };

  const handleConfirmDelete = async (document) => {
    setIsDeleting(true);
    try {
      const documentPath = `${document.organizationId}/${document.siteName}/${encodeURIComponent(document.name)}`;
      await deleteDocument(documentPath);

      const updatedDocuments = documents.filter(doc => doc.id !== document.id);

      if (typeof onDocumentsUpdate === 'function') {
        onDocumentsUpdate(updatedDocuments);
      }

      toast.success(`Document "${document.name}" has been deleted successfully.`);
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(`Failed to delete document: ${error.message}`);
    } finally {
      setIsDeleting(false);
      closeDeleteConfirmDialog();
    }
  };

  const handleRowClick = (document) => {
    // You could expand the row or show document details
    // For now, just triggering download as an example
//     if (document.actions.includes("Download")) {
//       handleDownload(document);
//     }
  };

  const renderApprovalStatus = (document) => {
    if (document.approveStatus) {
      if (document.approveStatus === "pending") {
        return (
          <button
            className="list-approve-pending-button"
            onClick={(e) => {
              e.stopPropagation();
              handleApproveDocument(document);
            }}
          >
            Pending
          </button>
        );
      } else if (document.approveStatus === "approved") {
        return (
          <span className="list-approved-status">
            Approved
          </span>
        );
      } else if (document.approveStatus === "force_approved") {
        return (
          <span className="list-approved-status">
            Force Approved
          </span>
        );
      } else if (document.approveStatus === "rejected") {
        return (
          <span className="list-rejected-status">
            Rejected
          </span>
        );
      }
    }

    return (
      <button
        className="list-approve-button"
        onClick={(e) => {
          e.stopPropagation();
          handleSetupApproval(document);
        }}
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
      <div className="document-list">
        <div className="document-list-header">
          <div className="document-list-col document-list-preview">Preview</div>
          <div className="document-list-col document-list-name">Name</div>
          <div className="document-list-col document-list-status">Status</div>
          <div className="document-list-col document-list-actions">Actions</div>
        </div>

        {documents.map((document) => (
          <div
            key={document.id}
            className="document-list-row"
            onClick={() => handleRowClick(document)}
          >
            <div className="document-list-col document-list-preview">
              {document.thumbnail ? (
                <img
                  src={document.thumbnail}
                  alt={document.name}
                  className="list-thumbnail-image"
                />
              ) : (
                <div className="list-no-thumbnail">No Preview</div>
              )}
            </div>
            <div className="document-list-col document-list-name" title={document.name}>
              {document.name}
            </div>
            <div className="document-list-col document-list-status">
              {renderApprovalStatus(document)}
            </div>
            <div className="document-list-col document-list-actions">
              <button
                className="list-download-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(document);
                }}
                disabled={!document.actions.includes("Download")}
              >
                Download
              </button>
              <button
                className="list-delete-button"
                onClick={(e) => handleDeleteDocument(document, e)}
                title="Delete document"
              >
                <svg className="list-delete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
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

export default DocumentList;