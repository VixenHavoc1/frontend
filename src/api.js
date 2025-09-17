// api.js
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.voxellaai.site";

async function apiFetch(endpoint, options = {}, retry = true) {
  let accessToken = localStorage.getItem("access_token");
  let refreshToken = localStorage.getItem("refresh_token");

  const headers = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  try {
    let res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // If token expired → try refreshing
    if (res.status === 401 && refreshToken && retry) {
      const refreshed = await refreshAccessToken(refreshToken);

      if (refreshed) {
        // Retry original request once with new token
        return apiFetch(endpoint, options, false);
      } else {
        throw new Error("Session expired, please log in again.");
      }
    }

    return res;
  } catch (err) {
    console.error("API Fetch Error:", err);
    throw err;
  }
}

async function refreshAccessToken(refreshToken) {
  try {
    const res = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      console.warn("Refresh token invalid/expired");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return false;
    }

    const data = await res.json();

    // Save new tokens
    localStorage.setItem("access_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }

    return true;
  } catch (err) {
    console.error("Refresh token request failed:", err);
    return false;
  }
}

export default apiFetch;
