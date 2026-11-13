import { auth } from "../firebase/config";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export async function apiRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const user = auth.currentUser;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (user) {
    const token = await user.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}

export async function apiJson<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await apiRequest(path, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
