import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || ''

const TAG_LABELS = { TANI: '🔎 Tanıya Giden Yol', DDX: '🔀 Ayırıcı Tanılar', LAB: '🧪 Lab Yorumu', TAKİP: '📌 Takip' }

function renderAI(text) {
  if (!text) return null
  const blocks = []
  const tagRegex = /\[(TANI|DDX|LAB|TAKİP)\]/g
  const parts = text.split(tagRegex)
  for (let i = 0; i < parts.length; i++) {
    const tag = TAG_LABELS[parts[i]]
    if (tag && parts[i + 1]) {
      blocks.push(
        <div key={i} style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6d28d9', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{tag}</div>
          <div style={{ color: '#4c1d95', fontSize: '0.9rem', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{parts[i + 1].trim()}</div>
        </div>
      )
      i++
    }
  }
  return blocks.length > 0 ? blocks : <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{text}</p>
}

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, getToken } = useAuth()
  const [c, setC] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [aiComment, setAiComment] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [publishMsg, setPublishMsg] = useState('')
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  const authHeaders = () => {
    const t = getToken()
    return t ? { Authorization: `Bearer ${t}` } : {}
  }

  useEffect(() => {
    axios.get(`${API}/api/cases/${id}`, { headers: authHeaders() })
      .then(r => setC(r.data))
      .catch(() => setC(null))
      .finally(() => setLoading(false))
    axios.get(`${API}/api/cases/${id}/comments`, { headers: authHeaders() })
      .then(r => setComments(r.data))
      .catch(() => {})
  }, [id])

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    setCommentLoading(true)
    try {
      const res = await axios.post(`${API}/api/cases/${id}/comments`, { text: commentText }, { headers: authHeaders() })
      setComments(prev => [...prev, res.data])
      setCommentText('')
    } catch (err) {
      alert(err.response?.data?.error || 'Yorum gönderilemedi')
    } finally {
      setCommentLoading(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API}/api/cases/${id}/comments/${commentId}`, { headers: authHeaders() })
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch {}
  }

  const generateAi = async () => {
    setAiLoading(true)
    try {
      const res = await axios.post(`${API}/api/cases/${id}/analyze`, {}, { headers: authHeaders() })
      setAiComment(res.data.analysis)
    } catch {
      setAiComment('Analiz oluşturulurken bir hata oluştu.')
    } finally {
      setAiLoading(false)
    }
  }

  const handlePublishRequest = async () => {
    try {
      const res = await axios.post(`${API}/api/cases/${id}/publish-request`, {}, { headers: authHeaders() })
      setPublishMsg(res.data.message || res.data.error)
      setC(prev => ({ ...prev, ownership: { ...prev.ownership, publish_requested: 1 } }))
    } catch (err) {
      setPublishMsg(err.response?.data?.error || 'Hata')
    }
  }

  const handlePublishApprove = async () => {
    try {
      const res = await axios.post(`${API}/api/cases/${id}/publish-approve`, {}, { headers: authHeaders() })
      setPublishMsg(res.data.message || res.data.error)
      setC(prev => ({ ...prev, ownership: { ...prev.ownership, is_public: 1 } }))
    } catch (err) {
      setPublishMsg(err.response?.data?.error || 'Hata')
    }
  }

  if (loading) return <div style={s.center}>Yükleniyor...</div>
  if (!c) return <div style={s.center}>Vaka bulunamadı.</div>

  const isPubMed = c.source && c.source.includes('PubMed')

  const dateRegex = /\((\d{2}\.\d{2}\.\d{4})\)/
  const getDate = name => { const m = name.match(dateRegex); return m ? m[1] : 'Tarihsiz' }
  const cleanName = name => name.replace(dateRegex, '').trim()
  const labGroups = {}
  ;(c.lab_values || []).forEach(l => {
    const d = getDate(l.name)
    if (!labGroups[d]) labGroups[d] = []
    labGroups[d].push({ ...l, cleanName: cleanName(l.name) })
  })
  const sortedDates = Object.keys(labGroups).sort((a, b) => {
    if (a === 'Tarihsiz') return 1; if (b === 'Tarihsiz') return -1
    const [da, ma, ya] = a.split('.'); const [db2, mb, yb] = b.split('.')
    return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db2)
  })

  const labStatusStyle = s => s === 'yuksek' ? { color: '#c53030', fontWeight: 700 } : s === 'dusuk' ? { color: '#744210', fontWeight: 700 } : { color: '#276749', fontWeight: 600 }
  const labStatusLabel = s => s === 'yuksek' ? '↑ Yüksek' : s === 'dusuk' ? '↓ Düşük' : '✓ Normal'

  return (
    <div style={s.container}>
      <button style={s.back} onClick={() => navigate(-1)}>← Geri</button>

      {/* Kuruma özel / yayın durumu */}
      {c.ownership && !c.ownership.is_public && (
        <div style={s.privateBar}>
          <span>🔒 Bu vaka kuruma özel</span>
          {publishMsg && <span style={{ marginLeft: '1rem', color: '#16a34a', fontSize: '0.82rem' }}>{publishMsg}</span>}
          {!c.ownership.publish_requested && (user?.role === 'institution_owner' || user?.role === 'super_admin') && (
            <button style={s.publishBtn} onClick={handlePublishRequest}>Genel havuza ekle</button>
          )}
          {c.ownership.publish_requested && user?.role === 'super_admin' && (
            <button style={{ ...s.publishBtn, background: '#16a34a' }} onClick={handlePublishApprove}>Onayla — Genel havuza al</button>
          )}
          {c.ownership.publish_requested && user?.role !== 'super_admin' && (
            <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>⏳ Onay bekleniyor</span>
          )}
        </div>
      )}

      <div style={s.card}>
        {/* Başlık */}
        <div style={s.header}>
          <span style={s.hastaAdi}>🐾 {c.hasta_adi}{c.breed ? ` — ${c.breed}` : ''}</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {isPubMed && <a href={c.pubmed_link} target="_blank" rel="noreferrer" style={s.pubmedBadge}>PubMed ↗</a>}
            {c.report_date && <span style={s.meta}>📅 {c.report_date}</span>}
          </div>
        </div>

        {/* Detay */}
        <div style={s.detailRow}>
          {c.hasta_sahibi && <span style={s.detailItem}>👤 <strong>Sahip:</strong> {c.hasta_sahibi}</span>}
          <span style={s.detailItem}>🎂 <strong>Yaş:</strong> {c.age_value ? `${c.age_value} ${c.age_unit}` : 'Bilinmiyor'}</span>
          {c.weight > 0 && <span style={s.detailItem}>⚖️ <strong>Kilo:</strong> {c.weight} kg</span>}
          {c.cinsiyet && <span style={s.detailItem}>{c.cinsiyet === 'erkek' ? '♂' : c.cinsiyet === 'disi' || c.cinsiyet === 'dişi' ? '♀' : '⚥'} <strong>Cinsiyet:</strong> {c.cinsiyet.charAt(0).toUpperCase() + c.cinsiyet.slice(1)}</span>}
        </div>

        <div style={s.divider} />

        {c.anamnesis && <Section label="📖 Vaka Öyküsü"><p style={s.text}>{c.anamnesis}</p></Section>}
        {c.symptoms?.length > 0 && (
          <Section label="⚠️ Semptomlar">
            <div style={s.chipRow}>{c.symptoms.map((sym, i) => <span key={i} style={s.symptomBadge}>{sym}</span>)}</div>
          </Section>
        )}
        {c.diagnostic_methods?.length > 0 && (
          <Section label="🩻 Tanı Yöntemleri">
            <div style={s.chipRow}>{c.diagnostic_methods.map((m, i) => <span key={i} style={s.chipBlue}>{m}</span>)}</div>
          </Section>
        )}
        {c.diagnosis && <Section label="🔬 Tanı"><p style={s.diagnosisText}>{c.diagnosis}</p></Section>}

        {c.lab_values?.length > 0 && (
          <Section label="🧪 Laboratuvar Sonuçları">
            {sortedDates.map(date => (
              <div key={date} style={s.labGroup}>
                {date !== 'Tarihsiz' && <div style={s.labDateHeader}>📅 {date}</div>}
                <table style={s.labTable}>
                  <thead><tr><th style={s.labTh}>Test</th><th style={s.labTh}>Değer</th><th style={s.labTh}>Durum</th></tr></thead>
                  <tbody>
                    {labGroups[date].map((l, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                        <td style={s.labTd}>{l.cleanName}</td>
                        <td style={{ ...s.labTd, fontWeight: 600 }}>{l.value} {l.unit}</td>
                        <td style={{ ...s.labTd, ...labStatusStyle(l.status) }}>{labStatusLabel(l.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </Section>
        )}

        {c.treatment && <Section label="💊 Tedavi"><p style={s.treatmentText}>{c.treatment}</p></Section>}
        {c.summary && <Section label="📋 Vaka Özeti"><p style={s.text}>{c.summary}</p></Section>}

        {(c.prognosis || c.complications || c.follow_up || c.diagnostic_kits?.length > 0) && (
          <button style={s.expandBtn} onClick={() => setExpanded(e => !e)}>
            {expanded ? '▲ Daha az göster' : '▼ Prognoz, komplikasyon ve takip'}
          </button>
        )}
        {expanded && <>
          {c.prognosis && <Section label="📈 Prognoz"><p style={s.text}>{c.prognosis}</p></Section>}
          {c.complications && <Section label="⚡ Komplikasyonlar"><p style={s.text}>{c.complications}</p></Section>}
          {c.follow_up && <Section label="🗓 Takip Önerileri"><p style={s.text}>{c.follow_up}</p></Section>}
          {c.diagnostic_kits?.length > 0 && (
            <Section label="🧬 Kullanılan Kitler / Testler">
              <div style={s.chipRow}>{c.diagnostic_kits.map((k, i) => <span key={i} style={s.chipGray}>{k}</span>)}</div>
            </Section>
          )}
        </>}

        {/* AI */}
        <div style={s.aiSection}>
          {!aiComment && !aiLoading && <button style={s.aiBtn} onClick={generateAi}>✨ AI Analizi Oluştur</button>}
          {aiLoading && <div style={s.aiLoading}>⏳ Analiz oluşturuluyor...</div>}
          {aiComment && (
            <div style={s.aiComment}>
              <div style={s.aiCommentHeader}>
                <span>✨ AI Analizi</span>
                <span style={s.aiDisclaimer}>Yalnızca referans amaçlıdır</span>
              </div>
              <div style={s.aiCommentText}>
                {renderAI(aiComment)}
              </div>
              <button style={s.aiClearBtn} onClick={() => setAiComment(null)}>Kapat</button>
            </div>
          )}
        </div>
      </div>

      {/* YORUMLAR */}
      <div style={s.commentsSection}>
        <div style={s.commentsTitle}>💬 Yorumlar {comments.length > 0 && `(${comments.length})`}</div>

        {comments.length === 0 && <div style={s.noComments}>Henüz yorum yok. İlk yorumu sen yap!</div>}

        {comments.map(cm => (
          <div key={cm.id} style={s.commentCard}>
            <div style={s.commentHeader}>
              <span style={s.commentAuthor}>
                {cm.user_role === 'super_admin' ? '⭐' : '👤'} {cm.user_name}
              </span>
              <span style={s.commentDate}>{new Date(cm.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              {(user?.id === cm.user_id || user?.role === 'super_admin') && (
                <button style={s.deleteCommentBtn} onClick={() => handleDeleteComment(cm.id)}>✕</button>
              )}
            </div>
            <p style={s.commentText}>{cm.text}</p>
          </div>
        ))}

        {user ? (
          <div style={s.commentForm}>
            <textarea
              style={s.commentInput}
              placeholder="Klinik görüşünü yaz..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={3}
            />
            <button style={{ ...s.commentSubmit, opacity: commentLoading ? 0.6 : 1 }} onClick={handleAddComment} disabled={commentLoading}>
              {commentLoading ? 'Gönderiliyor...' : 'Yorum Ekle'}
            </button>
          </div>
        ) : (
          <div style={s.noComments}>Yorum yapmak için <span style={{ color: '#2563eb', cursor: 'pointer' }} onClick={() => navigate('/giris')}>giriş yap</span>.</div>
        )}
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <span style={{ display: 'inline-block', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#718096', marginBottom: '0.4rem' }}>{label}</span>
      {children}
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '2rem', fontFamily: 'sans-serif' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#718096' },
  back: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#4a5568', marginBottom: '1rem', padding: 0 },
  card: { maxWidth: 860, margin: '0 auto', background: 'white', borderRadius: '0.75rem', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' },
  hastaAdi: { fontWeight: 700, color: '#1a202c', fontSize: '1.3rem' },
  meta: { color: '#718096', fontSize: '0.9rem' },
  pubmedBadge: { display: 'inline-block', padding: '2px 10px', background: '#dbeafe', color: '#1d4ed8', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', border: '1px solid #bfdbfe' },
  detailRow: { display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '0.25rem' },
  detailItem: { color: '#4a5568', fontSize: '0.92rem' },
  divider: { borderTop: '1px solid #e2e8f0', margin: '1rem 0' },
  text: { margin: 0, color: '#4a5568', fontSize: '0.95rem', lineHeight: 1.7 },
  diagnosisText: { margin: 0, color: '#1a202c', fontSize: '0.97rem', lineHeight: 1.6 },
  treatmentText: { margin: 0, color: '#276749', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-line' },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  symptomBadge: { background: '#fff5f5', color: '#c53030', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.88rem', border: '1px solid #fed7d7' },
  chipBlue: { background: '#ebf8ff', color: '#2b6cb0', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.88rem', border: '1px solid #bee3f8' },
  chipGray: { background: '#f7fafc', color: '#4a5568', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.88rem', border: '1px solid #e2e8f0' },
  labGroup: { marginBottom: '0.75rem', overflowX: 'auto' },
  labDateHeader: { fontSize: '0.82rem', fontWeight: 700, color: '#3182ce', background: '#ebf8ff', padding: '0.3rem 0.75rem', borderRadius: '0.4rem 0.4rem 0 0', borderBottom: '2px solid #bee3f8' },
  labTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  labTh: { textAlign: 'left', padding: '0.4rem 0.75rem', background: '#f7fafc', color: '#4a5568', fontWeight: 600, fontSize: '0.82rem', borderBottom: '2px solid #e2e8f0' },
  labTd: { padding: '0.4rem 0.75rem', color: '#2d3748', borderBottom: '1px solid #edf2f7' },
  expandBtn: { background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#718096', cursor: 'pointer', fontSize: '0.85rem', padding: '0.4rem 1rem', marginBottom: '1rem', width: '100%' },
  aiSection: { marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #e2e8f0' },
  aiBtn: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.45rem 1.2rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 },
  aiLoading: { color: '#718096', fontSize: '0.9rem', fontStyle: 'italic' },
  aiComment: { background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '1px solid #c4b5fd', borderRadius: '0.6rem', padding: '1rem' },
  aiCommentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  aiDisclaimer: { fontSize: '0.75rem', color: '#7c3aed', background: '#ede9fe', padding: '0.1rem 0.5rem', borderRadius: '1rem', border: '1px solid #c4b5fd' },
  aiCommentText: { margin: '0 0 0.75rem 0', color: '#4c1d95', fontSize: '0.92rem', lineHeight: 1.7, wordBreak: 'break-word' },
  aiClearBtn: { background: 'none', border: '1px solid #c4b5fd', color: '#7c3aed', borderRadius: '0.4rem', padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '0.82rem' },
  privateBar: { background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '0.6rem 1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.88rem', color: '#92400e' },
  publishBtn: { background: '#7c3aed', border: 'none', borderRadius: '0.4rem', color: 'white', cursor: 'pointer', fontSize: '0.8rem', padding: '0.3rem 0.75rem', fontWeight: 600, marginLeft: 'auto' },
  commentsSection: { maxWidth: 760, margin: '0 auto 2rem', padding: '0 1rem' },
  commentsTitle: { color: '#1e293b', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' },
  noComments: { color: '#94a3b8', fontSize: '0.88rem', fontStyle: 'italic', marginBottom: '0.75rem' },
  commentCard: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '0.5rem' },
  commentHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' },
  commentAuthor: { fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' },
  commentDate: { fontSize: '0.78rem', color: '#94a3b8', marginLeft: 'auto' },
  deleteCommentBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.82rem', padding: '0 0.25rem' },
  commentText: { margin: 0, fontSize: '0.9rem', color: '#374151', lineHeight: 1.6 },
  commentForm: { marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  commentInput: { border: '1.5px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'sans-serif' },
  commentSubmit: { background: 'linear-gradient(135deg, #1e5c3a, #1a4d5e)', color: 'white', border: 'none', borderRadius: '0.6rem', padding: '0.65rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },
}
