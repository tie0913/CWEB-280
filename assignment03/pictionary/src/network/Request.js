import { useUserStore } from "../stores/UserStore";
const API_BASE = import.meta.env.VITE_API_BASE;

export async function apiRequest(path, options = {}) {
  const auth = useUserStore();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
 
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers
    });
  } catch (err) {
    throw new Error("Network error, please check your connection.");
  }

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      auth.logout()
      return {"code":1, message:"Session expired. Please sign in again."}
    }
    throw new Error(result?.message || "Unexpected API error")
  }else{
    return result
  }
}