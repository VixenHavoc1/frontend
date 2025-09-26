// api.js
const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.voxellaai.site") + "/api";

/**
 * Safe JSON parser for fetch Responses
 */
async function getJsonSafe(res) {
  if (!res) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Silent logout: clear tokens and redirect to /login
 */
function silentLogout() {
  try {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  } catch (e) {
    // ignore storage errors
  }
  window.location.href = "/login";
}

/**
 * Try to refresh access token using stored refresh_token.
 * Returns true on success (tokens updated), false on failure.
 */
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

    const data = await getJsonSafe(res);
    if (!data || !data.access_token) return false;

    localStorage.setItem("access_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }
    return true;
  } catch (err) {
    console.error("Silent refresh failed:", err);
    return false;
  }
}

/**
 * Main fetch wrapper
 */
async function apiFetch(endpoint, options = {}) {
  try {
    let token = localStorage.getItem("access_token");

    const baseHeaders = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    let res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: baseHeaders,
    });

    // If unauthorized, try refresh and retry once
    if (res.status === 401) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        token = localStorage.getItem("access_token");
        const retryHeaders = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        };
        try {
          return await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: retryHeaders,
          });
        } catch (err) {
          console.error("Silent retry failed:", err);
          return null;
        }
      } else {
        silentLogout();
        return null;
      }
    }

    return res;
  } catch (err) {
    console.error("apiFetch silent error:", err);
    return null;
  }
}

/* ---- Auth helpers ---- */

export async function login(email, password) {
  const res = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!res) return null;
  const data = await getJsonSafe(res);
  if (!res.ok || !data) return null;

  if (data.access_token) localStorage.setItem("access_token", data.access_token);
  if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);

  return data;
}

export async function signup(email, password) {
  const res = await apiFetch("/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!res) return null;
  const data = await getJsonSafe(res);
  if (!res.ok) return null;

  return data || null;
}

export async function verifyEmail(email, code) {
  const res = await apiFetch("/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });

  if (!res) return null;
  const data = await getJsonSafe(res);
  if (!res.ok) return null;

  return data || null;
}

/* Fetch user info */
export async function fetchMe() {
  const res = await apiFetch("/me");
  if (!res) return null;
  const data = await getJsonSafe(res);
  return res.ok && data ? data : null;
}

/* Chat endpoint */
export async function sendMessage(message, bot_name, user_name) {
  const res = await apiFetch("/chat", {
    method: "POST",
    body: JSON.stringify({ message, bot_name, user_name }),
  });

  if (!res) return null;
  const data = await getJsonSafe(res);
  return res.ok && data ? data : null;
}

/* Optional explicit logout */
export function logout() {
  silentLogout();
}

/* Default export */
export default apiFetch;
