import { useNavigate } from 'react-router-dom'
import useMobile from '../useMobile'

const PAW_POSITIONS = [
  { top: '8%',  left: '5%',  size: '2.2rem', opacity: 0.13, rotate: -20, delay: 0 },
  { top: '15%', left: '88%', size: '1.7rem', opacity: 0.10, rotate: 30,  delay: 1.2 },
  { top: '35%', left: '3%',  size: '1.4rem', opacity: 0.09, rotate: 10,  delay: 2.4 },
  { top: '55%', left: '92%', size: '2rem',   opacity: 0.12, rotate: -15, delay: 0.8 },
  { top: '70%', left: '8%',  size: '1.6rem', opacity: 0.08, rotate: 25,  delay: 1.8 },
  { top: '80%', left: '80%', size: '2.4rem', opacity: 0.11, rotate: -35, delay: 3.0 },
  { top: '90%', left: '45%', size: '1.5rem', opacity: 0.07, rotate: 15,  delay: 2.0 },
  { top: '25%', left: '50%', size: '1.2rem', opacity: 0.06, rotate: -10, delay: 1.5 },
  { top: '60%', left: '55%', size: '1.8rem', opacity: 0.08, rotate: 40,  delay: 0.5 },
  { top: '45%', left: '72%', size: '1.3rem', opacity: 0.07, rotate: -25, delay: 2.8 },
]

export default function Home() {
  const navigate = useNavigate()
  const isMobile = useMobile()

  return (
    <div style={styles.container}>
      {/* Animated background paw prints */}
      {PAW_POSITIONS.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            fontSize: p.size,
            opacity: p.opacity,
            transform: `rotate(${p.rotate}deg)`,
            animation: `floatPaw 6s ease-in-out ${p.delay}s infinite alternate`,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}
        >
          🐾
        </span>
      ))}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoCircle}>
          <span style={{ fontSize: '2.6rem' }}>🩺</span>
        </div>
        <h1 style={styles.title}>Veteriner Epidemik<br />Rapor Sistemi</h1>
        <p style={styles.subtitle}>Tanı destekten hesaplayıcılara, tek platformda profesyonel araçlar</p>
        <div style={styles.divider} />
      </div>

      {/* Species cards */}
      <p style={styles.sectionLabel}>Hayvan Türü Seçin</p>
      <div style={{ ...styles.cards, ...(isMobile ? styles.cardsMobile : {}) }}>
        {[
          { emoji: '🐱', label: 'Kedi',   color: '#d97706', bg: '#fffbeb', border: '#fde68a', path: '/kedi' },
          { emoji: '🐶', label: 'Köpek',  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', path: '/kopek' },
          { emoji: '🦎', label: 'Egzotik',color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', path: '/kus' },
        ].map(({ emoji, label, color, bg, border, path }) => (
          <div
            key={label}
            style={{ ...styles.card, background: bg, borderColor: border }}
            onClick={() => navigate(path)}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'
              e.currentTarget.style.boxShadow = `0 16px 40px ${border}`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = styles.card.boxShadow
            }}
          >
            <span style={styles.emoji}>{emoji}</span>
            <h2 style={{ color, margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{label}</h2>
          </div>
        ))}
      </div>

      {/* Tool buttons */}
      <p style={{ ...styles.sectionLabel, marginTop: '2.5rem' }}>Araçlar</p>
      <div style={{ ...styles.toolGrid, ...(isMobile ? styles.toolGridMobile : {}) }}>
        {[
          { icon: '🔍', label: 'Vaka Bul',          path: '/vaka-bul',   color: '#4f46e5', shadow: 'rgba(79,70,229,0.25)' },
          { icon: '💧', label: 'Sıvı Hesaplayıcı',  path: '/sivi-hesap', color: '#0987a0', shadow: 'rgba(9,135,160,0.25)' },
          { icon: '💉', label: 'Doz Hesaplayıcı',   path: '/doz-hesap',  color: '#6b46c1', shadow: 'rgba(107,70,193,0.25)' },
          { icon: '📚', label: 'Makale Ara',         path: '/makale-ara', color: '#16803c', shadow: 'rgba(22,128,60,0.25)' },
        ].map(({ icon, label, path, color, shadow }) => (
          <button
            key={label}
            style={{ ...styles.toolBtn, background: color, boxShadow: `0 4px 16px ${shadow}` }}
            onClick={() => navigate(path)}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <span style={{ fontSize: '1.4rem' }}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Admin link */}
      <button style={styles.adminBtn} onClick={() => navigate('/admin')}>
        ⚙️ Admin Paneli
      </button>

      <style>{`
        @keyframes floatPaw {
          from { transform: translateY(0px) rotate(var(--r, 0deg)); }
          to   { transform: translateY(-18px) rotate(var(--r, 0deg)); }
        }
      `}</style>
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
    background: 'linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 40%, #f3e5f5 100%)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: '3rem 1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
    marginBottom: '0.5rem',
  },
  logoCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    marginBottom: '1.2rem',
  },
  title: {
    fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
    fontWeight: 800,
    color: '#1a202c',
    textAlign: 'center',
    margin: '0 0 0.75rem',
    lineHeight: 1.25,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#4a5568',
    fontSize: '1rem',
    textAlign: 'center',
    maxWidth: '420px',
    lineHeight: 1.6,
    margin: 0,
  },
  divider: {
    width: '60px',
    height: '4px',
    borderRadius: '2px',
    background: 'linear-gradient(90deg, #4f46e5, #16a34a)',
    margin: '1.5rem auto 0',
  },
  sectionLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#718096',
    marginBottom: '1rem',
    marginTop: '2rem',
    zIndex: 1,
  },
  cards: {
    display: 'flex',
    gap: '1.25rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    zIndex: 1,
  },
  cardsMobile: {
    gap: '0.75rem',
  },
  card: {
    borderRadius: '1.25rem',
    padding: '2rem 2.5rem',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
    transition: 'transform 0.22s, box-shadow 0.22s',
    border: '2px solid transparent',
    minWidth: '130px',
    zIndex: 1,
  },
  emoji: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '0.75rem',
  },
  toolGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.85rem',
    width: '100%',
    maxWidth: '440px',
    zIndex: 1,
  },
  toolGridMobile: {
    gridTemplateColumns: '1fr',
    maxWidth: '320px',
  },
  toolBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.85rem 1.25rem',
    border: 'none',
    borderRadius: '0.85rem',
    cursor: 'pointer',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: 700,
    transition: 'filter 0.18s, transform 0.18s',
    letterSpacing: '0.01em',
  },
  adminBtn: {
    marginTop: '2rem',
    padding: '0.55rem 1.4rem',
    background: 'rgba(255,255,255,0.6)',
    border: '1px solid #cbd5e0',
    borderRadius: '0.6rem',
    cursor: 'pointer',
    color: '#718096',
    fontSize: '0.85rem',
    fontWeight: 500,
    backdropFilter: 'blur(6px)',
    zIndex: 1,
    transition: 'background 0.18s',
  },
}
