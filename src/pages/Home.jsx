import { useNavigate } from 'react-router-dom'
import useMobile from '../useMobile'

export default function Home() {
  const navigate = useNavigate()
  const isMobile = useMobile()

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Veteriner Epidemik Rapor Sistemi</h1>
      <p style={styles.subtitle}>Hangi hayvan türünü incelemek istiyorsunuz?</p>
      <div style={styles.cards}>
        <div style={{ ...styles.card, ...(isMobile ? styles.cardMobile : {}) }} onClick={() => navigate('/kedi')}>
          <span style={styles.emoji}>🐱</span>
          <h2 style={{ color: '#d97706' }}>Kedi</h2>
        </div>
        <div style={{ ...styles.card, ...(isMobile ? styles.cardMobile : {}) }} onClick={() => navigate('/kopek')}>
          <span style={styles.emoji}>🐶</span>
          <h2 style={{ color: '#2563eb' }}>Köpek</h2>
        </div>
        <div style={{ ...styles.card, ...(isMobile ? styles.cardMobile : {}) }} onClick={() => navigate('/kus')}>
          <span style={styles.emoji}>🦎</span>
          <h2 style={{ color: '#16a34a' }}>Egzotik</h2>
        </div>
      </div>
      <button style={styles.vakaBulBtn} onClick={() => navigate('/vaka-bul')}>
        🔍 Vaka Bul
      </button>
      <button style={styles.fluidBtn} onClick={() => navigate('/sivi-hesap')}>
        💧 Sıvı Hesaplayıcı
      </button>
      <button style={styles.dozBtn} onClick={() => navigate('/doz-hesap')}>
        💉 Doz Hesaplayıcı
      </button>
      <button style={styles.makaleBtn} onClick={() => navigate('/makale-ara')}>
        📚 Makale Ara
      </button>
      <button style={styles.adminBtn} onClick={() => navigate('/admin')}>
        Admin Paneli
      </button>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f4f8',
    fontFamily: 'sans-serif',
    padding: '2rem',
  },
  title: {
    fontSize: '2rem',
    color: '#1a202c',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  subtitle: {
    color: '#4a5568',
    marginBottom: '3rem',
    fontSize: '1.1rem',
  },
  cards: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    background: 'white',
    borderRadius: '1rem',
    padding: '3rem 4rem',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '2px solid transparent',
  },
  cardMobile: {
    padding: '1.5rem 2rem',
    flex: '1 1 calc(33% - 1rem)',
    minWidth: '90px',
  },
  emoji: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '1rem',
  },
  vakaBulBtn: {
    marginTop: '3rem',
    padding: '0.85rem 2.5rem',
    background: '#4f46e5',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 700,
    boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
  },
  fluidBtn: {
    marginTop: '0.75rem',
    padding: '0.85rem 2.5rem',
    background: '#0987a0',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 700,
    boxShadow: '0 4px 12px rgba(9,135,160,0.3)',
  },
  dozBtn: {
    marginTop: '0.75rem',
    padding: '0.85rem 2.5rem',
    background: '#6b46c1',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 700,
    boxShadow: '0 4px 12px rgba(107,70,193,0.3)',
  },
  makaleBtn: {
    marginTop: '0.75rem',
    padding: '0.85rem 2.5rem',
    background: '#38a169',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 700,
    boxShadow: '0 4px 12px rgba(56,161,105,0.3)',
  },
  adminBtn: {
    marginTop: '1rem',
    padding: '0.6rem 1.5rem',
    background: 'transparent',
    border: '1px solid #cbd5e0',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    color: '#718096',
    fontSize: '0.9rem',
  }
}
