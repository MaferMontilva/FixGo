const REFRESH_TOKEN_KEY = "fixgo.refreshToken";

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeRefreshToken(refreshToken: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearStoredRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
