export function isValidToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  if (token === 'undefined' || token === 'null' || token.trim() === '') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload && typeof payload === 'object';
  } catch {
    return false;
  }
}

export function storeToken(token: string | null | undefined): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem('token');

    if (!isValidToken(token)) {
      return false;
    }

    if (token) {
      localStorage.setItem('token', token);
      return localStorage.getItem('token') === token;
    }
  } catch {
    return false;
  }

  return false;
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem('token');

  if (isValidToken(token)) {
    return token;
  }

  localStorage.removeItem('token');
  return null;
}
