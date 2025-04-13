// services/UserService.js
import axios from "axios";
import config from "./config";

const iamApi = axios.create({
  baseURL: config.apiBaseUrls.iam,
  withCredentials: true,
  headers: {
    'Eskocloud-App': 'share-approve',
    'Content-Type': 'application/json'
  }
});

/**
 * Creates an external user in the system
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} - Created user information
 */
export const createExternalUser = async (userData) => {
  try {
    // Format the user creation payload according to what your friend is using
    const payload = {
      userid: "", // Leave blank - will be assigned by the system
      firstName: userData.firstName || "External",
      surName: userData.lastName || "User",
      email: userData.email,
      organizationName: "",
      initials: userData.initials || "",
      function: userData.function || "",
      secondaryEmail: "",
      path: `${config.accountId}/users`,
      employeeType: "",
      mobileNumber: userData.telephone || "",
      userType: "external", // Important: This triggers the password creation email
      partnerNodeId: "",
      siteTitle: config.siteName,
      organisationReadableName: config.siteName,
      siteName: config.siteName,
      // Either set logoUrl to null or to the default logo
      logoUrl: "http://static.ldev.cloudi.city:11000/approve/0b5863d0cd7942ff0c1fbefbb64c5f4f.png"
    };

    // Create the user
    const response = await iamApi.post(
      `/rest/iam/organizations/${config.accountId}/users`,
      payload
    );

    console.log("External user created:", response.data);

    return {
      id: response.data.nodeId,
      userId: response.data.userid,
      email: response.data.email,
      firstName: response.data.firstName,
      lastName: response.data.surName,
      displayName: response.data.displayName
    };
  } catch (error) {
    console.error("Error creating external user:", error);
    throw error;
  }
};

/**
 * Checks if a user exists and returns their details, or creates them if they don't exist
 * @param {Object} userData - User data to check or create
 * @returns {Promise<Object>} - User information
 */
export const getOrCreateExternalUser = async (userData) => {
  try {
    // First check if user exists
    const response = await iamApi.get(
      `/rest/iam/organizations/${config.accountId}/users/${userData.email}/ssocheck`
    );

    if (response.data.status === "IAM_User_SSOCheck_200") {
      // User exists, get their details
      const userResponse = await iamApi.get(
        `/rest/iam/organizations/${config.accountId}/users/`,
        {
          params: {
            start: 0,
            length: 1,
            search: userData.email,
            filterType: "email"
          }
        }
      );

      if (userResponse.data.recordsTotal > 0) {
        const user = userResponse.data.data[0];
        return {
          id: user.nodeId,
          userId: user.userid,
          email: user.email,
          firstName: user.firstName,
          lastName: user.surName,
          displayName: user.displayName || `${user.firstName} ${user.surName}`
        };
      }
    }

    // User doesn't exist, create them
    // IMPORTANT: First do the SSO check, then create the user - this order is important
    // for triggering the password creation email
    return await createExternalUser(userData);
  } catch (error) {
    console.error("Error getting or creating user:", error);
    throw error;
  }
};