// api.js
const API_BASE_URL = "https://api.voxellaai.site";

// --- helpers ---
export function silentLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("userId");
  window.location.href = "/login"; // frontend can handle navigation
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

    if (!res.ok) return false;

    const data = await res.json();
    if (data?.access_token) {
      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
      return true;
    }
  } catch (e) {
    console.error("Refresh token failed:", e);
  }
  return false;
}

// --- universal fetch with auto-refresh ---
export async function apiFetch(endpoint, options = {}, retry = true) {
  try {
    let token = localStorage.getItem("access_token");

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401 && retry) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return apiFetch(endpoint, options, false); // retry once
      }
      silentLogout();
      return null;
    }

    try {
      return await res.json();
    } catch {
      return null;
    }
  } catch (err) {
    console.error("apiFetch network error:", err);
    return null;
  }
}

// --- auth / account ---
export async function signup(email, password) {
  return apiFetch("/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function verifyEmail(email, code) {
  return apiFetch("/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function login(email, password) {
  const data = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!data || !data.access_token) return null;

  localStorage.setItem("access_token", data.access_token);
  if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("userEmail", email);
  if (data.user_id) localStorage.setItem("userId", data.user_id);

  return data;
}

// --- user ---
export async function fetchMe() {
  const data = await apiFetch("/me", { method: "GET" });
  if (!data || data.error) return null;
  return data;
}

// --- chat ---
export async function sendMessage(message, bot_name, user_name) {
  const user_id = localStorage.getItem("userId") || localStorage.getItem("userEmail");
  if (!user_id) return null;

  const data = await apiFetch("/chat", {
    method: "POST",
    body: JSON.stringify({ message, bot_name, user_name, user_id }),
  });

  if (!data || data.error) return null;
  return data;
}

export async function logout() {
  silentLogout();
}
