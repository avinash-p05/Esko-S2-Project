// services/ApprovalService.js
import axios from "axios";
import config from "./config";
import { getOrCreateExternalUser } from "./UserService";

const searchApi = axios.create({
  baseURL: config.apiBaseUrls.search,
  withCredentials: true,
  headers: {
    'Eskocloud-App': 'share-approve'
  }
});

const iamApi = axios.create({
  baseURL: config.apiBaseUrls.iam,
  withCredentials: true,
  headers: {
    'Eskocloud-App': 'share-approve'
  }
});

const viewApi = axios.create({
  baseURL: config.apiBaseUrls.view,
  withCredentials: true,
  headers: {
    'Eskocloud-App': 'share-approve',
    'Content-Type': 'application/json'
  }
});

// Generate a unique ID for stage
const generateStageId = () => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};

// Check if a user exists in the IAM system
export const checkUserExists = async (email) => {
  try {
    const response = await iamApi.get(
      `/rest/iam/organizations/${config.accountId}/users/${email}/ssocheck`
    );

    if (response.data.status === "IAM_User_SSOCheck_200") {
      // User exists in IAM system
      return true;
    }

    // User not found in IAM
    return false;
  } catch (error) {
    console.error("Error checking user:", error);
    // Default to false if there's an error
    return false;
  }
};

// Get user details from IAM by email
export const getUserDetailsByEmail = async (email) => {
  try {
    const response = await iamApi.get(
      `/rest/iam/organizations/${config.accountId}/users/`,
      {
        params: {
          start: 0,
          length: 1,
          search: email,
          filterType: "email"
        }
      }
    );

    if (response.data.recordsTotal > 0) {
      const user = response.data.data[0];
      return {
        id: user.nodeId,
        displayName: user.displayName || `${user.firstName} ${user.surName}`,
        email: user.email,
        firstName: user.firstName,
        lastName: user.surName,
        userId: user.userid
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting user details:", error);
    throw error;
  }
};

export const fetchApprovers = async () => {
  try {
    const response = await searchApi.post(
      `/_esko/search/nodes/account/${config.accountId}/_search`,
      {
        from: 0,
        size: 9999,
        query: {
          bool: {
            must: [
              {
                prefix: {
                  path: {
                    value: `${config.repoId}/EC:IAM/`
                  }
                }
              },
              {
                term: {
                  "ec_s@type": {
                    value: "iam:user"
                  }
                }
              }
            ],
            filter: [
              {
                bool: {
                  should: [
                    {
                      wildcard: {
                        "ec_s@firstName.norm": {
                          wildcard: "**"
                        }
                      }
                    },
                    {
                      wildcard: {
                        "ec_s@surName.norm": {
                          wildcard: "**"
                        }
                      }
                    },
                    {
                      wildcard: {
                        "ec_s@email.norm": {
                          wildcard: "**"
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        sort: [
          {
            "ec_t@displayName.sort": {
              order: "asc"
            }
          }
        ]
      }
    );

    // Extract approver information
    return response.data.hits.hits.map(hit => {
      const source = hit._source;
      return {
        id: hit._id,
        displayName: source["ec_t@displayName"] || "",
        email: source["ec_t@displayEmail"] || source.name,
        firstName: source["ec_s@firstName"] || "",
        lastName: source["ec_s@surName"] || "",
        userId: source["ec_s@userid"] || ""
      };
    });
  } catch (error) {
    console.error("Error fetching approvers:", error);
    throw error;
  }
};

// Get notification configuration
const getNotificationConfig = async (documentPath) => {
  try {
    // Extract the repo and site from the folder path
    const pathParts = documentPath.split('/');
    const repoId = pathParts[0];
    const siteName = pathParts[1];

    // Build the full path to the email notification config
    const configPath = `${repoId}/${siteName}/emailNotificationConfig`;

    // Search for the notification config
    const response = await searchApi.post(
      `/_esko/search/nodes/account/${config.accountId}/_search`,
      {
        query: {
          term: {
            path: {
              value: configPath
            }
          }
        }
      }
    );

    console.log("Email notification config response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting notification config:", error);
    return null;
  }
};

// Parse date string in DD-MM-YYYY format and get millisecond timestamp
const parseDate = (dateStr, timeStr) => {
  try {
    if (!dateStr) return null;

    // Parse the date in DD-MM-YYYY format and time in HH:MM format
    const [day, month, year] = dateStr.split('-').map(num => parseInt(num, 10));
    const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));

    // Create date object - month is 0-indexed in JavaScript
    const date = new Date(year, month - 1, day, hours, minutes, 0);

    // Validate the date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date created:", date);
      return null;
    }

    return date.getTime();
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
};

export const submitApprovalRequest = async (document, approvalData) => {
  try {
    // Process each approver - for external users, we need to ensure they exist
    for (let i = 0; i < approvalData.approvers.length; i++) {
      const approver = approvalData.approvers[i];

      // Check if it's an external user
      const isExternalUser = !approver.userId || !approver.userId.includes('://');

      if (isExternalUser) {
        // Create or get the external user
        const externalUser = await getOrCreateExternalUser({
          email: approver.email,
          firstName: approver.firstName || "External",
          lastName: approver.lastName || "User"
        });

        // Update the approver with the created user's details
        approvalData.approvers[i] = {
          ...approver,
          userId: externalUser.userId,
          id: externalUser.id
        };

        console.log("External user processed:", approvalData.approvers[i]);
      }
    }

    // First API call: Update notification scheme
    await iamApi.post(
      `/rest/iam/organizations/${config.accountId}/notifications/updateSchemeInfo/${document.id}/defaultNotificationScheme`
    );

    // Fetch notification config (for logging purposes)
    await getNotificationConfig(document.nodePath);

    // Get document path components
    const pathComponents = document.nodePath.split('/');
    const repoId = pathComponents[0];
    const folderPath = pathComponents.slice(1, -1).join('/');
    const fileName = pathComponents[pathComponents.length - 1];

    // Format the date for the API
    let dueDateTimestamp = null;
    if (approvalData.dueDate) {
      // Use the date parsing helper
      dueDateTimestamp = parseDate(approvalData.dueDate.split(' ')[0], approvalData.dueDate.split(' ')[1]);

      // Double check the timestamp is valid
      if (dueDateTimestamp === null) {
        console.warn("Due date could not be parsed, setting to one week from now");
        // Default to one week from now if parsing fails
        dueDateTimestamp = Date.now() + (7 * 24 * 60 * 60 * 1000);
      }
    } else {
      // Default to one week from now to ensure we have a valid timestamp
      dueDateTimestamp = Date.now() + (7 * 24 * 60 * 60 * 1000);
    }

    // Generate a unique stage ID
    const stageId = generateStageId();

    // Construct actions array for the second API call
    const actions = [
      {
        action: "edit_cycle_settings",
        dueDateType: "fixed_due_dates"
      },
      {
        action: "add_stage",
        id: stageId,
        name: "",
        fixedDueDate: dueDateTimestamp,
        allowConditionalApproval: true
      }
    ];

    // Add approvers to the actions - now all approvers have userId
    approvalData.approvers.forEach(approver => {
      actions.push({
        action: "add_approver",
        stageId: stageId,
        userId: approver.userId
      });
    });

    // Start the approval cycle
    actions.push({ action: "start_cycle" });

    // Overall notification settings (user preference)
    if (!approvalData.sendNotifications) {
      actions.push({
        action: "edit_cycle_settings",
        removeNotifications: false
      });
    }

    console.log("Submitting approval request with actions:", JSON.stringify(actions, null, 2));

    // Submit the approval request
    const response = await viewApi.post(
      `/api/v1/approval/submit/${repoId}/${folderPath}/${fileName}`,
      { actions }
    );

    return response.data;
  } catch (error) {
    console.error("Error submitting approval request:", error.response?.data || error);
    throw error;
  }
};