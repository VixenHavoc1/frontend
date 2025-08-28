// api.js
const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.voxellaai.site";

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle expired access token → refresh
    if (res.status === 401) {
      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (data?.detail?.includes("Token has expired")) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token found");

        const refreshRes = await fetch(`${API_URL}/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!refreshRes.ok) throw new Error("Failed to refresh token");

        const refreshData = await refreshRes.json();
        localStorage.setItem("token", refreshData.access_token);

        return apiFetch(endpoint, options); // retry original request
      }
    }

    // Always try to parse JSON safely
    let data = null;
    try {
      data = await res.json();
    } catch {
      // fallback → text response
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

  // Save tokens
  localStorage.setItem("token", res.data.access_token);
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

