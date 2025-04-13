/* components/AddUserModal.jsx */
import React, { useState } from "react";
import "./AddUserModal.css";

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [userType, setUserType] = useState("internal");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [function_, setFunction] = useState("");
  const [initials, setInitials] = useState("");
  const [telephone, setTelephone] = useState("");
  const [partner, setPartner] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setUserType("internal");
      setEmail("");
      setFirstName("");
      setLastName("");
      setFunction("");
      setInitials("");
      setTelephone("");
      setPartner("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Validate form based on required fields
  const isFormValid = () => {
    return email.trim() !== "" && firstName.trim() !== "" && lastName.trim() !== "";
  };

  // Handle create user action
  const handleCreateUser = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      const userData = {
        email,
        firstName,
        lastName,
        function: function_,
        initials,
        telephone: telephone,
        userType: userType === "internal" ? "internal" : "external",
        // Additional fields can be added here
      };

      // Call parent handler with user data
      await onUserAdded(userData);
      onClose();
    } catch (error) {
      console.error("Error creating user:", error);
      // Could add error handling UI here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="add-user-modal">
        <div className="modal-header">
          <h2>Add New User</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* User Type Selection */}
          <div className="form-group">
            <label>Type</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="internal"
                  checked={userType === "internal"}
                  onChange={() => setUserType("internal")}
                />
                Internal
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="external"
                  checked={userType === "external"}
                  onChange={() => setUserType("external")}
                />
                External
              </label>
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="email">
              <span className="required">*</span> E-mail Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* First and Last Name */}
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="firstName">
                <span className="required">*</span> First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                required
              />
            </div>
            <div className="form-group half">
              <label htmlFor="lastName">
                <span className="required">*</span> Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                required
              />
            </div>
          </div>

          {/* Function and Initials */}
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="function">Function</label>
              <input
                id="function"
                type="text"
                value={function_}
                onChange={(e) => setFunction(e.target.value)}
                placeholder="Function"
              />
            </div>
            <div className="form-group half">
              <label htmlFor="initials">Initials</label>
              <input
                id="initials"
                type="text"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                placeholder="Initials"
              />
            </div>
          </div>

          {/* Telephone Number */}
          <div className="form-group">
            <label htmlFor="telephone">Telephone Number</label>
            <input
              id="telephone"
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Telephone Number"
            />
          </div>

          {/* Partner (only shown for External users) */}
          {userType === "external" && (
            <div className="form-group">
              <label htmlFor="partner">Partner</label>
              <div className="partner-select-container">
                <input
                  id="partner"
                  type="text"
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  placeholder="Start typing to search for a partner"
                  className="partner-input"
                />
                <span className="dropdown-arrow">▼</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="create-button"
            onClick={handleCreateUser}
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;