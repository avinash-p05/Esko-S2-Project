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
        id: hit._id,
        name: source.name,
        thumbnail: source["contentPath-S3-thumbnail-200x200"],
        largeThumbnail: source["contentPath-S3-thumbnail-500x500"],
        nodePath: source.path,
        actions: source["ec_id@actions"] || []
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