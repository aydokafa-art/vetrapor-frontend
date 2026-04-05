import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || ''

export default function MakaleAra() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [articles, setArticles] = useState([])
  const [selected, setSelected] = useState(null)
  const [ozetTipi, setOzetTipi] = useState('kapsamli')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true)
    setArticles([])
    setSelected(null)
    setSent(false)
    setError(null)
    try {
      const res = await axios.post(`${API}/api/articles/search`, { topic: topic.trim() }, { timeout: 30000 })
      setArticles(res.data.articles)
    } catch (err) {
      setError(err.response?.data?.error || 'Makaleler getirilemedi.')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!selected || !email.trim()) return
    setSending(true)
    setSent(false)
    setError(null)
    try {
      await axios.post(`${API}/api/articles/send`, { article: selected, email: email.trim(), ozetTipi })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Mail gönderilemedi.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/')}>← Geri</button>

      <div style={styles.card}>
        <div style={styles.iconWrap}>📚</div>
        <h1 style={styles.title}>Makale Ara</h1>
        <p style={styles.subtitle}>Konu girin, makaleler listelensin — birini seçip mail adresinize gönderin.</p>

        {/* Adım 1: Arama */}
        <form onSubmit={handleSearch} style={styles.form}>
          <label style={styles.label}>Konu Başlığı</label>
          <div style={styles.searchRow}>
            <input
              style={styles.input}
              type="text"
              placeholder="örn: köpeklerde parvovirus"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              style={{ ...styles.searchBtn, opacity: loading || !topic ? 0.6 : 1 }}
              disabled={loading || !topic.trim()}
            >
              {loading ? '...' : 'Ara'}
            </button>
          </div>
        </form>

        {loading && <p style={styles.loadingText}>Makaleler aranıyor...</p>}

        {!loading && articles.length === 0 && topic && !error && (
          <p style={{ ...styles.loadingText, color: '#e53e3e', marginTop: '1rem' }}>
            Sonuç bulunamadı. Konuyu İngilizce yazmayı deneyin (örn: "canine parvovirus").
          </p>
        )}

        {/* Adım 2: Makale listesi */}
        {articles.length > 0 && (
          <div style={styles.listWrap}>
            <p style={styles.listTitle}>{articles.length} makale bulundu — birini seçin:</p>
            {articles.map((a, i) => (
              <div
                key={i}
                style={{
                  ...styles.articleCard,
                  border: selected === a
                    ? '2px solid #38a169'
                    : '2px solid #e2e8f0',
                  background: selected === a ? '#f0fff4' : 'white',
                }}
                onClick={() => { setSelected(a); setSent(false); setError(null) }}
              >
                <div style={styles.articleTitle}>{a.baslik}</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '5px 0' }}>
                  {a.kaynak && (
                    <span style={{
                      ...styles.badge,
                      background: a.kaynak === 'PubMed' ? '#dbeafe' : a.kaynak === 'Europe PMC' ? '#d1fae5' : '#ede9fe',
                      color: a.kaynak === 'PubMed' ? '#1d4ed8' : a.kaynak === 'Europe PMC' ? '#065f46' : '#5b21b6',
                    }}>{a.kaynak}</span>
                  )}
                  {a.yil && (
                    <span style={{
                      ...styles.badge,
                      background: parseInt(a.yil) >= 2023 ? '#fef3c7' : parseInt(a.yil) >= 2020 ? '#e0f2fe' : '#f3f4f6',
                      color: parseInt(a.yil) >= 2023 ? '#92400e' : parseInt(a.yil) >= 2020 ? '#0369a1' : '#6b7280',
                    }}>{a.yil}</span>
                  )}
                </div>
                <div style={styles.articleMeta}>{a.yazarlar} {a.dergi ? `· ${a.dergi}` : ''}</div>
                <div style={styles.articleOzet}>{a.ozet}</div>
              </div>
            ))}
          </div>
        )}

        {/* Adım 3: Mail gönder */}
        {selected && (
          <form onSubmit={handleSend} style={{ ...styles.form, marginTop: '1.5rem' }}>
            <div style={styles.selectedBadge}>
              ✅ Seçili: <strong>{selected.baslik}</strong>
            </div>

            <label style={styles.label}>Özet Tipi</label>
            <div style={styles.ozetRow}>
              {[
                { value: 'kisa', label: '⚡ Kısa', desc: '3-4 cümle, temel bulgular' },
                { value: 'orta', label: '📄 Orta', desc: 'Amaç + Bulgular + Sonuç' },
                { value: 'kapsamli', label: '📋 Kapsamlı', desc: 'Tüm bölümler + Klinik Önemi' },
              ].map(opt => (
                <div
                  key={opt.value}
                  style={{
                    ...styles.ozetCard,
                    border: ozetTipi === opt.value ? '2px solid #4f46e5' : '2px solid #e2e8f0',
                    background: ozetTipi === opt.value ? '#eef2ff' : 'white',
                  }}
                  onClick={() => setOzetTipi(opt.value)}
                >
                  <div style={styles.ozetLabel}>{opt.label}</div>
                  <div style={styles.ozetDesc}>{opt.desc}</div>
                </div>
              ))}
            </div>

            <label style={styles.label}>E-posta Adresi</label>
            <div style={styles.searchRow}>
              <input
                style={styles.input}
                type="email"
                placeholder="ornek@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                style={{ ...styles.sendBtn, opacity: sending || !email ? 0.6 : 1 }}
                disabled={sending || !email.trim()}
              >
                {sending ? '...' : 'Gönder'}
              </button>
            </div>
          </form>
        )}

        {sent && (
          <div style={styles.successBox}>
            ✅ Word dosyası <strong>{email}</strong> adresine gönderildi.
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>❌ {error}</div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0d2b1a 0%, #0a2030 50%, #071528 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
    fontFamily: 'sans-serif',
  },
  backBtn: {
    alignSelf: 'flex-start',
    background: 'transparent',
    border: 'none',
    color: '#4f46e5',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '1rem',
    fontWeight: 600,
  },
  card: {
    background: 'white',
    borderRadius: '1.25rem',
    padding: '2.5rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
    width: '100%',
    maxWidth: '640px',
  },
  iconWrap: { fontSize: '3rem', textAlign: 'center', marginBottom: '0.5rem' },
  title: { textAlign: 'center', fontSize: '1.75rem', color: '#1a202c', margin: '0 0 0.5rem' },
  subtitle: { textAlign: 'center', color: '#718096', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' },
  searchRow: { display: 'flex', gap: '0.5rem' },
  input: {
    flex: 1,
    padding: '0.7rem 1rem',
    borderRadius: '0.6rem',
    border: '1.5px solid #e2e8f0',
    fontSize: '1rem',
    outline: 'none',
  },
  searchBtn: {
    padding: '0.7rem 1.25rem',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '0.6rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  sendBtn: {
    padding: '0.7rem 1.25rem',
    background: '#38a169',
    color: 'white',
    border: 'none',
    borderRadius: '0.6rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  loadingText: { textAlign: 'center', color: '#718096', marginTop: '1rem' },
  listWrap: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  listTitle: { fontWeight: 600, color: '#2d3748', marginBottom: '0.25rem' },
  articleCard: {
    borderRadius: '0.75rem',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'border 0.15s, background 0.15s',
  },
  articleTitle: { fontWeight: 700, color: '#1a202c', fontSize: '0.95rem', marginBottom: '0.25rem' },
  articleMeta: { color: '#718096', fontSize: '0.82rem', marginBottom: '0.4rem' },
  articleOzet: { color: '#4a5568', fontSize: '0.88rem', lineHeight: 1.5 },
  selectedBadge: {
    background: '#f0fff4',
    border: '1px solid #9ae6b4',
    borderRadius: '0.5rem',
    padding: '0.6rem 0.9rem',
    fontSize: '0.88rem',
    color: '#276749',
  },
  successBox: {
    marginTop: '1rem',
    background: '#f0fff4',
    border: '1px solid #9ae6b4',
    borderRadius: '0.75rem',
    padding: '1rem',
    color: '#276749',
    fontSize: '0.95rem',
  },
  errorBox: {
    marginTop: '1rem',
    background: '#fff5f5',
    border: '1px solid #fc8181',
    borderRadius: '0.75rem',
    padding: '1rem',
    color: '#c53030',
    fontSize: '0.95rem',
  },
  ozetRow: {
    display: 'flex',
    gap: '0.6rem',
    flexWrap: 'wrap',
  },
  ozetCard: {
    flex: 1,
    minWidth: '100px',
    borderRadius: '0.6rem',
    padding: '0.6rem 0.8rem',
    cursor: 'pointer',
    transition: 'border 0.15s, background 0.15s',
  },
  ozetLabel: {
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#2d3748',
    marginBottom: '0.2rem',
  },
  ozetDesc: {
    fontSize: '0.78rem',
    color: '#718096',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
}
