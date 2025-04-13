// components/ApprovalModal.jsx
import React, { useState, useEffect } from "react";
import { fetchApprovers, submitApprovalRequest } from "../services/ApprovalService";
import { getOrCreateExternalUser } from "../services/UserService";
import AddUserModal from "./AddUserModal";
import "./ApprovalModal.css";

const ApprovalModal = ({ isOpen, onClose, document }) => {
  const [approvers, setApprovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [approvalSetup, setApprovalSetup] = useState("Single Stage Approval (Default)");
  const [notificationScheme, setNotificationScheme] = useState("System Default Scheme");
  const [message, setMessage] = useState("");
  const [addDueDate, setAddDueDate] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("17:00");
  const [submitting, setSubmitting] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState("internal"); // 'internal' or 'external'

  useEffect(() => {
    if (isOpen) {
      loadApprovers();

      // Set default due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(formatDate(tomorrow));
    }
  }, [isOpen]);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const loadApprovers = async () => {
    try {
      setLoading(true);
      const approversList = await fetchApprovers();
      setApprovers(approversList);
    } catch (error) {
      console.error("Failed to load approvers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApprover = (approver) => {
    if (!selectedApprovers.some(a => a.id === approver.id)) {
      setSelectedApprovers([...selectedApprovers, approver]);
    }
  };

  const handleRemoveApprover = (approverId) => {
    setSelectedApprovers(selectedApprovers.filter(a => a.id !== approverId));
  };

  const handleShowAddUserModal = () => {
    setShowAddUserModal(true);
  };

  const handleUserAdded = async (userData) => {
    try {
      // Create or get external user
      const user = await getOrCreateExternalUser(userData);
      console.log("User created/retrieved:", user);

      // Add to selected approvers
      handleAddApprover({
        id: user.id,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName
      });

      // Close modal
      setShowAddUserModal(false);
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (selectedApprovers.length === 0) {
      alert("Please add at least one approver");
      return;
    }

    try {
      setSubmitting(true);

      const approvalData = {
        approvalType: approvalSetup,
        approvers: selectedApprovers,
        notificationScheme: notificationScheme,
        message: message,
        dueDate: addDueDate ? `${dueDate} ${dueTime}` : null,
        sendNotifications: sendNotifications
      };

      await submitApprovalRequest(document, approvalData);
      alert("Approval request submitted successfully");
      onClose();
    } catch (error) {
      alert("Failed to submit approval request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="approval-modal-overlay">
      <div className="approval-modal">
        <div className="approval-modal-header">
          <h2>Request Approval of {document.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="approval-modal-body">
          <div className="approval-setup">
            <label>Approval Setup</label>
            <select
              value={approvalSetup}
              onChange={(e) => setApprovalSetup(e.target.value)}
            >
              <option value="Single Stage Approval (Default)">Single Stage Approval (Default)</option>
              <option value="Multi Stage Approval">Multi Stage Approval</option>
            </select>
          </div>

          <div className="add-approvers">
            <label>Add Approvers <span className="required">*</span></label>

            <div className="selected-approvers">
              {selectedApprovers.map(approver => (
                <div key={approver.id || approver.email} className="selected-approver">
                  <span>{approver.displayName || approver.email}</span>
                  <button onClick={() => handleRemoveApprover(approver.id || approver.email)}>×</button>
                </div>
              ))}
            </div>

            <div className="approver-actions">
              <div className="approver-dropdown">
                <select
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    if (selectedId) {
                      const approver = approvers.find(a => a.id === selectedId);
                      if (approver) handleAddApprover(approver);
                    }
                  }}
                  value=""
                >
                  <option value="">Select internal approvers...</option>
                  {approvers.map(approver => (
                    <option key={approver.id} value={approver.id}>
                      {approver.displayName || approver.email}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="add-external-button"
                onClick={handleShowAddUserModal}
              >
                Add External User
              </button>
            </div>
          </div>

          <div className="notification-scheme">
            <label>Notification Scheme</label>
            <select
              value={notificationScheme}
              onChange={(e) => setNotificationScheme(e.target.value)}
            >
              <option value="System Default Scheme">System Default Scheme</option>
            </select>
          </div>

          <div className="message">
            <label>Message</label>
            <textarea
              placeholder="Please enter an Approval Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="due-date">
            <label>
              <input
                type="checkbox"
                checked={addDueDate}
                onChange={(e) => setAddDueDate(e.target.checked)}
              />
              Add Due Date
            </label>

            {addDueDate && (
              <div className="date-time-picker">
                <div className="date-picker">
                  <label>Date</label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="DD-MM-YYYY"
                  />
                </div>

                <div className="time-picker">
                  <label>Time</label>
                  <select
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                      <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {hour.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="notifications">
            <label>
              <input
                type="checkbox"
                checked={sendNotifications}
                onChange={(e) => setSendNotifications(e.target.checked)}
              />
              Send Email Notifications
            </label>
          </div>
        </div>

        <div className="approval-modal-footer">
          <button className="cancel-button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={submitting || selectedApprovers.length === 0}
          >
            {submitting ? "Submitting..." : "Start Approval Cycle"}
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
};

export default ApprovalModal;