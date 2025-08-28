// api.js
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.voxellaai.site";

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

    if (res.status === 401) {
      const data = await res.json();
      if (data.detail && data.detail.includes("Token has expired")) {
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

        return apiFetch(endpoint, options);
      }
    }

    // 🔥 Always return parsed JSON
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };

  } catch (err) {
    console.error("API error:", err);
    throw err;
  }
}


export default apiFetch;
