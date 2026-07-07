let baseUrl = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : "http://127.0.0.1:8000";

// Automatically prepend https:// if it is a naked hostname (e.g. from Render's property: host)
if (baseUrl && !baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
  baseUrl = `https://${baseUrl}`;
}

export const API_BASE_URL = baseUrl;
