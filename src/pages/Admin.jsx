import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || ''

export default function Admin() {
  const navigate = useNavigate()
  const { user, loading: authLoading, getToken } = useAuth()

  // Tüm hook'lar koşulsuz — React kuralı
  const fileRef = useRef()
  const [mode, setMode] = useState('image')
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [teamsStatus, setTeamsStatus] = useState(null)
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [channels, setChannels] = useState([])
  const [selectedChannel, setSelectedChannel] = useState('')
  const [syncLimit, setSyncLimit] = useState(20)
  const [teamsLoading, setTeamsLoading] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/giris')
  }, [authLoading, user])

  if (authLoading || !user) return null

  const canEntry = ['super_admin', 'institution_owner', 'institution_member'].includes(user.role)
  if (!canEntry) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: 340, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏥</div>
        <h2 style={{ color: '#1a202c', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Kurum Üyeliği Gerekli</h2>
        <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Vaka eklemek için bir kuruma üye olman gerekiyor.</p>
        <button onClick={() => navigate('/kurumlar')} style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.65rem 1.5rem', cursor: 'pointer', fontWeight: 700 }}>Kurumlar</button>
      </div>
    </div>
  )

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setResult(null)
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setResult(null)
    setError('')
  }

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handleSubmit = async () => {
    setLoading(true)
    setResult(null)
    setError('')

    try {
      let res
      const authHeader = { Authorization: `Bearer ${getToken()}` }
      if (mode === 'image' && imageFile) {
        const imageBase64 = await toBase64(imageFile)
        res = await axios.post(`${API}/api/admin/upload-image`, {
          imageBase64,
          mediaType: imageFile.type,
          text,
        }, { headers: authHeader })
      } else if (mode === 'text' && text.trim()) {
        res = await axios.post(`${API}/api/admin/upload`, { text }, { headers: authHeader })
      } else {
        setError('Lütfen görsel veya metin ekleyin.')
        setLoading(false)
        return
      }

      setResult(res.data)
      setText('')
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = !loading && (mode === 'image' ? !!imageFile : text.trim().length > 0)

  // Teams fonksiyonları
  const checkTeamsToken = async () => {
    setTeamsLoading(true)
    try {
      const res = await axios.get(`${API}/api/teams/check`)
      setTeamsStatus(res.data)
      if (res.data.ok) loadTeams()
    } catch (err) {
      setTeamsStatus({ ok: false, error: err.response?.data?.error || 'Token geçersiz.' })
    } finally {
      setTeamsLoading(false)
    }
  }

  const loadTeams = async () => {
    try {
      const res = await axios.get(`${API}/api/teams/teams`)
      setTeams(res.data)
    } catch (err) {
      setError('Takımlar yüklenemedi: ' + (err.response?.data?.error || err.message))
    }
  }

  const loadChannels = async (teamId) => {
    setSelectedTeam(teamId)
    setSelectedChannel('')
    setChannels([])
    try {
      const res = await axios.get(`${API}/api/teams/teams/${teamId}/channels`)
      setChannels(res.data)
    } catch (err) {
      setError('Kanallar yüklenemedi: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleSync = async () => {
    if (!selectedTeam || !selectedChannel) {
      setError('Takım ve kanal seçin.')
      return
    }
    setTeamsLoading(true)
    setSyncResult(null)
    setError('')
    try {
      const res = await axios.post(`${API}/api/teams/sync`, {
        teamId: selectedTeam,
        channelId: selectedChannel,
        limit: syncLimit,
      })
      setSyncResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Senkronizasyon hatası.')
    } finally {
      setTeamsLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate('/')}>← Ana Sayfa</button>
      <h1 style={styles.title}>Admin — Rapor Ekle</h1>
      <p style={styles.desc}>Teams'den ekran görüntüsü, metin veya otomatik senkronizasyon ile rapor ekleyin.</p>

      {/* Mod seçici */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(mode === 'image' ? styles.tabActive : {}) }}
          onClick={() => setMode('image')}
        >
          📷 Ekran Görüntüsü
        </button>
        <button
          style={{ ...styles.tab, ...(mode === 'text' ? styles.tabActive : {}) }}
          onClick={() => setMode('text')}
        >
          📝 Metin
        </button>
        <button
          style={{ ...styles.tab, ...(mode === 'teams' ? styles.tabActive : {}) }}
          onClick={() => { setMode('teams'); if (!teamsStatus) checkTeamsToken() }}
        >
          💬 Teams Sync
        </button>
      </div>

      {/* Görsel modu */}
      {mode === 'image' && (
        <div>
          <div
            style={{ ...styles.dropzone, ...(imagePreview ? styles.dropzoneHasImage : {}) }}
            onClick={() => fileRef.current.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            {imagePreview ? (
              <img src={imagePreview} style={styles.preview} alt="Önizleme" />
            ) : (
              <div style={styles.dropzoneText}>
                <span style={{ fontSize: '3rem' }}>📷</span>
                <p>Ekran görüntüsünü buraya sürükleyin veya tıklayın</p>
                <p style={{ fontSize: '0.85rem', color: '#a0aec0' }}>JPG, PNG, WebP</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          {imagePreview && (
            <button style={styles.changeBtn} onClick={() => fileRef.current.click()}>
              Görseli Değiştir
            </button>
          )}
          <textarea
            style={styles.textarea}
            placeholder="İsteğe bağlı: Görsele ek notlar yazın (örn: tarih, bölge)..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
          />
        </div>
      )}

      {/* Metin modu */}
      {mode === 'text' && (
        <textarea
          style={styles.textarea}
          placeholder="Rapor metnini buraya yapıştırın..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={16}
        />
      )}

      {/* Teams Sync modu */}
      {mode === 'teams' && (
        <div style={styles.teamsBox}>
          {/* Token durumu */}
          <div style={styles.tokenStatus}>
            {teamsLoading && <p style={styles.info}>⏳ Kontrol ediliyor...</p>}
            {teamsStatus && teamsStatus.ok && (
              <div style={styles.tokenOk}>
                ✅ Bağlantı başarılı — <strong>{teamsStatus.user}</strong>
              </div>
            )}
            {teamsStatus && !teamsStatus.ok && (
              <div style={styles.tokenFail}>
                ❌ Token geçersiz veya süresi dolmuş. Yeni token alın.
                <button style={styles.retryBtn} onClick={checkTeamsToken}>Tekrar Dene</button>
              </div>
            )}
          </div>

          {teamsStatus?.ok && (
            <>
              {/* Takım seçimi */}
              <div style={styles.selectRow}>
                <label style={styles.label}>Takım:</label>
                <select
                  style={styles.select}
                  value={selectedTeam}
                  onChange={e => loadChannels(e.target.value)}
                >
                  <option value="">-- Takım seçin --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.displayName}</option>
                  ))}
                </select>
              </div>

              {/* Kanal seçimi */}
              {channels.length > 0 && (
                <div style={styles.selectRow}>
                  <label style={styles.label}>Kanal:</label>
                  <select
                    style={styles.select}
                    value={selectedChannel}
                    onChange={e => setSelectedChannel(e.target.value)}
                  >
                    <option value="">-- Kanal seçin --</option>
                    {channels.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.displayName}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Kaç mesaj */}
              <div style={styles.selectRow}>
                <label style={styles.label}>Mesaj sayısı:</label>
                <select style={styles.selectSmall} value={syncLimit} onChange={e => setSyncLimit(Number(e.target.value))}>
                  <option value={10}>Son 10</option>
                  <option value={20}>Son 20</option>
                  <option value={50}>Son 50</option>
                </select>
              </div>

              <button
                style={{ ...styles.btn, opacity: (selectedTeam && selectedChannel && !teamsLoading) ? 1 : 0.6 }}
                onClick={handleSync}
                disabled={!selectedTeam || !selectedChannel || teamsLoading}
              >
                {teamsLoading ? '⏳ Senkronize ediliyor...' : '🔄 Teams\'den Aktar'}
              </button>

              {syncResult && (
                <div style={styles.syncResult}>
                  <strong>✅ Senkronizasyon tamamlandı!</strong>
                  <div style={styles.syncStats}>
                    <span style={styles.statBadge}>📥 {syncResult.added} vaka eklendi</span>
                    <span style={styles.statBadgeGray}>⏭️ {syncResult.skipped} atlandı</span>
                    {syncResult.errors?.length > 0 && (
                      <span style={styles.statBadgeRed}>⚠️ {syncResult.errors.length} hata</span>
                    )}
                  </div>
                  {syncResult.errors?.length > 0 && (
                    <details style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                      <summary>Hatalar</summary>
                      {syncResult.errors.map((e, i) => (
                        <p key={i} style={{ color: '#c53030', margin: '0.2rem 0' }}>{e.error}</p>
                      ))}
                    </details>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Submit butonu (sadece image/text modda) */}
      {mode !== 'teams' && (
        <button
          style={{ ...styles.btn, opacity: canSubmit ? 1 : 0.6 }}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {loading ? '⏳ Analiz ediliyor...' : '🔍 Analiz Et ve Kaydet'}
        </button>
      )}

      {error && <div style={styles.error}>{error}</div>}

      {result && (
        <div style={styles.success}>
          <strong>✅ {result.count} vaka başarıyla eklendi!</strong>
          <div style={styles.caseList}>
            {result.cases.map((c, i) => (
              <div key={i} style={styles.caseItem}>
                <div style={styles.caseTop}>
                  <span>{c.animal_type === 'kedi' ? '🐱' : '🐶'}</span>
                  <strong>{c.breed}</strong>
                  {c.age_value && <span style={styles.age}>{c.age_value} {c.age_unit}</span>}
                  {c.diagnosis && <span style={styles.diag}>{c.diagnosis}</span>}
                </div>
                {c.symptoms?.length > 0 && (
                  <div style={styles.symRow}>
                    {c.symptoms.map((s, j) => (
                      <span key={j} style={styles.symTag}>{s}</span>
                    ))}
                  </div>
                )}
                {c.lab_values?.length > 0 && (
                  <div style={styles.labRow}>
                    {c.lab_values.map((l, j) => (
                      <span key={j} style={{
                        ...styles.labTag,
                        background: l.status === 'yuksek' ? '#fff5f5' : '#fffff0',
                        color: l.status === 'yuksek' ? '#c53030' : '#744210',
                        border: `1px solid ${l.status === 'yuksek' ? '#feb2b2' : '#f6e05e'}`,
                      }}>
                        {l.name}: {l.value} {l.unit} {l.status === 'yuksek' ? '↑' : '↓'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' },
  back: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#4a5568', marginBottom: '1rem', padding: 0 },
  title: { fontSize: '1.8rem', color: '#1a202c', marginBottom: '0.5rem' },
  desc: { color: '#718096', marginBottom: '1.5rem' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  tab: { padding: '0.6rem 1.5rem', background: 'white', border: '2px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem', color: '#4a5568' },
  tabActive: { borderColor: '#4299e1', color: '#2b6cb0', background: '#ebf8ff' },
  dropzone: { border: '2px dashed #cbd5e0', borderRadius: '0.75rem', padding: '3rem', textAlign: 'center', cursor: 'pointer', background: 'white', marginBottom: '1rem', transition: 'border-color 0.2s' },
  dropzoneHasImage: { padding: '0.5rem', border: '2px solid #4299e1' },
  dropzoneText: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#718096' },
  preview: { maxWidth: '100%', maxHeight: '400px', borderRadius: '0.5rem', display: 'block', margin: '0 auto' },
  changeBtn: { background: 'none', border: '1px solid #cbd5e0', borderRadius: '0.4rem', padding: '0.4rem 1rem', cursor: 'pointer', color: '#718096', marginBottom: '1rem', fontSize: '0.9rem' },
  textarea: { width: '100%', padding: '1rem', border: '1px solid #cbd5e0', borderRadius: '0.5rem', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'sans-serif', boxSizing: 'border-box', marginBottom: '0.5rem' },
  btn: { padding: '0.75rem 2rem', background: '#4299e1', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem', width: '100%', marginTop: '0.5rem' },
  error: { marginTop: '1rem', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '0.5rem', padding: '1rem', color: '#c53030' },
  success: { marginTop: '1.5rem', background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '0.5rem', padding: '1.5rem', color: '#276749' },
  caseList: { marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  caseItem: { background: 'white', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.95rem' },
  caseTop: { display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' },
  age: { background: '#ebf8ff', color: '#2b6cb0', padding: '0.1rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem' },
  diag: { background: '#e9d8fd', color: '#553c9a', padding: '0.1rem 0.6rem', borderRadius: '1rem', fontSize: '0.85rem' },
  symRow: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' },
  symTag: { background: '#fed7d7', color: '#c53030', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem' },
  labRow: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  labTag: { padding: '0.15rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 600 },
  // Teams styles
  teamsBox: { background: 'white', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  tokenStatus: { marginBottom: '1rem' },
  tokenOk: { background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#276749' },
  tokenFail: { background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#c53030', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  retryBtn: { background: '#c53030', color: 'white', border: 'none', borderRadius: '0.4rem', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' },
  selectRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
  label: { color: '#4a5568', fontWeight: 600, minWidth: '120px' },
  select: { padding: '0.5rem 0.8rem', border: '1px solid #cbd5e0', borderRadius: '0.4rem', fontSize: '1rem', flex: 1 },
  selectSmall: { padding: '0.5rem 0.8rem', border: '1px solid #cbd5e0', borderRadius: '0.4rem', fontSize: '1rem', width: '120px' },
  syncResult: { marginTop: '1rem', background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '0.5rem', padding: '1rem', color: '#276749' },
  syncStats: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' },
  statBadge: { background: '#c6f6d5', color: '#276749', padding: '0.2rem 0.7rem', borderRadius: '1rem', fontSize: '0.9rem' },
  statBadgeGray: { background: '#e2e8f0', color: '#4a5568', padding: '0.2rem 0.7rem', borderRadius: '1rem', fontSize: '0.9rem' },
  statBadgeRed: { background: '#fff5f5', color: '#c53030', padding: '0.2rem 0.7rem', borderRadius: '1rem', fontSize: '0.9rem' },
  info: { color: '#718096', margin: 0 },
}
