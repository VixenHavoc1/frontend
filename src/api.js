// api.js
const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.voxellaai.site";

// ---- Token Helpers ---- //
function saveTokens(data) {
  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
  }
  if (data.refresh_token) {
    localStorage.setItem("refresh_token", data.refresh_token);
  }
  if (data.expires_in) {
    // Store expiry time in ms
    localStorage.setItem("token_expiry", Date.now() + data.expires_in * 1000);
  }
}

async function refreshToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    saveTokens(data);
    return true;
  } catch (err) {
    console.error("Refresh token error:", err);
    return false;
  }
}

// ---- Main API Fetch ---- //
async function apiFetch(endpoint, options = {}) {
  let token = localStorage.getItem("access_token");
  const expiry = parseInt(localStorage.getItem("token_expiry"), 10);

  // 🔄 Refresh proactively if expired or about to expire (<30s left)
  if (!token || (expiry && Date.now() > expiry - 30000)) {
    const refreshed = await refreshToken();
    if (!refreshed) throw new Error("Session expired, please log in again.");
    token = localStorage.getItem("access_token");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    // Retry once if 401 (token expired in the middle of request)
    if (res.status === 401) {
      const refreshed = await refreshToken();
      if (!refreshed) throw new Error("Session expired, please log in again.");
      return apiFetch(endpoint, options); // retry with new token
    }

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = await res.text().catch(() => null);
    }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error("API error:", err);
    throw err;
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

  saveTokens(res.data);
  return res.data;
}

export async function signup(email, password) {
  const res = await apiFetch("/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(res.data?.detail || "Signup failed");
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

