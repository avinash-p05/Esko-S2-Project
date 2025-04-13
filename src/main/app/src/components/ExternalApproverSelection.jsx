// components/ExternalApproverSelection.jsx
import React, { useState } from "react";
import axios from "axios";
import config from "../services/config";
import { checkUserExists, getUserDetailsByEmail } from "../services/ApprovalService";
import "./ExternalApproverSelection.css";

const ExternalApproverSelection = ({ onApproverSelected }) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showNameFields, setShowNameFields] = useState(false);

  // Validate email format
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Check if user exists in IAM
  const handleCheckUser = async () => {
    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setIsChecking(true);
    setErrorMessage("");

    try {
      // Check if the user exists in IAM
      const userExists = await checkUserExists(email);

      if (userExists) {
        // If user exists, get their details
        const userInfo = await getUserDetailsByEmail(email);

        if (userInfo) {
          setUserDetails(userInfo);
          setIsExistingUser(true);
          setShowNameFields(false);
        } else {
          // User exists but couldn't get details
          setErrorMessage("User found but couldn't retrieve details");
          setUserDetails(null);
          setIsExistingUser(false);
        }
      } else {
        // New external user - show name fields
        setUserDetails(null);
        setIsExistingUser(false);
        setShowNameFields(true);
        setFirstName("");
        setLastName("");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setErrorMessage(
        error.response?.data?.message ||
        "Failed to check user. Please try again."
      );
      setIsExistingUser(false);
      setUserDetails(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleAddApprover = () => {
    if (isExistingUser && userDetails) {
      // For existing users, use the retrieved details
      onApproverSelected(userDetails);
    } else if (showNameFields) {
      // For new external users, construct approver object with form data
      const approver = {
        email: email,
        firstName: firstName || "External",
        lastName: lastName || "User",
        // Flag to identify as external user - our backend will create the user
        isExternal: true,
        // Display name combines first and last name, or falls back to email
        displayName: firstName && lastName
          ? `${firstName} ${lastName}`
          : email
      };
      onApproverSelected(approver);
    }

    // Reset the form after adding
    setEmail("");
    setFirstName("");
    setLastName("");
    setUserDetails(null);
    setIsExistingUser(false);
    setShowNameFields(false);
  };

  return (
    <div className="external-approver-selection">
      <div className="approver-input-group">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter approver's email address"
          className="approver-email-input"
          disabled={isChecking}
        />
        <button
          onClick={handleCheckUser}
          disabled={!email || isChecking}
          className="check-user-button"
        >
          {isChecking ? "Checking..." : "Check"}
        </button>
      </div>

      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}

      {showNameFields && (
        <div className="external-user-form">
          <p className="form-info">
            New external approver. Please provide their name:
          </p>
          <div className="name-fields">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="name-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="name-input"
              />
            </div>
          </div>
          <button
            onClick={handleAddApprover}
            disabled={!isValidEmail(email)}
            className="add-approver-button"
          >
            Add as External Approver
          </button>
        </div>
      )}

      {isExistingUser && userDetails && (
        <div className="user-details">
          <div className="user-info">
            <div className="user-name">{userDetails.displayName}</div>
            <div className="user-email">{userDetails.email}</div>
            <div className="user-status">
              ✓ User found in system
            </div>
          </div>
          <button
            onClick={handleAddApprover}
            className="add-approver-button"
          >
            Add as Approver
          </button>
        </div>
      )}
    </div>
  );
};

export default ExternalApproverSelection;