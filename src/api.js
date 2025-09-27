const API_BASE_URL = "https://api.voxellaai.site";

// --- helpers ---
export function silentLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("userEmail");
  window.location.href = "/login";
}

async function tryRefreshToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await res.json();
    if (res.ok && data?.access_token) {
      localStorage.setItem("access_token", data.access_token);
      return true;
    }
  } catch (e) {
    console.error("Refresh token failed:", e);
  }
  return false;
}

// --- universal fetch with auto-refresh ---
export async function apiFetch(endpoint, options = {}, retry = true) {
  let token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // retry once with new token
      return apiFetch(endpoint, options, false);
    }
    silentLogout();
    return null;
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}
