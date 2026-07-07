let baseUrl = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : "http://127.0.0.1:8000";

// Automatically prepend https:// and append .onrender.com if it's a naked Render hostname
if (baseUrl && !baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
  if (!baseUrl.includes("localhost") && !baseUrl.includes("127.0.0.1") && !baseUrl.includes(".")) {
    baseUrl = `https://${baseUrl}.onrender.com`;
  } else {
    baseUrl = `https://${baseUrl}`;
  }
}

export const API_BASE_URL = baseUrl;
