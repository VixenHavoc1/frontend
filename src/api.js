const API_BASE_URL = "https://api.voxellaai.site";

// --- helpers ---
export async function getJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function silentLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("userEmail");
  window.location.href = "/login";
}

export async function apiFetch(endpoint, options = {}, retry = true) {
  const accessToken = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefreshToken();
    if (refreshed) return apiFetch(endpoint, options, false);
    silentLogout();
    return null;
  }

  return res;
}

export async function tryRefreshToken() {
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

// --- auth ---
export async function login(email, password) {
  const res = await apiFetch("/login", { method: "POST", body: JSON.stringify({ email, password }) });
  const data = await getJsonSafe(res);
  if (!res?.ok || !data?.access_token) return null;

  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token||"");
  localStorage.setItem("userEmail", email);
  return data;
}

export async function signup(email, password) {
  const res = await apiFetch("/signup", { method: "POST", body: JSON.stringify({ email, password }) });
  return await getJsonSafe(res);
}

export async function verifyEmail(email, code) {
  const res = await apiFetch("/verify", { method: "POST", body: JSON.stringify({ email, code }) });
  return await getJsonSafe(res);
}

// --- user ---
export async function fetchMe() {
  const res = await apiFetch("/me");
  const data = await getJsonSafe(res);
  if (!res?.ok || data?.error) return null;
  return data;
}

// --- chat ---
export async function sendMessage(message, bot_name, user_name) {
  const user_id = localStorage.getItem("userEmail");
  if (!user_id) return null;

  const res = await apiFetch("/chat", { method: "POST", body: JSON.stringify({ message, bot_name, user_name, user_id }) });
  const data = await getJsonSafe(res);
  if (!res?.ok || data?.error) return null;
  return data;
}

export async function logout() {
  silentLogout();
}
