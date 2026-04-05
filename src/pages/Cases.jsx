import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const API = ''

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

export default function Cases() {
  const { animalType, breed } = useParams()
  const navigate = useNavigate()
  const decodedBreed = breed ? decodeURIComponent(breed) : ''
  const showAll = decodedBreed === 'tum-vakalar'

  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  const [aiComments, setAiComments] = useState({})
  const [aiLoading, setAiLoading] = useState({})

  const generateAiComment = async (c) => {
    setAiLoading(prev => ({ ...prev, [c.id]: true }))
    try {
      const res = await axios.post(`${API}/api/cases/${c.id}/analyze`)
      setAiComments(prev => ({ ...prev, [c.id]: res.data.analysis }))
    } catch {
      setAiComments(prev => ({ ...prev, [c.id]: 'Analiz oluşturulurken bir hata oluştu.' }))
    } finally {
      setAiLoading(prev => ({ ...prev, [c.id]: false }))
    }
  }

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  useEffect(() => { fetchCases() }, [animalType, breed])

  const fetchCases = () => {
    setLoading(true)
    const params = new URLSearchParams({ animal_type: animalType })
    if (!showAll) params.append('breed', decodedBreed)

    axios.get(`${API}/api/cases?${params}`)
      .then(r => setCases(r.data))
      .catch(() => setCases([]))
      .finally(() => setLoading(false))
  }

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate(`/${animalType}`)}>← Geri</button>
      <h1 style={styles.title}>{showAll ? 'Tüm Vakalar' : `${decodedBreed} — Vakalar`}</h1>


      {loading && <p style={styles.info}>Yükleniyor...</p>}
      {!loading && cases.length === 0 && <p style={styles.info}>Bu filtreye uygun vaka bulunamadı.</p>}
      {!loading && cases.length > 0 && <p style={styles.count}>{cases.length} vaka bulundu</p>}

      <div style={styles.casesList}>
        {cases.map(c => {
          const isPubMed = c.source && c.source.includes('PubMed')
          const isExpanded = expanded[c.id]

          // Lab grupla
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

          const labStatusStyle = (status) => {
            if (status === 'yuksek') return { color: '#c53030', fontWeight: 700 }
            if (status === 'dusuk') return { color: '#744210', fontWeight: 700 }
            return { color: '#276749', fontWeight: 600 }
          }
          const labStatusLabel = (status) => {
            if (status === 'yuksek') return '↑ Yüksek'
            if (status === 'dusuk') return '↓ Düşük'
            return '✓ Normal'
          }

          return (
            <div key={c.id} style={styles.caseCard}>

              {/* Başlık */}
              <div style={styles.caseHeader}>
                <span style={styles.hastaAdi}>🐾 {c.hasta_adi}{c.breed ? ` — ${c.breed}` : ''}</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {isPubMed && (
                    <a href={c.pubmed_link} target="_blank" rel="noreferrer" style={styles.pubmedBadge}>
                      PubMed ↗
                    </a>
                  )}
                  {c.report_date && <span style={styles.date}>📅 {c.report_date}</span>}
                  {c.region && <span style={styles.region}>📍 {c.region}</span>}
                </div>
              </div>

              {/* Detay */}
              <div style={styles.detailRow}>
                {c.hasta_sahibi && <span style={styles.detailItem}>👤 <strong>Sahip:</strong> {c.hasta_sahibi}</span>}
                <span style={styles.detailItem}>🎂 <strong>Yaş:</strong> {c.age_value ? `${c.age_value} ${c.age_unit}` : 'Bilinmiyor'}</span>
                {c.weight > 0 && <span style={styles.detailItem}>⚖️ <strong>Kilo:</strong> {c.weight} kg</span>}
                {c.cinsiyet && (
                  <span style={styles.detailItem}>
                    {c.cinsiyet === 'erkek' ? '♂' : c.cinsiyet === 'disi' || c.cinsiyet === 'dişi' ? '♀' : '⚥'} <strong>Cinsiyet:</strong> {c.cinsiyet.charAt(0).toUpperCase() + c.cinsiyet.slice(1)}
                  </span>
                )}
              </div>

              <div style={styles.divider} />

              {/* Vaka Öyküsü */}
              {c.anamnesis && (
                <div style={styles.section}>
                  <span style={styles.sectionLabel}>📖 Vaka Öyküsü</span>
                  <p style={styles.summaryText}>{c.anamnesis}</p>
                </div>
              )}

              {/* Semptomlar */}
              {c.symptoms && c.symptoms.length > 0 && (
                <div style={styles.section}>
                  <span style={styles.sectionLabel}>⚠️ Semptomlar</span>
                  <div style={styles.symptomsList}>
                    {c.symptoms.map((sym, i) => <span key={i} style={styles.symptomBadge}>{sym}</span>)}
                  </div>
                </div>
              )}

              {/* Tanı Yöntemleri */}
              {c.diagnostic_methods && c.diagnostic_methods.length > 0 && (
                <div style={styles.section}>
                  <span style={styles.sectionLabel}>🩻 Tanı Yöntemleri</span>
                  <div style={styles.chipRow}>
                    {c.diagnostic_methods.map((m, i) => <span key={i} style={styles.chipBlue}>{m}</span>)}
                  </div>
                </div>
              )}

              {/* Tanı */}
              {c.diagnosis && (
                <div style={styles.section}>
                  <span style={styles.sectionLabel}>🔬 Tanı</span>
                  <p style={styles.diagnosisText}>{c.diagnosis}</p>
                </div>
              )}

              {/* Lab */}
              {c.lab_values && c.lab_values.length > 0 && (
                <div style={styles.section}>
                  <span style={styles.sectionLabel}>🧪 Laboratuvar Sonuçları</span>
                  {sortedDates.map(date => (
                    <div key={date} style={styles.labGroup}>
                      {date !== 'Tarihsiz' && <div style={styles.labDateHeader}>📅 {date}</div>}
                      <table style={styles.labTable}>
                        <thead>
                          <tr>
                            <th style={styles.labTh}>Test</th>
                            <th style={styles.labTh}>Değer</th>
                            <th style={styles.labTh}>Durum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {labGroups[date].map((l, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                              <td style={styles.labTd}>{l.cleanName}</td>
                              <td style={{ ...styles.labTd, fontWeight: 600 }}>{l.value} {l.unit}</td>
                              <td style={{ ...styles.labTd, ...labStatusStyle(l.status) }}>
                                {labStatusLabel(l.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {/* Tedavi */}
              {c.treatment && (
                <div style={styles.section}>
                  <span style={styles.sectionLabel}>💊 Tedavi</span>
                  <p style={styles.treatmentText}>{c.treatment}</p>
                </div>
              )}

              {/* Özet */}
              {c.summary && (
                <div style={styles.section}>
                  <span style={styles.sectionLabel}>📋 Vaka Özeti</span>
                  <p style={styles.summaryText}>{c.summary}</p>
                </div>
              )}

              {/* Detayları Göster/Gizle butonu */}
              {(c.prognosis || c.complications || c.follow_up || (c.diagnostic_kits && c.diagnostic_kits.length > 0)) && (
                <button style={styles.expandBtn} onClick={() => toggleExpand(c.id)}>
                  {isExpanded ? '▲ Daha az göster' : '▼ Prognoz, komplikasyon ve takip'}
                </button>
              )}

              {isExpanded && (
                <>
                  {/* Prognoz */}
                  {c.prognosis && (
                    <div style={styles.section}>
                      <span style={styles.sectionLabel}>📈 Prognoz</span>
                      <p style={styles.summaryText}>{c.prognosis}</p>
                    </div>
                  )}

                  {/* Komplikasyonlar */}
                  {c.complications && (
                    <div style={styles.section}>
                      <span style={styles.sectionLabel}>⚡ Komplikasyonlar</span>
                      <p style={styles.summaryText}>{c.complications}</p>
                    </div>
                  )}

                  {/* Takip */}
                  {c.follow_up && (
                    <div style={styles.section}>
                      <span style={styles.sectionLabel}>🗓 Takip Önerileri</span>
                      <p style={styles.summaryText}>{c.follow_up}</p>
                    </div>
                  )}

                  {/* Tanı Kitleri */}
                  {c.diagnostic_kits && c.diagnostic_kits.length > 0 && (
                    <div style={styles.section}>
                      <span style={styles.sectionLabel}>🧬 Kullanılan Kitler / Testler</span>
                      <div style={styles.chipRow}>
                        {c.diagnostic_kits.map((k, i) => <span key={i} style={styles.chipGray}>{k}</span>)}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* AI Yorumu */}
              <div style={styles.aiSection}>
                {!aiComments[c.id] && !aiLoading[c.id] && (
                  <button style={styles.aiBtn} onClick={() => generateAiComment(c)}>✨ AI Analizi Oluştur</button>
                )}
                {aiLoading[c.id] && <div style={styles.aiLoading}>⏳ Analiz oluşturuluyor...</div>}
                {aiComments[c.id] && (
                  <div style={styles.aiComment}>
                    <div style={styles.aiCommentHeader}>
                      <span>✨ AI Analizi</span>
                      <span style={styles.aiDisclaimer}>Yalnızca referans amaçlıdır</span>
                    </div>
                    <div style={styles.aiCommentText}>
                      {renderAI(aiComments[c.id])}
                    </div>
                    <button style={styles.aiClearBtn} onClick={() => setAiComments(prev => ({ ...prev, [c.id]: null }))}>Kapat</button>
                  </div>
                )}
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '2rem', fontFamily: 'sans-serif' },
  back: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#4a5568', marginBottom: '1rem', padding: 0 },
  title: { fontSize: '1.8rem', color: '#1a202c', marginBottom: '1.5rem' },
  info: { textAlign: 'center', color: '#718096', marginTop: '2rem' },
  count: { color: '#4a5568', marginBottom: '1rem', fontWeight: 600 },
  casesList: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },

  caseCard: { background: 'white', borderRadius: '0.75rem', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  caseHeader: { display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.5rem', alignItems: 'center', justifyContent: 'space-between' },
  hastaAdi: { fontWeight: 700, color: '#1a202c', fontSize: '1.15rem' },
  date: { color: '#718096', fontSize: '0.9rem' },
  region: { color: '#718096', fontSize: '0.9rem' },
  pubmedBadge: {
    display: 'inline-block', padding: '2px 10px', background: '#dbeafe', color: '#1d4ed8',
    borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none',
    border: '1px solid #bfdbfe',
  },
  detailRow: { display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '0.25rem' },
  detailItem: { color: '#4a5568', fontSize: '0.92rem' },
  divider: { borderTop: '1px solid #e2e8f0', margin: '1rem 0' },
  section: { marginBottom: '1rem' },
  sectionLabel: {
    display: 'inline-block', fontWeight: 700, fontSize: '0.78rem',
    textTransform: 'uppercase', letterSpacing: '0.06em', color: '#718096', marginBottom: '0.4rem',
  },
  diagnosisText: { margin: 0, color: '#1a202c', fontSize: '0.97rem', lineHeight: 1.6 },
  summaryText: { margin: 0, color: '#4a5568', fontSize: '0.95rem', lineHeight: 1.7 },
  treatmentText: { margin: 0, color: '#276749', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-line' },
  symptomsList: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  symptomBadge: { background: '#fff5f5', color: '#c53030', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.88rem', border: '1px solid #fed7d7' },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  chipBlue: { background: '#ebf8ff', color: '#2b6cb0', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.88rem', border: '1px solid #bee3f8' },
  chipGray: { background: '#f7fafc', color: '#4a5568', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.88rem', border: '1px solid #e2e8f0' },
  labGroup: { marginBottom: '0.75rem', overflowX: 'auto' },
  labDateHeader: { fontSize: '0.82rem', fontWeight: 700, color: '#3182ce', background: '#ebf8ff', padding: '0.3rem 0.75rem', borderRadius: '0.4rem 0.4rem 0 0', borderBottom: '2px solid #bee3f8' },
  labTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  labTh: { textAlign: 'left', padding: '0.4rem 0.75rem', background: '#f7fafc', color: '#4a5568', fontWeight: 600, fontSize: '0.82rem', borderBottom: '2px solid #e2e8f0' },
  labTd: { padding: '0.4rem 0.75rem', color: '#2d3748', borderBottom: '1px solid #edf2f7' },
  expandBtn: {
    background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem',
    color: '#718096', cursor: 'pointer', fontSize: '0.85rem', padding: '0.4rem 1rem',
    marginBottom: '1rem', width: '100%',
  },
  aiSection: { marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #e2e8f0' },
  aiBtn: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.45rem 1.2rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 },
  aiLoading: { color: '#718096', fontSize: '0.9rem', fontStyle: 'italic' },
  aiComment: { background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '1px solid #c4b5fd', borderRadius: '0.6rem', padding: '1rem' },
  aiCommentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  aiDisclaimer: { fontSize: '0.75rem', color: '#7c3aed', background: '#ede9fe', padding: '0.1rem 0.5rem', borderRadius: '1rem', border: '1px solid #c4b5fd' },
  aiCommentText: { margin: '0 0 0.75rem 0', color: '#4c1d95', fontSize: '0.92rem', lineHeight: 1.7, wordBreak: 'break-word' },
  aiClearBtn: { background: 'none', border: '1px solid #c4b5fd', color: '#7c3aed', borderRadius: '0.4rem', padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '0.82rem' },
}
