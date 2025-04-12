import React, { useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://repo.ldev.cloudi.city:11000",
  withCredentials: true,
});

const App = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("Idle");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return setStatus("No file selected");

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
        } catch (err) {
          console.error("S3 upload failed:", err);
          ws.send(JSON.stringify({ status: "canceled" }));
          setStatus("Upload to S3 failed.");
        }
      };

      ws.onmessage = (event) => {
        console.log("WebSocket message:", event.data);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setStatus("WebSocket error");
      };

      ws.onclose = () => {
        if (ping) clearInterval(ping);
        setStatus((prev) => `${prev} (WebSocket closed)`);
      };
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus("Upload failed");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Upload File with WebSocket</h2>
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4 w-full"
      />
      <button
        onClick={uploadFile}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Upload
      </button>
      <p className="mt-4 text-sm text-gray-600">Status: {status}</p>
    </div>
  );
};

export default App;
