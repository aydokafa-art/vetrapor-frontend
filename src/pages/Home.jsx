import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={s.container}>
      <div style={s.pawBg} aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} style={{
            position: 'absolute',
            fontSize: `${1.2 + (i % 3) * 0.6}rem`,
            opacity: 0.12 + (i % 3) * 0.04,
            top: `${(i * 19 + 7) % 95}%`,
            left: `${(i * 23 + 5) % 92}%`,
            transform: `rotate(${(i * 37) % 360}deg)`,
            userSelect: 'none',
            pointerEvents: 'none',
          }}>🐾</span>
        ))}
      </div>
      <div style={s.inner}>
        <h1 style={s.title}>Veteriner Epidemik Rapor Sistemi</h1>
        <p style={s.subtitle}>Tanı desteği, epidemik raporlama ve klinik hesaplayıcılar{'\n'}tek çatı altında, hızlı ve güvenilir.</p>

        <div style={s.sectionLabel}>HAYVAN TÜRÜ</div>
        <div style={s.animalRow}>
          <div style={{ ...s.animalCard, borderColor: '#fbbf24', background: '#fffbeb' }} onClick={() => navigate('/kedi')}>
            <span style={s.animalEmoji}>🐱</span>
            <span style={{ ...s.animalName, color: '#d97706' }}>Kedi</span>
          </div>
          <div style={{ ...s.animalCard, borderColor: '#93c5fd', background: '#eff6ff' }} onClick={() => navigate('/kopek')}>
            <span style={s.animalEmoji}>🐶</span>
            <span style={{ ...s.animalName, color: '#2563eb' }}>Köpek</span>
          </div>
          <div style={{ ...s.animalCard, borderColor: '#86efac', background: '#f0fdf4' }} onClick={() => navigate('/kus')}>
            <span style={s.animalEmoji}>🦎</span>
            <span style={{ ...s.animalName, color: '#16a34a' }}>Egzotik</span>
          </div>
        </div>

        <div style={s.divider} />

        <div style={s.sectionLabel}>ARAÇLAR</div>
        <div style={s.toolList}>
          <div style={{ ...s.toolBtn, background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }} onClick={() => navigate('/vaka-bul')}>
            <div style={s.toolIcon}>🔍</div>
            <div>
              <div style={s.toolTitle}>Vaka Bul</div>
              <div style={s.toolDesc}>Semptoma göre vaka ara</div>
            </div>
          </div>
          <div style={{ ...s.toolBtn, background: 'linear-gradient(135deg, #0891b2, #06b6d4)' }} onClick={() => navigate('/sivi-hesap')}>
            <div style={s.toolIcon}>💧</div>
            <div>
              <div style={s.toolTitle}>Sıvı Hesap</div>
              <div style={s.toolDesc}>İV sıvı miktarı hesapla</div>
            </div>
          </div>
          <div style={{ ...s.toolBtn, background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }} onClick={() => navigate('/doz-hesap')}>
            <div style={s.toolIcon}>💉</div>
            <div>
              <div style={s.toolTitle}>Doz Hesap</div>
              <div style={s.toolDesc}>İlaç dozunu hesapla</div>
            </div>
          </div>
          <div style={{ ...s.toolBtn, background: 'linear-gradient(135deg, #16a34a, #22c55e)' }} onClick={() => navigate('/makale-ara')}>
            <div style={s.toolIcon}>📚</div>
            <div>
              <div style={s.toolTitle}>Makale Ara</div>
              <div style={s.toolDesc}>Veteriner literatürü</div>
            </div>
          </div>
        </div>

        <button style={s.adminBtn} onClick={() => navigate('/admin')}>⚙ Admin Paneli</button>
      </div>
    </div>
  )
}

const s = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1e5c3a 0%, #1a4d5e 50%, #1a3d7a 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
    padding: '2rem 1rem',
  },
  pawBg: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  inner: {
    width: '100%',
    maxWidth: 480,
    position: 'relative',
    zIndex: 1,
  },
  title: {
    color: 'white',
    fontSize: '1.4rem',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: '2rem',
    whiteSpace: 'pre-line',
  },
  sectionLabel: {
    color: '#64748b',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    marginBottom: '0.75rem',
  },
  animalRow: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  animalCard: {
    flex: 1,
    background: 'rgba(255,255,255,0.07)',
    border: '2px solid',
    borderRadius: '1rem',
    padding: '1.25rem 0.5rem',
    cursor: 'pointer',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'transform 0.15s',
  },
  animalEmoji: { fontSize: '2.2rem' },
  animalName: { fontWeight: 700, fontSize: '1rem' },
  divider: {
    borderTop: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '1.5rem',
  },
  toolList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  toolBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    borderRadius: '1rem',
    cursor: 'pointer',
    border: 'none',
    color: 'white',
  },
  toolIcon: {
    fontSize: '1.6rem',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '0.6rem',
    width: '2.8rem',
    height: '2.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  toolTitle: { fontWeight: 700, fontSize: '1rem', color: 'white' },
  toolDesc: { fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', marginTop: '0.1rem' },
  adminBtn: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '0.75rem',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.85rem',
    padding: '0.6rem 1.25rem',
    width: '100%',
  },
}
