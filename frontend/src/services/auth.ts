export function getToken(): string | null {
  try {
    const t = localStorage.getItem('accessToken');
    if (t) return t;
  } catch (e) {
    
  }
  try {
    const t = sessionStorage.getItem('accessToken');
    if (t) return t;
  } catch (e) {
    
  }
  return null;
}

export async function getCurrentUser() {
  const token = getToken();
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to fetch current user (${res.status})`);
  }
  return res.json();
}
