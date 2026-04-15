import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

export default function Giris() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Giriş başarısız'); return; }
      login(data.user, data.token);
      navigate('/');
    } catch {
      setError('Sunucuya bağlanılamadı');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.logo}>🐾</div>
        <h1 style={s.title}>Vetrapor</h1>
        <p style={s.sub}>Hesabına giriş yap</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>E-posta</label>
          <input
            style={s.input}
            type="email"
            placeholder="hekim@klinik.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
          <label style={s.label}>Şifre</label>
          <input
            style={s.input}
            type="password"
            placeholder="••••••"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />

          {error && <div style={s.error}>{error}</div>}

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p style={s.footer}>
          Hesabın yok mu?{' '}
          <Link to="/kayit" style={s.link}>Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1e5c3a 0%, #1a4d5e 50%, #1a3d7a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    fontFamily: 'sans-serif',
  },
  card: {
    background: 'white',
    borderRadius: '1.5rem',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  logo: { fontSize: '2.5rem', marginBottom: '0.5rem' },
  title: { margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' },
  sub: { color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: '1.75rem' },
  form: { textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.82rem', fontWeight: 600, color: '#374151' },
  input: {
    border: '1.5px solid #e2e8f0',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    outline: 'none',
    marginBottom: '0.5rem',
    width: '100%',
    boxSizing: 'border-box',
    color: '#1e293b',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    borderRadius: '0.6rem',
    padding: '0.6rem 0.9rem',
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
  },
  btn: {
    background: 'linear-gradient(135deg, #1e5c3a, #1a4d5e)',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    padding: '0.85rem',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  footer: { marginTop: '1.5rem', color: '#64748b', fontSize: '0.88rem' },
  link: { color: '#2563eb', fontWeight: 600, textDecoration: 'none' },
};
