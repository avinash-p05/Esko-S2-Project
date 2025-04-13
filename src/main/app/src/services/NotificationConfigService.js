// services/NotificationConfigService.js
import axios from "axios";
import config from "./config";

const searchApi = axios.create({
  baseURL: config.apiBaseUrls.search,
  withCredentials: true,
  headers: {
    'Eskocloud-App': 'share-approve'
  }
});

/**
 * Fetches the email notification configuration for a specific site/folder
 * @param {string} folderPath - The folder path to get the configuration for
 * @returns {Promise<Object>} - The notification configuration object
 */
export const getEmailNotificationConfig = async (folderPath) => {
  try {
    // Extract the repo and site from the folder path
    const pathParts = folderPath.split('/');
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

    // Check if we found the config
    if (response.data.hits.hits.length > 0) {
      const configObj = response.data.hits.hits[0]._source;
      return {
        nodeId: configObj.nodeId,
        notificationConfig: configObj["ec_s@notificationConfig"] || "",
        // Parse the notification settings
        settings: parseNotificationSettings(configObj["ec_s@notificationConfig"])
      };
    }

    // No config found
    return null;
  } catch (error) {
    console.error("Error fetching email notification config:", error);
    throw error;
  }
};

/**
 * Parse the notification settings string into an object
 * @param {string} configString - The config string from the API
 * @returns {Object} - Parsed settings object
 */
const parseNotificationSettings = (configString) => {
  if (!configString) return {};

  const settings = {};
  const pairs = configString.split(',');

  pairs.forEach(pair => {
    const [key, value] = pair.split(':');
    settings[key] = value === 'true';
  });

  return settings;
};

/**
 * Determines if external users should receive notifications based on config
 * @param {Object} config - The notification config object
 * @returns {boolean} - Whether external users should be notified
 */
export const shouldNotifyExternalUsers = (config) => {
  if (!config || !config.settings) return true; // Default to true if no config

  // Check the relevant settings
  // USER_CREATION_SECONDARY_USER typically refers to external users
  return config.settings.USER_CREATION_SECONDARY_USER !== false;
};