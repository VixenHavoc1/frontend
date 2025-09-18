// api.js
const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.voxellaai.site";

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

    // If token expired → try refreshing once
    if (res.status === 401 && refreshToken && retry) {
      const refreshed = await refreshAccessToken(refreshToken);

      if (refreshed) {
        return apiFetch(endpoint, options, false); // retry once
      } else {
        throw new Error("Session expired, please log in again.");
      }
    }

    // Parse response safely
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    return { ok: res.ok, status: res.status, data };
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

// ---- Auth helpers ---- //
export async function login(email, password) {
  const res = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(res.data?.detail || "Login failed");
  }

  // Save tokens
  localStorage.setItem("access_token", res.data.access_token);
  if (res.data.refresh_token) {
    localStorage.setItem("refresh_token", res.data.refresh_token);
  }

  return res.data;
}

export async function signup(email, password) {
  const res = await apiFetch("/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
     return null;
  }

  return res.data;
}

export async function verifyEmail(email, code) {
  const res = await apiFetch("/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });

  if (!res.ok) {
    throw new Error(res.data?.detail || "Verification failed");
  }

  return res.data;
}

export default apiFetch;
