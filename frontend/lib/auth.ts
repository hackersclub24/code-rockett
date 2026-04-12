const ACCESS = "cr_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS);
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS);
}

export function parseJwtPayload(token: string): { role?: string; status?: string } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    return json;
  } catch {
    return null;
  }
}
