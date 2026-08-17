// lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token = localStorage.getItem("caskayd_token");

  // Base headers with Authorization
  const headers: Record<string, string> = {
    Authorization: token ? `Bearer ${token}` : "",
  };

  // ONLY attach Content-Type if we are actually sending a body
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  // Merge any custom headers passed in via options
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  // If the url passed is just a path (e.g. "/api/users"), prepend the BASE_URL
  const finalUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  let response = await fetch(finalUrl, { ...options, headers });

  if (response.status === 401) {
    const refreshToken = localStorage.getItem("caskayd_refresh_token");

    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const newAccessToken = data.accessToken || data.token;
          
          if (newAccessToken) {
            localStorage.setItem("caskayd_token", newAccessToken);
            headers["Authorization"] = `Bearer ${newAccessToken}`;
            // Retry the original request
            return await fetch(finalUrl, { ...options, headers });
          }
        }
      } catch (err) {
        console.error("Token refresh failed:", err);
      }
    }
    // If refresh fails, clear tokens and kick to login
    localStorage.removeItem("caskayd_token");
    localStorage.removeItem("caskayd_refresh_token");
    window.location.href = "/login";
  }

  return response;
}