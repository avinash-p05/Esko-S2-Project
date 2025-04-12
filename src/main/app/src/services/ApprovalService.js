// services/ApprovalService.js
import axios from "axios";
import config from "./config";

const searchApi = axios.create({
  baseURL: "http://search.ldev.cloudi.city:11000",
  withCredentials: true,
  headers: {
    'Eskocloud-App': 'share-approve'
  }
});

const iamApi = axios.create({
  baseURL: "http://iam.ldev.cloudi.city:11000",
  withCredentials: true,
  headers: {
    'Eskocloud-App': 'share-approve'
  }
});

const viewApi = axios.create({
  baseURL: "http://view.ldev.cloudi.city:11000",
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

export const submitApprovalRequest = async (document, approvalData) => {
  try {
    // First API call: Update notification scheme
    await iamApi.post(
      `/rest/iam/organizations/${config.accountId}/notifications/updateSchemeInfo/${document.id}/defaultNotificationScheme`
    );

    // Get document path components
    const pathComponents = document.nodePath.split('/');
    const repoId = pathComponents[0];
    const folderPath = pathComponents.slice(1, -1).join('/');
    const fileName = pathComponents[pathComponents.length - 1];
    
    // Format the date for the API
    let dueDateTimestamp = null;
    if (approvalData.dueDate) {
      // Parse the date in DD-MM-YYYY format and time in HH:MM format
      const [day, month, year] = approvalData.dueDate.split(' ')[0].split('-');
      const time = approvalData.dueDate.split(' ')[1];
      const [hours, minutes] = time.split(':');
      
      const dueDateTime = new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed in JavaScript
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );
      
      dueDateTimestamp = dueDateTime.getTime();
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

    // Add approvers to the actions
    approvalData.approvers.forEach(approver => {
      actions.push({
        action: "add_approver",
        userId: approver.userId,
        stageId: stageId
      });
    });

    // Add remaining actions
    actions.push(
      {
        action: "start_cycle"
      },
      {
        action: "edit_cycle_settings",
        removeNotifications: !approvalData.sendNotifications
      }
    );

    // Second API call: Submit approval
    // Important: Use the direct URL structure as shown in the example
    // Do not double-encode the file name that's already in the URL format
    const response = await viewApi.post(
      `/api/v1/approval/submit/${repoId}/${folderPath}/${fileName}`,
      { actions }
    );

    return response.data;
  } catch (error) {
    console.error("Error submitting approval request:", error);
    throw error;
  }
};