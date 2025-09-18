// api.js
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.voxellaai.site";

async function apiFetch(endpoint, options = {}) {
  let token = localStorage.getItem("access_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    let res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (res.status === 401) {
      // Try silent refresh
      const refreshSuccess = await tryRefreshToken();
      if (refreshSuccess) {
        // Retry original request once
        token = localStorage.getItem("access_token");
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${token}`,
        };
        return await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: retryHeaders,
        });
      } else {
        // Refresh failed → silent logout
        silentLogout();
        return null; // no error shown
      }
    }

    return res;
  } catch (_) {
    // Fail silently
    return null;
  }
}

async function tryRefreshToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;

  try {
    const res = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }
    return true;
  } catch {
    return false;
  }
}

function silentLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login"; // no error, just redirect
}

export default apiFetch;
