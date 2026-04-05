import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMobile from '../useMobile'

const EMPTY = {
  animalType: 'kopek',
  kilo: '',
  dehidrasyon: '',
  pH: '',
  hco3: '',
  be: '',
  co2: '',
  o2: '',
  sbo2: '',
  glukoz: '',
  akutKronik: 'akut',
  kcYetmezligi: false,
  hiperglisemikSok: false,
  protokolSuresi: '6',
}

export default function FluidCalc() {
  const navigate = useNavigate()
  const isMobile = useMobile()
  const [form, setForm] = useState(EMPTY)
  const [sonuc, setSonuc] = useState(null)

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const hesapla = () => {
    const kilo = parseFloat(form.kilo)
    const dehid = parseFloat(form.dehidrasyon)
    const be = parseFloat(form.be)
    const glu = parseFloat(form.glukoz)
    const ph = parseFloat(form.pH)
    const hco3 = parseFloat(form.hco3)

    if (!kilo || kilo <= 0) return alert('Kilo giriniz.')
    if (!dehid || dehid < 5 || dehid > 12) return alert('Dehidrasyon % 5-12 arasında olmalıdır.')

    // === SIVI EKSİĞİ ===
    const sıvıEksigiMl = Math.round((dehid / 100) * kilo * 1000)
    const kolloidMl = Math.round(sıvıEksigiMl * 0.25)
    const kristaloidMl = Math.round(sıvıEksigiMl * 0.75)

    // === MAX HIZ ===
    const maxKolloidHiz = kilo * 10
    const maxKristaloidHiz = kilo * 65

    // === HCO3 TAKVİYESİ ===
    let hco3Sonuc = null
    const asidozVar = !isNaN(be) && be < -5 && !isNaN(ph) && ph < 7.35

    if (asidozVar) {
      const absBe = Math.abs(be)
      const bikarvilMl = Math.round(absBe * kilo * 0.3 * 10) / 10
      const tozGram = Math.round((absBe * kilo * 0.3 / 12) * 100) / 100
      const gerekenNaClMl = Math.ceil(tozGram / 1.3) * 100

      let yontem = ''
      let precursorOneri = ''

      if (be <= -9 && form.akutKronik === 'akut') {
        yontem = 'Direkt HCO3 (acil durum — BE ≤ −9, akut)'
        precursorOneri = 'Precursor kullanılmaz'
      } else if (be <= -9 && form.akutKronik === 'kronik') {
        yontem = 'Direkt HCO3 tercih edilir (BE ≤ −9); kronik ise precursor de kullanılabilir'
        precursorOneri = form.kcYetmezligi ? 'Karaciğer yetmezliği var → precursor kullanılmaz, direkt HCO3' : 'Laktat (kronik, kontrollü HCO3 dönüşümü)'
      } else {
        // -9 < BE <= -5
        if (form.kcYetmezligi) {
          yontem = 'Direkt HCO3 (karaciğer yetmezliği — precursor metabolize edilemez)'
          precursorOneri = 'Precursor kullanılmaz'
        } else if (form.akutKronik === 'akut') {
          yontem = 'Precursor tercih edilir (BE > −9, akut)'
          precursorOneri = 'Asetat + Glukonat (hızlı HCO3 dönüşümü)'
        } else {
          yontem = 'Precursor tercih edilir (BE > −9, kronik)'
          precursorOneri = 'Laktat (kontrollü, yavaş HCO3 dönüşümü)'
        }
      }

      hco3Sonuc = { bikarvilMl, tozGram, gerekenNaClMl, yontem, precursorOneri }
    }

    // === GLUKOZ DEĞERLENDİRMESİ ===
    let gluYorum = null
    if (!isNaN(glu)) {
      if (form.animalType === 'buyuk') {
        if (glu < 60) gluYorum = { durum: 'dusuk', mesaj: `Glukoz düşük (${glu}) — Dextroz ver (normal: 60–80)` }
        else if (glu > 120) gluYorum = { durum: 'yuksek', mesaj: `Glukoz yüksek (${glu}) — Diyabet şüphesi (normal: 60–80)` }
        else gluYorum = { durum: 'normal', mesaj: `Glukoz normal (${glu}, ref: 60–80)` }
      } else if (form.animalType === 'kedi') {
        if (glu < 80) gluYorum = { durum: 'dusuk', mesaj: `Glukoz düşük (${glu}) — Dextroz ver (normal: 80–120)` }
        else if (glu > 300) gluYorum = { durum: 'yuksek', mesaj: `Glukoz yüksek (${glu}) — Diyabet şüphesi (>300); stres hiperglisemisi olabilir` }
        else gluYorum = { durum: 'normal', mesaj: `Glukoz normal (${glu}, ref: 80–120)` }
      } else {
        if (glu < 80) gluYorum = { durum: 'dusuk', mesaj: `Glukoz düşük (${glu}) — Dextroz ver (normal: 80–120)` }
        else if (glu > 240) gluYorum = { durum: 'yuksek', mesaj: `Glukoz yüksek (${glu}) — Diyabet şüphesi (>240)` }
        else gluYorum = { durum: 'normal', mesaj: `Glukoz normal (${glu}, ref: 80–120)` }
      }
    }

    // === KOLLOİD SEÇİMİ ===
    let kolloidSec = form.hiperglisemikSok
      ? 'HES (Hidroksi Etil Starch) — hasta hiperglisemik, Dextran yüksek glikoz içerdiği için kontrendike'
      : 'Dextran 40/60 veya HES (her ikisi de kullanılabilir)'

    // === METABOLİK DURUM ===
    let metabolikDurum = null
    if (!isNaN(ph) && !isNaN(hco3) && !isNaN(be)) {
      if (ph < 7.35 && hco3 < 22 && be < -3) {
        metabolikDurum = { tip: 'asidoz', mesaj: 'Metabolik Asidoz — pH ↓, HCO3 ↓, BE negatif' }
      } else if (ph > 7.45 && hco3 > 26 && be > 3) {
        metabolikDurum = { tip: 'alkaloz', mesaj: 'Metabolik Alkaloz — NaCl tedavisi endike (Cl → HCO3 değişimi)' }
      } else if (!isNaN(ph)) {
        metabolikDurum = { tip: 'normal', mesaj: `pH ${ph} — Asit-baz dengesi normal sınırda` }
      }
    }

    // === PROTOKOL ===
    const totalSure = Math.max(1, Math.min(24, parseInt(form.protokolSuresi) || 6))
    const protokol = []
    const kolloidIsim = form.hiperglisemikSok ? 'HES' : 'HES / Dextran'
    const precursorIsim = form.kcYetmezligi
      ? 'NaCl'
      : form.akutKronik === 'akut'
        ? 'İzolen (Asetat + Glukonat)'
        : 'Laktatlı Ringer'

    // Önce zorunlu adımları belirle (max hız sınırlarına uyarak)
    const adimlar = [] // { tip, ml, isim, neden }

    // 1. Adım: İlk kolloid (hipovolemi)
    const ilkKolloid = Math.min(maxKolloidHiz, kolloidMl)
    adimlar.push({ tip: 'kolloid', ml: ilkKolloid, isim: kolloidIsim, neden: 'Periferik dolaşımı uyarmak, hipovolemiyi düzeltmek' })
    let remKolloid = kolloidMl - ilkKolloid

    // 2. Adım: HCO3 (asidoz varsa) — 2. saatte
    let hco3CarrierMl = 0
    if (hco3Sonuc) {
      const carrierIsim = gluYorum?.durum === 'dusuk' ? 'Dextroz %5' : 'NaCl'
      hco3CarrierMl = hco3Sonuc.gerekenNaClMl
      adimlar.push({
        tip: 'hco3',
        ml: hco3CarrierMl + hco3Sonuc.bikarvilMl,
        isim: `${hco3CarrierMl} ml ${carrierIsim} + ${hco3Sonuc.bikarvilMl} ml Bikarvil`,
        neden: `Metabolik asidoz: ${hco3Sonuc.yontem.split('—')[0].trim()}`
      })
    }

    // 3. Adım: Ağır dehidrasyon ek kolloid
    if (dehid >= 10 && remKolloid > 0) {
      const ek = Math.min(maxKolloidHiz, remKolloid)
      adimlar.push({ tip: 'kolloid', ml: ek, isim: kolloidIsim, neden: 'Ağır dehidrasyon (≥%10) — ek kolloid' })
      remKolloid -= ek
    }

    // Kalan kolloid
    while (remKolloid > 0) {
      const p = Math.min(maxKolloidHiz, remKolloid)
      adimlar.push({ tip: 'kolloid', ml: p, isim: kolloidIsim, neden: 'Kalan kolloid dozu' })
      remKolloid -= p
    }

    // Kalan kristaloid — süreye sığdır
    let remKristaloid = Math.max(0, kristaloidMl - hco3CarrierMl)
    const zorunluSaat = adimlar.length
    const kalanSaat = Math.max(1, totalSure - zorunluSaat)

    // Glukoz düşükse ilk kalan saatte dextroz
    if (gluYorum?.durum === 'dusuk' && remKristaloid > 0 && kalanSaat >= 1) {
      const dex = Math.round(Math.min(kilo * 10, remKristaloid / 2))
      adimlar.push({ tip: 'dextroz', ml: dex, isim: 'Dextroz %5', neden: 'Hipoglisemi desteği' })
      remKristaloid -= dex
    }

    // Kalan kristaloid'i kalan saatlere böl
    if (remKristaloid > 0) {
      const kalanKristaloidSaat = totalSure - adimlar.length
      const saatBasiMl = Math.ceil(remKristaloid / Math.max(1, kalanKristaloidSaat))
      while (remKristaloid > 0) {
        const p = Math.min(saatBasiMl, remKristaloid)
        adimlar.push({ tip: 'kristaloid', ml: Math.round(p), isim: precursorIsim, neden: 'İntravasküler destek ve elektrolit dengesi' })
        remKristaloid -= p
      }
    }

    // Adımları saatlere yerleştir — toplam saat'i aşarsa son saatte birleştir
    for (let i = 0; i < adimlar.length; i++) {
      const a = adimlar[i]
      const saatNo = Math.min(i + 1, totalSure)
      const mevcut = protokol.find(p => p.saat === saatNo)
      if (mevcut) {
        mevcut.items.push(`${a.ml} ml ${a.isim}`)
        mevcut.neden += ` · ${a.neden}`
        mevcut.tip = 'mixed'
      } else {
        protokol.push({ saat: saatNo, items: [`${a.ml} ml ${a.isim}`], neden: a.neden, tip: a.tip })
      }
    }

    setSonuc({
      sıvıEksigiMl, kolloidMl, kristaloidMl,
      maxKolloidHiz, maxKristaloidHiz,
      hco3Sonuc, gluYorum, kolloidSec, metabolikDurum,
      dehid, kilo, protokol,
    })
  }

  return (
    <div style={s.container}>
      <button style={s.back} onClick={() => navigate('/')}>← Geri</button>
      <h1 style={s.title}>💧 Sıvı Tedavisi Hesaplayıcı</h1>

      <div style={{ ...s.grid, gridTemplateColumns: isMobile ? '1fr' : '420px 1fr' }}>
        {/* SOL: FORM */}
        <div style={s.formCard}>

          <div style={s.section}>
            <div style={s.sectionTitle}>Hasta Bilgileri</div>
            <div style={s.row}>
              <label style={s.label}>Hayvan Türü</label>
              <select style={s.select} value={form.animalType} onChange={e => set('animalType', e.target.value)}>
                <option value="kopek">Köpek</option>
                <option value="kedi">Kedi</option>
                <option value="buyuk">Büyük Hayvan</option>
              </select>
            </div>
            <div style={s.row}>
              <label style={s.label}>Kilo (kg)</label>
              <input style={s.input} type="number" min="0" placeholder="Örn: 10" value={form.kilo} onChange={e => set('kilo', e.target.value)} />
            </div>
            <div style={s.row}>
              <label style={s.label}>Dehidrasyon (%)</label>
              <input style={s.input} type="number" min="5" max="12" placeholder="5–12" value={form.dehidrasyon} onChange={e => set('dehidrasyon', e.target.value)} />
              <span style={s.hint}>&gt;12 = ölümcül, &lt;5 = fark edilemez</span>
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>Kan Gazı Değerleri</div>
            {[
              ['pH', 'pH', '7.35–7.45'],
              ['hco3', 'HCO3 (mEq/L)', '22–26'],
              ['be', 'BE', '−3 ile +3'],
              ['co2', 'CO2 (mmHg)', '35–45'],
              ['o2', 'O2 (mmHg)', '80–100'],
              ['sbo2', 'SbO2 (%)', '95–100'],
              ['glukoz', 'Glukoz (mg/dL)', 'Köpek/Kedi: 80–120'],
            ].map(([key, label, ref]) => (
              <div key={key} style={s.row}>
                <label style={s.label}>{label}</label>
                <input style={s.input} type="number" step="0.01" placeholder={ref} value={form[key]} onChange={e => set(key, e.target.value)} />
              </div>
            ))}
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>Klinik Durum</div>
            <div style={s.row}>
              <label style={s.label}>Akut / Kronik</label>
              <select style={s.select} value={form.akutKronik} onChange={e => set('akutKronik', e.target.value)}>
                <option value="akut">Akut</option>
                <option value="kronik">Kronik</option>
              </select>
            </div>
            <div style={s.checkRow}>
              <input type="checkbox" id="kc" checked={form.kcYetmezligi} onChange={e => set('kcYetmezligi', e.target.checked)} />
              <label htmlFor="kc" style={s.checkLabel}>Karaciğer Yetmezliği var</label>
            </div>
            <div style={s.checkRow}>
              <input type="checkbox" id="hiper" checked={form.hiperglisemikSok} onChange={e => set('hiperglisemikSok', e.target.checked)} />
              <label htmlFor="hiper" style={s.checkLabel}>Hiperglisemik Şok</label>
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>Protokol Süresi</div>
            <div style={s.row}>
              <label style={s.label}>Kaç saat?</label>
              <input style={s.input} type="number" min="1" max="24" placeholder="örn: 6" value={form.protokolSuresi} onChange={e => set('protokolSuresi', e.target.value)} />
              <span style={s.hint}>saat (1–24)</span>
            </div>
          </div>

          <button style={s.btn} onClick={hesapla}>Hesapla</button>
          <button style={s.btnClear} onClick={() => { setForm(EMPTY); setSonuc(null) }}>Temizle</button>
        </div>

        {/* SAĞ: SONUÇLAR */}
        <div>
          {!sonuc && (
            <div style={s.placeholder}>Formu doldurup "Hesapla" butonuna basın.</div>
          )}

          {sonuc && (<>

            {/* Metabolik durum */}
            {sonuc.metabolikDurum && (
              <div style={{
                ...s.resultCard,
                borderLeft: `4px solid ${sonuc.metabolikDurum.tip === 'asidoz' ? '#e53e3e' : sonuc.metabolikDurum.tip === 'alkaloz' ? '#d69e2e' : '#38a169'}`,
              }}>
                <div style={s.cardTitle}>
                  {sonuc.metabolikDurum.tip === 'asidoz' ? '🔴' : sonuc.metabolikDurum.tip === 'alkaloz' ? '🟡' : '🟢'} Asit-Baz Durumu
                </div>
                <p style={s.cardText}>{sonuc.metabolikDurum.mesaj}</p>
              </div>
            )}

            {/* Glukoz */}
            {sonuc.gluYorum && (
              <div style={{
                ...s.resultCard,
                borderLeft: `4px solid ${sonuc.gluYorum.durum === 'dusuk' ? '#e53e3e' : sonuc.gluYorum.durum === 'yuksek' ? '#d69e2e' : '#38a169'}`,
              }}>
                <div style={s.cardTitle}>🍬 Glukoz Değerlendirmesi</div>
                <p style={s.cardText}>{sonuc.gluYorum.mesaj}</p>
              </div>
            )}

            {/* Sıvı eksiği */}
            <div style={{ ...s.resultCard, borderLeft: '4px solid #3182ce' }}>
              <div style={s.cardTitle}>💧 Sıvı Eksiği</div>
              <div style={s.statRow}>
                <div style={s.stat}>
                  <div style={s.statVal}>{sonuc.sıvıEksigiMl} ml</div>
                  <div style={s.statLabel}>Toplam Eksik</div>
                </div>
                <div style={s.stat}>
                  <div style={{ ...s.statVal, color: '#6b46c1' }}>{sonuc.kolloidMl} ml</div>
                  <div style={s.statLabel}>Kolloid (¼)</div>
                </div>
                <div style={s.stat}>
                  <div style={{ ...s.statVal, color: '#2b6cb0' }}>{sonuc.kristaloidMl} ml</div>
                  <div style={s.statLabel}>Kristaloid (¾)</div>
                </div>
              </div>
              <p style={{ ...s.cardText, marginTop: '0.5rem' }}>
                Formül: %{sonuc.dehid} × {sonuc.kilo} kg × 1000 = {sonuc.sıvıEksigiMl} ml
              </p>
            </div>

            {/* Kolloid seçimi */}
            <div style={{ ...s.resultCard, borderLeft: '4px solid #6b46c1' }}>
              <div style={s.cardTitle}>🧪 Kolloid Seçimi</div>
              <p style={s.cardText}>{sonuc.kolloidSec}</p>
            </div>

            {/* Max infüzyon hızı */}
            <div style={{ ...s.resultCard, borderLeft: '4px solid #38a169' }}>
              <div style={s.cardTitle}>⏱️ Maksimum İnfüzyon Hızı</div>
              <div style={s.statRow}>
                <div style={s.stat}>
                  <div style={{ ...s.statVal, color: '#6b46c1' }}>{sonuc.maxKolloidHiz} ml/sa</div>
                  <div style={s.statLabel}>Kolloid (10 ml/kg/sa)</div>
                </div>
                <div style={s.stat}>
                  <div style={{ ...s.statVal, color: '#2b6cb0' }}>{sonuc.maxKristaloidHiz} ml/sa</div>
                  <div style={s.statLabel}>Kristaloid (65 ml/kg/sa)</div>
                </div>
              </div>
              <p style={{ ...s.cardText, marginTop: '0.5rem', color: '#c53030' }}>
                ⚠️ Bu hızlar aşılırsa pozitif sıvı dengesi → ödem riski
              </p>
            </div>

            {/* HCO3 takviyesi */}
            {sonuc.hco3Sonuc && (
              <div style={{ ...s.resultCard, borderLeft: '4px solid #e53e3e' }}>
                <div style={s.cardTitle}>🧫 HCO3 Takviyesi</div>
                <div style={s.statRow}>
                  <div style={s.stat}>
                    <div style={{ ...s.statVal, color: '#c53030' }}>{sonuc.hco3Sonuc.bikarvilMl} ml</div>
                    <div style={s.statLabel}>Bikarvil (solüsyon)</div>
                  </div>
                  <div style={s.stat}>
                    <div style={{ ...s.statVal, color: '#c53030' }}>{sonuc.hco3Sonuc.tozGram} g</div>
                    <div style={s.statLabel}>Toz HCO3</div>
                  </div>
                  <div style={s.stat}>
                    <div style={{ ...s.statVal, color: '#744210' }}>≥{sonuc.hco3Sonuc.gerekenNaClMl} ml</div>
                    <div style={s.statLabel}>Min. NaCl (max 1.3g/100ml)</div>
                  </div>
                </div>
                <div style={s.infoBox}>
                  <div><strong>Yöntem:</strong> {sonuc.hco3Sonuc.yontem}</div>
                  <div style={{ marginTop: '0.3rem' }}><strong>Precursor:</strong> {sonuc.hco3Sonuc.precursorOneri}</div>
                </div>
                <p style={{ ...s.cardText, marginTop: '0.5rem', fontSize: '0.82rem', color: '#718096' }}>
                  Formül: |BE| × BW × 0.3 = Bikarvil ml &nbsp;|&nbsp; Toz: ÷ 12
                </p>
              </div>
            )}

            {!sonuc.hco3Sonuc && (
              <div style={{ ...s.resultCard, borderLeft: '4px solid #38a169' }}>
                <div style={s.cardTitle}>🧫 HCO3 Takviyesi</div>
                <p style={s.cardText}>
                  {(!isNaN(parseFloat(form.be)) && parseFloat(form.be) >= -5)
                    ? 'BE > −5 → HCO3 takviyesi gerekmiyor, precursor yeterli'
                    : 'Kan gazı değerleri girilmedi — HCO3 hesaplanamadı'}
                </p>
              </div>
            )}

            {/* PROTOKOL */}
            {sonuc.protokol?.length > 0 && (
              <div style={{ ...s.resultCard, borderLeft: '4px solid #2d3748' }}>
                <div style={s.cardTitle}>📋 Sıvı Tedavi Protokolü (Saat Saat)</div>
                <p style={{ ...s.cardText, marginBottom: '0.75rem', fontSize: '0.82rem', color: '#718096' }}>
                  Toplam {sonuc.sıvıEksigiMl} ml · {sonuc.protokol.length} saat · ~{Math.round(sonuc.sıvıEksigiMl / sonuc.protokol.length)} ml/saat ortalama. Hasta yanıtına göre revize edilmeli.
                </p>
                <div style={s.protokolList}>
                  {sonuc.protokol.map((adim, i) => {
                    const renkler = {
                      kolloid:    { bg: '#f5f3ff', border: '#c4b5fd', dot: '#7c3aed', text: '#4c1d95' },
                      hco3:       { bg: '#fff5f5', border: '#feb2b2', dot: '#e53e3e', text: '#742a2a' },
                      dextroz:    { bg: '#fffff0', border: '#f6e05e', dot: '#d69e2e', text: '#744210' },
                      kristaloid: { bg: '#ebf8ff', border: '#bee3f8', dot: '#3182ce', text: '#1a365d' },
                    }
                    const r = renkler[adim.tip] || renkler.kristaloid
                    return (
                      <div key={i} style={{ ...s.adimKart, background: r.bg, borderColor: r.border }}>
                        <div style={{ ...s.adimSaat, background: r.dot }}>
                          {adim.saat}. Saat
                        </div>
                        <div style={s.adimIcerik}>
                          {adim.items.map((item, j) => (
                            <div key={j} style={{ ...s.adimItem, color: r.text }}>{item}</div>
                          ))}
                          <div style={s.adimNeden}>{adim.neden}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={s.protokolNot}>
                  ⚠️ Bu protokol başlangıç rehberidir. Hasta yanıtı, vital bulgular ve kan gazı tekrarına göre güncellenmeli.
                </div>
              </div>
            )}

          </>)}
        </div>
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', background: 'linear-gradient(160deg, #0d2b3a 0%, #0a2040 50%, #071530 100%)', padding: '2rem', fontFamily: 'sans-serif' },
  back: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#4a5568', marginBottom: '1rem', padding: 0 },
  title: { fontSize: '1.8rem', color: '#1a202c', marginBottom: '1.5rem' },
  grid: { display: 'grid', gap: '1.5rem', alignItems: 'start' },
  formCard: { background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  section: { marginBottom: '1.25rem' },
  sectionTitle: { fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#718096', marginBottom: '0.6rem' },
  row: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' },
  label: { color: '#4a5568', fontSize: '0.9rem', minWidth: '140px' },
  input: { padding: '0.35rem 0.7rem', border: '1px solid #cbd5e0', borderRadius: '0.4rem', width: '110px', fontSize: '0.95rem' },
  select: { padding: '0.35rem 0.7rem', border: '1px solid #cbd5e0', borderRadius: '0.4rem', fontSize: '0.95rem' },
  hint: { color: '#a0aec0', fontSize: '0.78rem' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' },
  checkLabel: { color: '#4a5568', fontSize: '0.9rem', cursor: 'pointer' },
  btn: { width: '100%', padding: '0.65rem', background: '#3182ce', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' },
  btnClear: { width: '100%', padding: '0.5rem', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' },
  placeholder: { color: '#a0aec0', textAlign: 'center', marginTop: '4rem', fontSize: '1rem' },
  resultCard: { background: 'white', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '1rem' },
  cardTitle: { fontWeight: 700, fontSize: '0.9rem', color: '#2d3748', marginBottom: '0.6rem' },
  cardText: { margin: 0, color: '#4a5568', fontSize: '0.92rem', lineHeight: 1.6 },
  statRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  stat: { flex: 1, minWidth: '100px', textAlign: 'center', background: '#f7fafc', borderRadius: '0.5rem', padding: '0.6rem 0.4rem' },
  statVal: { fontSize: '1.3rem', fontWeight: 700, color: '#2d3748' },
  statLabel: { fontSize: '0.75rem', color: '#718096', marginTop: '0.2rem' },
  infoBox: { background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '0.4rem', padding: '0.6rem 0.75rem', marginTop: '0.75rem', fontSize: '0.88rem', color: '#742a2a', lineHeight: 1.6 },

  protokolList: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' },
  adimKart: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', border: '1px solid', borderRadius: '0.5rem', padding: '0.6rem 0.75rem' },
  adimSaat: { color: 'white', fontWeight: 700, fontSize: '0.78rem', borderRadius: '0.4rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap', marginTop: '0.1rem' },
  adimIcerik: { flex: 1 },
  adimItem: { fontWeight: 600, fontSize: '0.92rem', lineHeight: 1.5 },
  adimNeden: { color: '#718096', fontSize: '0.8rem', marginTop: '0.15rem' },
  protokolNot: { marginTop: '0.75rem', background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: '0.4rem', padding: '0.5rem 0.75rem', fontSize: '0.82rem', color: '#744210' },
}
