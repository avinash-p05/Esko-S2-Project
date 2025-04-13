// services/DocumentService.js
import axios from "axios";
import config from "./config";

const approveApi = axios.create({
  baseURL: config.approveBaseUrl,
  withCredentials: true,
});

const repoApi = axios.create({
  baseURL: config.repoBaseUrl,
  withCredentials: true,
});

const viewApi = axios.create({
  baseURL: config.apiBaseUrls.view,
  withCredentials: true,
});

export const fetchDocuments = async () => {
  try {
    const response = await approveApi.get(
      config.sitePath,
      {
        params: {
          start: 0,
          length: 50,
          field: "modificationDate",
          dir: "desc",
          searchType: "name",
          searchValue: "*",
          filterType: "type",
          filterValue: "Folder,Document",
          deepSearchFilterValue: "normalSearch",
          showSharedWithDetails: true
        },
        headers: {
          "Eskocloud-Search-Thumbnails": "true"
        }
      }
    );

    // Extract relevant document info from hits array
    return response.data.childrenNodes.hits.hits.map(hit => {
      const source = hit._source;
      return {
        id: source.nodeId,
        name: source.name,
        thumbnail: source["contentPath-S3-thumbnail-200x200"],
        largeThumbnail: source["contentPath-S3-thumbnail-500x500"],
        nodePath: source.path,
        actions: source["ec_id@actions"] || [],
        approveStatus: source["ec_s@approve_status"] || [],
        organizationId: config.repoId,
        siteName: config.siteName
      };
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export const getDownloadUrl = async (nodePath) => {
  try {
    const response = await repoApi.get(
      `/CONTENT/URL/v0/${nodePath}`
    );

    return response.data.url;
  } catch (error) {
    console.error("Error getting download URL:", error);
    throw error;
  }
};

export const approveDocument = async (document) => {
  try {
    const organizationId = document.organizationId || config.repoId;
    const siteName = document.siteName || config.siteName;
    const documentPath = document.nodePath.split('/').pop() || document.name;

    const url = `/api/v1/approval/submit/${organizationId}/${siteName}/${documentPath}`;

    const response = await viewApi.post(url, {
      actions: [
        {
          action: "force_approve"
        }
      ]
    });

    if (response.status !== 200) {
      throw new Error(`Failed to approve document: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error approving document:", error);
    throw error;
  }
};

export const deleteDocument = async (documentPath) => {
  try {
    const response = await approveApi.delete('/rest/organizations/deletenode', {
      data: [{ path: documentPath }],
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status !== 200) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};