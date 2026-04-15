import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

export default function Kurumlar() {
  const navigate = useNavigate();
  const { user, loading: authLoading, getToken, refreshToken } = useAuth();
  const [view, setView] = useState(null); // 'owner' | 'member' | 'none'
  const [data, setData] = useState(null);
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [pendingInstitutions, setPendingInstitutions] = useState([]);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (authLoading) return; // auth henüz yüklenmedi, bekle
    if (!user) { navigate('/giris'); return; }
    // Rol değişmiş olabilir (kurum onayı, üyelik onayı) — token yenile
    refreshToken().then(() => loadData());
  }, [authLoading, user]);

  async function loadData() {
    setLoading(true);
    try {
      const [mineRes, allRes] = await Promise.all([
        fetch(`${API}/api/institutions/mine`, { headers }),
        fetch(`${API}/api/institutions`, { headers }),
      ]);
      const mine = await mineRes.json();
      const all = await allRes.json();
      setView(mine.role);
      setData(mine);
      setAllInstitutions(all);

      if (user.role === 'super_admin') {
        const pendRes = await fetch(`${API}/api/institutions/pending`, { headers });
        setPendingInstitutions(await pendRes.json());
      }
    } finally {
      setLoading(false);
    }
  }

  async function post(url, body) {
    const res = await fetch(`${API}${url}`, { method: 'POST', headers, body: JSON.stringify(body) });
    return res.json();
  }

  async function handleCreate(e) {
    e.preventDefault();
    const r = await post('/api/institutions', createForm);
    setMsg(r.error || r.message);
    if (!r.error) { setCreateForm({ name: '', description: '' }); loadData(); }
  }

  async function handleJoinAndRefresh(id) {
    await handleJoin(id);
    await refreshToken();
  }

  async function handleJoin(id) {
    const r = await post(`/api/institutions/${id}/join`);
    setMsg(r.error || r.message);
    loadData();
  }

  async function handleApproveInstitution(id) {
    const r = await post(`/api/institutions/${id}/approve`);
    setMsg(r.error || r.message);
    loadData();
  }

  async function handleRejectInstitution(id) {
    const r = await post(`/api/institutions/${id}/reject`);
    setMsg(r.error || r.message);
    loadData();
  }

  async function handleApproveMember(institutionId, userId) {
    const r = await post(`/api/institutions/${institutionId}/members/${userId}/approve`);
    setMsg(r.error || r.message);
    loadData();
  }

  async function handleRejectMember(institutionId, userId) {
    const r = await post(`/api/institutions/${institutionId}/members/${userId}/reject`);
    setMsg(r.error || r.message);
    loadData();
  }

  if (loading) return <div style={s.center}>Yükleniyor...</div>;

  return (
    <div style={s.container}>
      <div style={s.inner}>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Geri</button>
        <h1 style={s.title}>Kurumlar</h1>

        {msg && (
          <div style={{ ...s.msg, background: msg.includes('hata') || msg.includes('Zaten') ? '#fef2f2' : '#f0fdf4', color: msg.includes('hata') || msg.includes('Zaten') ? '#dc2626' : '#16a34a', border: `1px solid ${msg.includes('hata') || msg.includes('Zaten') ? '#fecaca' : '#86efac'}` }}>
            {msg}
          </div>
        )}

        {/* SUPER ADMIN PANELİ */}
        {user.role === 'super_admin' && pendingInstitutions.length > 0 && (
          <div style={s.section}>
            <div style={s.sectionTitle}>Bekleyen Kurum Talepleri</div>
            {pendingInstitutions.map(inst => (
              <div key={inst.id} style={s.card}>
                <div style={s.cardMain}>
                  <div style={s.cardName}>{inst.name}</div>
                  {inst.description && <div style={s.cardDesc}>{inst.description}</div>}
                  <div style={s.cardMeta}>Talep eden: {inst.owner_name} ({inst.owner_email})</div>
                </div>
                <div style={s.cardActions}>
                  <button style={s.approveBtn} onClick={() => handleApproveInstitution(inst.id)}>Onayla</button>
                  <button style={s.rejectBtn} onClick={() => handleRejectInstitution(inst.id)}>Reddet</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {user.role === 'super_admin' && pendingInstitutions.length === 0 && (
          <div style={s.emptyNote}>Bekleyen kurum talebi yok.</div>
        )}

        {/* KURUM SAHİBİ PANELİ */}
        {view === 'owner' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>Kurumum: {data.institution.name}</div>
            {data.institution.description && <p style={s.instDesc}>{data.institution.description}</p>}

            {data.members.some(m => m.status === 'pending') && (
              <>
                <div style={s.subTitle}>Katılma Talepleri</div>
                {data.members.filter(m => m.status === 'pending').map(m => (
                  <div key={m.id} style={s.card}>
                    <div style={s.cardMain}>
                      <div style={s.cardName}>{m.name}</div>
                      <div style={s.cardMeta}>{m.email}</div>
                    </div>
                    <div style={s.cardActions}>
                      <button style={s.approveBtn} onClick={() => handleApproveMember(data.institution.id, m.user_id)}>Onayla</button>
                      <button style={s.rejectBtn} onClick={() => handleRejectMember(data.institution.id, m.user_id)}>Reddet</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {data.members.filter(m => m.status === 'approved').length > 0 && (
              <>
                <div style={s.subTitle}>Üyeler ({data.members.filter(m => m.status === 'approved').length})</div>
                {data.members.filter(m => m.status === 'approved').map(m => (
                  <div key={m.id} style={{ ...s.card, padding: '0.75rem 1rem' }}>
                    <div style={s.cardName}>{m.name}</div>
                    <div style={s.cardMeta}>{m.email}</div>
                  </div>
                ))}
              </>
            )}

            {data.members.length === 0 && <div style={s.emptyNote}>Henüz üye yok. Çalışanlarınız kuruma katılma talebi gönderebilir.</div>}
          </div>
        )}

        {/* ÜYE PANELİ */}
        {view === 'member' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>
              {data.membership.status === 'pending'
                ? `"${data.membership.institution_name}" — onay bekleniyor`
                : `Kurumum: ${data.membership.institution_name}`}
            </div>
            {data.membership.status === 'pending' && (
              <div style={s.emptyNote}>Kurum sahibi talebini onaylayana kadar kuruma erişemezsin.</div>
            )}
          </div>
        )}

        {/* KURUMA KATILMA / OLUŞTURMA */}
        {view === 'none' && (
          <>
            <div style={s.section}>
              <div style={s.sectionTitle}>Kurum Oluştur</div>
              <p style={s.emptyNote}>Talebini oluştur, onaylandıktan sonra aktif olur.</p>
              <form onSubmit={handleCreate} style={s.form}>
                <input
                  style={s.input}
                  placeholder="Kurum adı (ör. Yakın Doğu Hayvan Hastanesi)"
                  value={createForm.name}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <textarea
                  style={{ ...s.input, minHeight: 70, resize: 'vertical' }}
                  placeholder="Kısa açıklama (isteğe bağlı)"
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                />
                <button style={s.createBtn}>Talep Gönder</button>
              </form>
            </div>

            {allInstitutions.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionTitle}>Mevcut Kurumlar</div>
                {allInstitutions.map(inst => (
                  <div key={inst.id} style={s.card}>
                    <div style={s.cardMain}>
                      <div style={s.cardName}>{inst.name}</div>
                      {inst.description && <div style={s.cardDesc}>{inst.description}</div>}
                      <div style={s.cardMeta}>{inst.member_count} üye</div>
                    </div>
                    <button style={s.joinBtn} onClick={() => handleJoin(inst.id)}>Katıl</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', background: 'linear-gradient(180deg, #1e5c3a 0%, #1a4d5e 50%, #1a3d7a 100%)', padding: '1.5rem 1rem', fontFamily: 'sans-serif' },
  inner: { maxWidth: 540, margin: '0 auto' },
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' },
  backBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', padding: 0, marginBottom: '1rem' },
  title: { color: 'white', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 1rem' },
  msg: { borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.88rem', marginBottom: '1rem' },
  section: { background: 'rgba(255,255,255,0.06)', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' },
  sectionTitle: { color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' },
  subTitle: { color: '#94a3b8', fontWeight: 600, fontSize: '0.82rem', marginTop: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' },
  instDesc: { color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 0.75rem' },
  emptyNote: { color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' },
  card: { background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '0.9rem 1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' },
  cardMain: { flex: 1, minWidth: 0 },
  cardName: { color: 'white', fontWeight: 600, fontSize: '0.95rem' },
  cardDesc: { color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.2rem' },
  cardMeta: { color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem' },
  cardActions: { display: 'flex', gap: '0.4rem', flexShrink: 0 },
  approveBtn: { background: '#16a34a', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer', fontSize: '0.8rem', padding: '0.4rem 0.75rem', fontWeight: 600 },
  rejectBtn: { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '0.5rem', color: '#fca5a5', cursor: 'pointer', fontSize: '0.8rem', padding: '0.4rem 0.75rem' },
  joinBtn: { background: 'linear-gradient(135deg, #1a4d5e, #1a3d7a)', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer', fontSize: '0.82rem', padding: '0.4rem 0.9rem', fontWeight: 600, flexShrink: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' },
  input: { background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.9rem', color: 'white', outline: 'none', width: '100%', boxSizing: 'border-box' },
  createBtn: { background: 'linear-gradient(135deg, #1e5c3a, #1a4d5e)', border: 'none', borderRadius: '0.75rem', color: 'white', cursor: 'pointer', padding: '0.8rem', fontWeight: 700, fontSize: '0.95rem' },
};
