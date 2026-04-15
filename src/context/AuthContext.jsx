import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vt_token');
    if (!token) { setLoading(false); return; }

    // /refresh kullan: hem güncel user hem yeni token döner (rol değişmiş olabilir)
    fetch(`${API}/api/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('vt_token', data.token);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function login(userData, token) {
    localStorage.setItem('vt_token', token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('vt_token');
    setUser(null);
  }

  function getToken() {
    return localStorage.getItem('vt_token');
  }

  async function refreshToken() {
    const token = localStorage.getItem('vt_token');
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/auth/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      localStorage.setItem('vt_token', data.token);
      setUser(data.user);
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getToken, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
