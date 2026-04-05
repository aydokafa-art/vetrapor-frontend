import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMobile from '../useMobile'

const ILACLAR = [
  // Antibiyotikler
  { kategori: 'Antibiyotik', ad: 'Amoksisilin (Klamoks BID 150mg/ml)', konsantrasyon: 150, dozMin: 8.75, dozMax: 12.5, not: 'Kedi/Köpek · SC/IM/oral' },
  { kategori: 'Antibiyotik', ad: 'Enrofloksasin (Baytril 50mg/ml)', konsantrasyon: 50, dozMin: 5, dozMax: 10, not: 'Köpek 5-20, Kedi max 5 mg/kg · SC' },
  { kategori: 'Antibiyotik', ad: 'Metronidazol (Metro 5mg/ml IV)', konsantrasyon: 5, dozMin: 15, dozMax: 25, not: 'IV infüzyon · 2x1' },
  { kategori: 'Antibiyotik', ad: 'Doksisiklin (Doxi-ject 20mg/ml)', konsantrasyon: 20, dozMin: 5, dozMax: 10, not: 'SC/IV · 1-2x1' },
  { kategori: 'Antibiyotik', ad: 'Sefaleksin (Rilexine 300mg/ml)', konsantrasyon: 300, dozMin: 15, dozMax: 30, not: 'Köpek oral · 2x1' },
  { kategori: 'Antibiyotik', ad: 'Marbofloksasin (Marbocyl 10mg/ml)', konsantrasyon: 10, dozMin: 2, dozMax: 5, not: 'SC · 1x1' },

  // NSAİD / Analjezik
  { kategori: 'NSAİD / Analjezik', ad: 'Meloksikam (Loxicom 5mg/ml) — Köpek', konsantrasyon: 5, dozMin: 0.2, dozMax: 0.2, not: 'İlk gün 0.2, idame 0.1 mg/kg · SC/oral' },
  { kategori: 'NSAİD / Analjezik', ad: 'Meloksikam (Loxicom 5mg/ml) — Kedi', konsantrasyon: 5, dozMin: 0.3, dozMax: 0.3, not: 'Tek doz 0.3 mg/kg · SC' },
  { kategori: 'NSAİD / Analjezik', ad: 'Karprofen (Rimadyl 50mg/ml)', konsantrasyon: 50, dozMin: 4.4, dozMax: 4.4, not: 'Köpek 4.4 mg/kg · SC/oral' },
  { kategori: 'NSAİD / Analjezik', ad: 'Tramadol (50mg/ml)', konsantrasyon: 50, dozMin: 2, dozMax: 5, not: 'Kedi/Köpek · SC/IV' },
  { kategori: 'NSAİD / Analjezik', ad: 'Metamizol (Novalgin 500mg/ml)', konsantrasyon: 500, dozMin: 25, dozMax: 50, not: 'IV/IM · Ateş ve ağrı' },

  // Kortikosteroid
  { kategori: 'Kortikosteroid', ad: 'Deksametazon (2mg/ml)', konsantrasyon: 2, dozMin: 0.1, dozMax: 0.5, not: 'Antiinflamatuvar · IV/SC' },
  { kategori: 'Kortikosteroid', ad: 'Prednizolon (Vetakort 10mg/ml)', konsantrasyon: 10, dozMin: 0.5, dozMax: 2, not: '0.5-1 antiinfl, 2-4 immünosüpr · oral/SC' },
  { kategori: 'Kortikosteroid', ad: 'Metilprednizolon (Solu-Medrol 40mg/ml)', konsantrasyon: 40, dozMin: 0.5, dozMax: 2, not: 'IV/SC' },

  // Antiemetik
  { kategori: 'Antiemetik', ad: 'Metoklopramid (5mg/ml)', konsantrasyon: 5, dozMin: 0.2, dozMax: 0.5, not: 'SC/IV · 3x1' },
  { kategori: 'Antiemetik', ad: 'Maropitant (Cerenia 10mg/ml)', konsantrasyon: 10, dozMin: 1, dozMax: 1, not: 'SC · 1x1 · >4 ay' },
  { kategori: 'Antiemetik', ad: 'Ondansetron (2mg/ml)', konsantrasyon: 2, dozMin: 0.1, dozMax: 0.15, not: 'IV yavaş · 2-3x1' },

  // Diüretik
  { kategori: 'Diüretik', ad: 'Furosemid (Lasix 10mg/ml)', konsantrasyon: 10, dozMin: 1, dozMax: 4, not: 'IV/SC · 2x1' },

  // Antiparaziter
  { kategori: 'Antiparaziter', ad: 'İvermektin (10mg/ml)', konsantrasyon: 10, dozMin: 0.2, dozMax: 0.4, not: '⚠️ Collie ırklarında kontrendike' },
  { kategori: 'Antiparaziter', ad: 'Doramektin (Dectomax 10mg/ml)', konsantrasyon: 10, dozMin: 0.2, dozMax: 0.3, not: 'SC · Dışparazit' },

  // Anestezi / Sedasyon
  { kategori: 'Anestezi / Sedasyon', ad: 'Ketamin (100mg/ml)', konsantrasyon: 100, dozMin: 5, dozMax: 10, not: 'IM sedasyon · kombine kullan' },
  { kategori: 'Anestezi / Sedasyon', ad: 'Medetomidin (Domitor 1mg/ml)', konsantrasyon: 1, dozMin: 0.01, dozMax: 0.04, not: 'IM/SC preanestezi' },
  { kategori: 'Anestezi / Sedasyon', ad: 'Butorfanol (10mg/ml)', konsantrasyon: 10, dozMin: 0.2, dozMax: 0.4, not: 'SC/IV · Analjezi + sedasyon' },
  { kategori: 'Anestezi / Sedasyon', ad: 'Propofol (10mg/ml)', konsantrasyon: 10, dozMin: 4, dozMax: 6, not: 'IV yavaş indüksiyon' },

  // Kardiyovasküler
  { kategori: 'Kardiyovasküler', ad: 'Atenolol (2mg/ml)', konsantrasyon: 2, dozMin: 0.5, dozMax: 1, not: 'Köpek oral · Kalp hızı kontrolü' },
  { kategori: 'Kardiyovasküler', ad: 'Digoksin (0.25mg/ml)', konsantrasyon: 0.25, dozMin: 0.005, dozMax: 0.01, not: '⚠️ Dar terapötik indeks · dikkatli' },

  // Diğer
  { kategori: 'Diğer', ad: 'Atropin (0.5mg/ml)', konsantrasyon: 0.5, dozMin: 0.02, dozMax: 0.04, not: 'SC/IV · Bradikardi, preanestezi' },
  { kategori: 'Diğer', ad: 'Vitamin B12 (0.5mg/ml)', konsantrasyon: 0.5, dozMin: 0.02, dozMax: 0.05, not: 'SC/IM' },
  { kategori: 'Diğer', ad: 'Gadexon (Deksametazon 2mg/ml)', konsantrasyon: 2, dozMin: 0.1, dozMax: 0.3, not: 'IV/SC · Şok, alerji' },
]

const KATEGORILER = [...new Set(ILACLAR.map(i => i.kategori))]

export default function DozHesap() {
  const navigate = useNavigate()
  const isMobile = useMobile()
  const [kilo, setKilo] = useState('')
  const [doz, setDoz] = useState('')
  const [konsantrasyon, setKonsantrasyon] = useState('')
  const [secilenIlac, setSecilenIlac] = useState(null)
  const [sonuc, setSonuc] = useState(null)
  const [aktifKategori, setAktifKategori] = useState(null)

  const ilacSec = (ilac) => {
    setSecilenIlac(ilac)
    setKonsantrasyon(String(ilac.konsantrasyon))
    // Ortalama dozu öner
    const ortaDoz = ((ilac.dozMin + ilac.dozMax) / 2).toFixed(2)
    setDoz(String(ortaDoz))
    setSonuc(null)
    setAktifKategori(null)
  }

  const hesapla = () => {
    const k = parseFloat(kilo)
    const d = parseFloat(doz)
    const kon = parseFloat(konsantrasyon)
    if (!k || k <= 0) return alert('Hayvan kilosunu girin.')
    if (!d || d <= 0) return alert('Dozu girin.')
    if (!kon || kon <= 0) return alert('İlaç konsantrasyonunu girin.')
    const toplamMg = d * k
    const ml = toplamMg / kon
    setSonuc({ toplamMg, ml, kilo: k, doz: d, konsantrasyon: kon })
  }

  const temizle = () => {
    setKilo(''); setDoz(''); setKonsantrasyon('')
    setSecilenIlac(null); setSonuc(null); setAktifKategori(null)
  }

  return (
    <div style={s.container}>
      <button style={s.back} onClick={() => navigate('/')}>← Geri</button>
      <h1 style={s.title}>💉 Doz Hesaplayıcı</h1>
      <p style={s.sub}>İlaç seç veya manuel gir — kaç cc çekeceğini hesapla</p>

      <div style={{ ...s.grid, gridTemplateColumns: isMobile ? '1fr' : '1fr 400px' }}>
        {/* Sol: İlaç listesi */}
        <div style={s.ilacPanel}>
          <div style={s.ilacBaslik}>Hızlı İlaç Seç</div>
          <div style={s.kategoriRow}>
            {KATEGORILER.map(k => (
              <button key={k} style={{ ...s.katBtn, ...(aktifKategori === k ? s.katBtnActive : {}) }}
                onClick={() => setAktifKategori(aktifKategori === k ? null : k)}>
                {k}
              </button>
            ))}
          </div>
          {aktifKategori && (
            <div style={s.ilacListesi}>
              {ILACLAR.filter(i => i.kategori === aktifKategori).map((ilac, idx) => (
                <div key={idx}
                  style={{ ...s.ilacKart, ...(secilenIlac?.ad === ilac.ad ? s.ilacKartActive : {}) }}
                  onClick={() => ilacSec(ilac)}>
                  <div style={s.ilacAd}>{ilac.ad}</div>
                  <div style={s.ilacDetay}>
                    {ilac.dozMin === ilac.dozMax ? ilac.dozMin : `${ilac.dozMin}–${ilac.dozMax}`} mg/kg
                    &nbsp;·&nbsp; {ilac.konsantrasyon} mg/ml
                  </div>
                  {ilac.not && <div style={s.ilacNot}>{ilac.not}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sağ: Hesaplama */}
        <div style={s.card}>
          {secilenIlac && (
            <div style={s.secilenBadge}>
              ✓ {secilenIlac.ad}
              <button style={s.temizleIlac} onClick={() => { setSecilenIlac(null); setKonsantrasyon(''); setDoz(''); setSonuc(null) }}>✕</button>
            </div>
          )}

          <div style={s.field}>
            <label style={s.label}>Hayvan Kilosu (kg)</label>
            <input style={s.input} type="number" min="0" step="0.1" placeholder="Örn: 12.5"
              value={kilo} onChange={e => { setKilo(e.target.value); setSonuc(null) }} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Doz (mg/kg)</label>
            <input style={s.input} type="number" min="0" step="0.01" placeholder="Örn: 5"
              value={doz} onChange={e => { setDoz(e.target.value); setSonuc(null) }} />
            {secilenIlac && (
              <span style={s.hint}>
                Önerilen: {secilenIlac.dozMin === secilenIlac.dozMax ? secilenIlac.dozMin : `${secilenIlac.dozMin}–${secilenIlac.dozMax}`} mg/kg
              </span>
            )}
          </div>

          <div style={s.field}>
            <label style={s.label}>Konsantrasyon (mg/ml)</label>
            <input style={s.input} type="number" min="0" step="0.1" placeholder="Örn: 50"
              value={konsantrasyon} onChange={e => { setKonsantrasyon(e.target.value); setSonuc(null) }} />
            <span style={s.hint}>Şişenin üzerindeki mg/ml değeri</span>
          </div>

          <button style={s.btn} onClick={hesapla}>Hesapla</button>
          <button style={s.btnClear} onClick={temizle}>Temizle</button>

          {sonuc && (
            <div style={s.sonuc}>
              <div style={s.sonucBaslik}>Çekilecek Miktar</div>
              <div style={s.sonucAna}>
                <span style={s.ccDeger}>{sonuc.ml.toFixed(2)}</span>
                <span style={s.ccBirim}>ml / cc</span>
              </div>
              <div style={s.formul}>
                <div style={s.formulSatir}>
                  <span style={s.formulLabel}>Toplam doz</span>
                  <span style={s.formulDeger}>{sonuc.toplamMg.toFixed(2)} mg</span>
                </div>
                <div style={s.formulSatir}>
                  <span style={s.formulLabel}>Formül</span>
                  <span style={s.formulDeger}>({sonuc.doz} × {sonuc.kilo} kg) ÷ {sonuc.konsantrasyon}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: 'linear-gradient(160deg, #2d1a0e 0%, #1a1020 50%, #0f0a28 100%)', padding: '2rem', fontFamily: 'sans-serif' },
  back: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#4a5568', marginBottom: '1rem', padding: 0 },
  title: { fontSize: '1.8rem', color: '#1a202c', marginBottom: '0.25rem' },
  sub: { color: '#718096', fontSize: '0.95rem', marginBottom: '2rem' },
  grid: { display: 'grid', gap: '1.5rem', alignItems: 'start', maxWidth: 1000 },
  ilacPanel: { background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  ilacBaslik: { fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#718096', marginBottom: '0.75rem' },
  kategoriRow: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' },
  katBtn: { padding: '0.3rem 0.8rem', borderRadius: '1rem', border: '2px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.82rem', color: '#4a5568', fontWeight: 600 },
  katBtnActive: { background: '#4f46e5', color: 'white', borderColor: '#4f46e5' },
  ilacListesi: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  ilacKart: { padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.15s' },
  ilacKartActive: { borderColor: '#4f46e5', background: '#eef2ff' },
  ilacAd: { fontWeight: 600, fontSize: '0.9rem', color: '#2d3748', marginBottom: '0.2rem' },
  ilacDetay: { fontSize: '0.82rem', color: '#4f46e5', fontWeight: 600 },
  ilacNot: { fontSize: '0.78rem', color: '#718096', marginTop: '0.15rem' },
  card: { background: 'white', borderRadius: '0.75rem', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  secilenBadge: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#4338ca' },
  temizleIlac: { background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: '1rem', padding: 0 },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.6rem 0.85rem', border: '2px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' },
  hint: { display: 'block', fontSize: '0.78rem', color: '#a0aec0', marginTop: '0.3rem' },
  btn: { width: '100%', padding: '0.7rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' },
  btnClear: { width: '100%', padding: '0.5rem', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' },
  sonuc: { marginTop: '1.5rem', background: '#f0fff4', border: '2px solid #9ae6b4', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center' },
  sonucBaslik: { fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#276749', marginBottom: '0.75rem' },
  sonucAna: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.4rem', marginBottom: '1rem' },
  ccDeger: { fontSize: '3rem', fontWeight: 800, color: '#22543d' },
  ccBirim: { fontSize: '1.2rem', fontWeight: 600, color: '#276749' },
  formul: { background: 'white', borderRadius: '0.5rem', padding: '0.75rem', border: '1px solid #c6f6d5' },
  formulSatir: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.25rem 0', borderBottom: '1px solid #f0fff4' },
  formulLabel: { fontSize: '0.82rem', color: '#718096', fontWeight: 600 },
  formulDeger: { fontSize: '0.88rem', color: '#2d3748', fontWeight: 600, textAlign: 'right' },
}
