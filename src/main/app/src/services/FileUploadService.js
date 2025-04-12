// FileUploadService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://repo.ldev.cloudi.city:11000",
  withCredentials: true,
});

export const uploadFileToRepo = async (file, setStatus) => {
  if (!file) {
    setStatus("No file selected");
    return null;
  }

  const encodedFileName = encodeURIComponent(file.name);
  const nodePath = `Hcpd89J8AankZsi/esko-interns/${encodedFileName}`;

  try {
    setStatus("Creating node...");

    // Step 1: Create node
    const response1 = await api.put(`/NODE/v0/${nodePath}`, {
      nodeType: "Document",
      properties: [
        {
          inherited: false,
          propertyType: "string",
          name: "type",
          id: "type",
          value: "DOCUMENT",
        },
      ],
    });

    const nodeID = response1.data;
    console.log(nodeID);

    setStatus("Requesting presigned upload URL...");

    // Step 2: Get presigned S3 upload URL
    const res = await axios.post(
      `http://repo.ldev.cloudi.city:11000/CONTENT/v0/${nodePath}?contentid=content&s3uri=true&overwrite=true&originalFileName=${encodedFileName}`,
      null,
      { withCredentials: true }
    );

    const { contentUri, statusUri } = res.data;

    setStatus("Connecting WebSocket...");

    const ws = new WebSocket(`ws://repo.ldev.cloudi.city:11000/${statusUri}`);
    let ping = null;

    return new Promise((resolve, reject) => {
      ws.onopen = async () => {
        setStatus("WebSocket connected. Uploading to S3...");

        ping = setInterval(() => {
          ws.send(JSON.stringify({ status: "alive" }));
        }, 30000);

        try {
          // Step 3: Upload file to S3
          await axios.put(contentUri, file, {
            headers: {
              "Content-Type": "binary/octet-stream",
            },
          });

          // Notify server via websocket
          ws.send(JSON.stringify({ status: "completed" }));
          setStatus("Upload completed.");
          resolve(nodeID);
        } catch (err) {
          console.error("S3 upload failed:", err);
          ws.send(JSON.stringify({ status: "canceled" }));
          setStatus("Upload to S3 failed.");
          reject(err);
        }
      };

      ws.onmessage = (event) => {
        console.log("WebSocket message:", event.data);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setStatus("WebSocket error");
        reject(err);
      };

      ws.onclose = () => {
        if (ping) clearInterval(ping);
        setStatus((prev) => `${prev} (WebSocket closed)`);
      };
    });
  } catch (error) {
    console.error("Upload failed:", error);
    setStatus("Upload failed");
    throw error;
  }
};