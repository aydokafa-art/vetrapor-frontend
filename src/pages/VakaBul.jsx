import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || ''

const STEPS = ['Vitaller', 'İnspeksiyon', 'Oskültasyon', 'Perküsyon', 'Palpasyon']

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <div style={s.radioRow}>
        {options.map(opt => (
          <button
            key={opt.value}
            style={{ ...s.pill, ...(value === opt.value ? s.pillActive : {}) }}
            onClick={() => onChange(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function CheckGroup({ label, options, values, onChange }) {
  const toggle = (v) => {
    if (values.includes(v)) onChange(values.filter(x => x !== v))
    else onChange([...values, v])
  }
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <div style={s.radioRow}>
        {options.map(opt => (
          <button
            key={opt.value}
            style={{ ...s.pill, ...(values.includes(opt.value) ? s.pillActive : {}) }}
            onClick={() => toggle(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function NumberField({ label, unit, value, onChange, placeholder }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || '—'}
          style={s.input}
        />
        {unit && <span style={{ color: '#718096', fontSize: '0.9rem' }}>{unit}</span>}
      </div>
    </div>
  )
}

function deriveSymptoms(vitals, inspeksiyon, oskultasyon, perkusyon, palpasyon) {
  const syms = []

  // Vitaller
  const temp = parseFloat(vitals.sicaklik)
  if (!isNaN(temp)) {
    if (temp > 39.5) syms.push('ateş')
    if (temp < 37.5) syms.push('hipotermi')
  }
  const dehid = parseInt(vitals.dehidrasyon)
  if (!isNaN(dehid) && dehid >= 6) syms.push('dehidrasyon')
  if (vitals.crt === 'uzamış') syms.push('CRT uzamış')

  // İnspeksiyon
  if (inspeksiyon.iastah === 'azalmış' || inspeksiyon.iastah === 'yok') syms.push('iştahsızlık')
  if (inspeksiyon.kusma) syms.push('kusma')
  if (inspeksiyon.ishal) syms.push('ishal')
  if (inspeksiyon.kiloKaybi) syms.push('kilo kaybı')
  if (inspeksiyon.gozAkintisi) syms.push('göz akıntısı')
  if (inspeksiyon.burnuAkintisi) syms.push('burun akıntısı')
  if (inspeksiyon.ciltLezyonu) syms.push('deri lezyonları', 'lezyon')
  if (inspeksiyon.tuyDokulmesi) syms.push('tüy dökülmesi')
  if (inspeksiyon.hipersalivasyon) syms.push('hipersalivasyon')
  if (inspeksiyon.aksirma) syms.push('aksırık', 'hapşırma')
  if (inspeksiyon.genelDurum === 'letarjik') syms.push('halsizlik', 'letarji')
  if (inspeksiyon.genelDurum === 'kötü') syms.push('halsizlik', 'depresyon')
  if (inspeksiyon.mukozalar === 'solgun') syms.push('anemi', 'solgun mukoza')
  if (inspeksiyon.mukozalar === 'sarı') syms.push('sarılık', 'ikterus')
  if (inspeksiyon.mukozalar === 'ikterik') syms.push('ikterus', 'sarılık', 'hepatik yetmezlik')
  if (inspeksiyon.mukozalar === 'hiperemik') syms.push('ateş', 'hiperemi')

  // Oskültasyon
  if (oskultasyon.akciger && oskultasyon.akciger !== 'normal') syms.push('solunum güçlüğü', 'öksürük')
  if (oskultasyon.akciger === 'wheezing') syms.push('wheezing', 'bronkospazm')
  if (oskultasyon.akciger === 'azalmış') syms.push('plevral efüzyon')
  if (oskultasyon.kalp === 'üfürüm') syms.push('kalp üfürümü', 'üfürüm')
  if (oskultasyon.bagırsak === 'artmış') syms.push('hiperperistaltizm')
  if (oskultasyon.bagırsak === 'azalmış' || oskultasyon.bagırsak === 'yok') syms.push('ileus', 'bağırsak tıkanıklığı')

  // Perküsyon
  if (perkusyon.gogus === 'matite') syms.push('plevral efüzyon', 'pnömoni')
  if (perkusyon.gogus === 'timpanizm') syms.push('pnömotoraks')
  if (perkusyon.karin === 'matite') syms.push('asit', 'karın sıvısı')
  if (perkusyon.karin === 'timpanizm') syms.push('gaz', 'bağırsak distansiyonu')

  // Palpasyon
  if (palpasyon.lenfler === 'şiş') {
    syms.push('lenfadenopati', 'lenf şişliği')
    const bolge = palpasyon.lenfBolge || []
    if (bolge.includes('submandibular')) syms.push('submandibular lenfadenopati')
    if (bolge.includes('prescapular')) syms.push('prescapular lenfadenopati')
    if (bolge.includes('aksiller')) syms.push('aksiller lenfadenopati')
    if (bolge.includes('inguinal')) syms.push('inguinal lenfadenopati')
    if (bolge.includes('popliteal')) syms.push('popliteal lenfadenopati')
    if (bolge.includes('mezenterik')) syms.push('mezenterik lenfadenopati')
    if (bolge.includes('generalize')) syms.push('generalize lenfadenopati', 'multipl lenfadenopati')
  }
  if (palpasyon.karinPal.includes('ağrılı')) syms.push('karın ağrısı', 'abdominal ağrı')
  if (palpasyon.karinPal.includes('gergin')) syms.push('abdominal gerginlik', 'karın gerginliği')
  if (palpasyon.karinPal.includes('kitle')) syms.push('kitle', 'tümör')
  if (palpasyon.karaciger === 'büyümüş') syms.push('hepatomegali')
  if (palpasyon.dalak === 'büyümüş') syms.push('splenomegali')

  return [...new Set(syms)]
}

export default function VakaBul() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const [vitals, setVitals] = useState({
    animalType: '', yasValue: '', yasUnit: 'yil', kilo: '',
    sicaklik: '', bpm: '', rpm: '', crt: '', dehidrasyon: '',
  })
  const [inspeksiyon, setInspeksiyon] = useState({
    genelDurum: '', mukozalar: '', iastah: '',
    kusma: false, ishal: false, kiloKaybi: false,
    gozAkintisi: false, burnuAkintisi: false, ciltLezyonu: false,
    tuyDokulmesi: false, hipersalivasyon: false, aksirma: false,
  })
  const [oskultasyon, setOskultasyon] = useState({ akciger: '', kalp: '', bagırsak: '' })
  const [perkusyon, setPerkusyon] = useState({ gogus: '', karin: '' })
  const [palpasyon, setPalpasyon] = useState({ lenfler: '', karinPal: [], karaciger: '', dalak: '' })

  const setV = (k) => (v) => setVitals(p => ({ ...p, [k]: v }))
  const setI = (k) => (v) => setInspeksiyon(p => ({ ...p, [k]: v }))
  const setO = (k) => (v) => setOskultasyon(p => ({ ...p, [k]: v }))
  const setPerk = (k) => (v) => setPerkusyon(p => ({ ...p, [k]: v }))
  const setPalp = (k) => (v) => setPalpasyon(p => ({ ...p, [k]: v }))

  const boolOpts = [{ value: true, label: 'Evet' }, { value: false, label: 'Hayır' }]

  async function search() {
    setLoading(true)
    const syms = deriveSymptoms(vitals, inspeksiyon, oskultasyon, perkusyon, palpasyon)
    try {
      const r = await fetch(`${API}/api/cases/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animalType: vitals.animalType, symptoms: syms }),
      })
      const data = await r.json()
      setResults({ ...data, derivedSymptoms: syms })
    } catch {
      setResults({ results: [], derivedSymptoms: syms, totalSearched: 0 })
    }
    setLoading(false)
  }

  // ---- Render steps ----
  const stepContent = [
    // Step 0: Vitaller
    <div key="vitaller">
      <RadioGroup label="Tür" value={vitals.animalType} onChange={setV('animalType')}
        options={[{ value: 'kedi', label: '🐱 Kedi' }, { value: 'kopek', label: '🐶 Köpek' }, { value: '', label: 'Belirtme' }]} />
      <div style={s.fieldRow}>
        <NumberField label="Yaş" unit="" value={vitals.yasValue} onChange={setV('yasValue')} placeholder="—" />
        <RadioGroup label="Birim" value={vitals.yasUnit} onChange={setV('yasUnit')}
          options={[{ value: 'yil', label: 'Yıl' }, { value: 'ay', label: 'Ay' }]} />
      </div>
      <div style={s.fieldRow}>
        <NumberField label="Kilo" unit="kg" value={vitals.kilo} onChange={setV('kilo')} />
        <NumberField label="Vücut Sıcaklığı" unit="°C" value={vitals.sicaklik} onChange={setV('sicaklik')} placeholder="38.5" />
      </div>
      <div style={s.fieldRow}>
        <NumberField label="BPM" unit="atım/dk" value={vitals.bpm} onChange={setV('bpm')} />
        <NumberField label="RPM" unit="solunum/dk" value={vitals.rpm} onChange={setV('rpm')} />
      </div>
      <RadioGroup label="CRT" value={vitals.crt} onChange={setV('crt')}
        options={[{ value: 'normal', label: 'Normal' }, { value: 'uzamış', label: 'Uzamış (>2sn)' }]} />
      <RadioGroup label="Dehidrasyon" value={vitals.dehidrasyon} onChange={setV('dehidrasyon')}
        options={[
          { value: '0', label: 'Yok' }, { value: '5', label: '%5' },
          { value: '6', label: '%6' }, { value: '7', label: '%7' },
          { value: '8', label: '%8' }, { value: '10', label: '%10+' },
        ]} />
    </div>,

    // Step 1: İnspeksiyon
    <div key="inspeksiyon">
      <RadioGroup label="Genel Durum" value={inspeksiyon.genelDurum} onChange={setI('genelDurum')}
        options={[{ value: 'iyi', label: 'İyi' }, { value: 'letarjik', label: 'Letarjik' }, { value: 'kötü', label: 'Kötü' }]} />
      <RadioGroup label="Mukozalar" value={inspeksiyon.mukozalar} onChange={setI('mukozalar')}
        options={[{ value: 'normal', label: 'Normal' }, { value: 'solgun', label: 'Solgun' }, { value: 'sarı', label: 'Sarı' }, { value: 'ikterik', label: 'İkterik' }, { value: 'hiperemik', label: 'Hiperemik' }]} />
      <RadioGroup label="İştah" value={inspeksiyon.iastah} onChange={setI('iastah')}
        options={[{ value: 'normal', label: 'Normal' }, { value: 'azalmış', label: 'Azalmış' }, { value: 'yok', label: 'Yok' }]} />
      <div style={s.checkGrid}>
        {[
          ['kusma', 'Kusma'], ['ishal', 'İshal'], ['kiloKaybi', 'Kilo Kaybı'],
          ['gozAkintisi', 'Göz Akıntısı'], ['burnuAkintisi', 'Burun Akıntısı'],
          ['ciltLezyonu', 'Cilt Lezyonu'], ['tuyDokulmesi', 'Tüy Dökülmesi'],
          ['hipersalivasyon', 'Hipersalivasyon'], ['aksirma', 'Aksırma/Hapşırma'],
        ].map(([k, lbl]) => (
          <button key={k}
            style={{ ...s.pill, ...(inspeksiyon[k] ? s.pillActive : {}) }}
            onClick={() => setInspeksiyon(p => ({ ...p, [k]: !p[k] }))}
            type="button"
          >
            {inspeksiyon[k] ? '✓ ' : ''}{lbl}
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Oskültasyon
    <div key="oskultasyon">
      <RadioGroup label="Akciğer Sesleri" value={oskultasyon.akciger} onChange={setO('akciger')}
        options={[
          { value: 'normal', label: 'Normal' }, { value: 'ronküs', label: 'Ronküs' },
          { value: 'krepitasyon', label: 'Krepitasyon' }, { value: 'wheezing', label: 'Wheezing' },
          { value: 'azalmış', label: 'Azalmış' },
        ]} />
      <RadioGroup label="Kalp Sesleri" value={oskultasyon.kalp} onChange={setO('kalp')}
        options={[{ value: 'normal', label: 'Normal' }, { value: 'üfürüm', label: 'Üfürüm' }]} />
      <RadioGroup label="Bağırsak Sesleri" value={oskultasyon.bagırsak} onChange={setO('bagırsak')}
        options={[
          { value: 'normal', label: 'Normal' }, { value: 'artmış', label: 'Artmış' },
          { value: 'azalmış', label: 'Azalmış' }, { value: 'yok', label: 'Yok' },
        ]} />
    </div>,

    // Step 3: Perküsyon
    <div key="perkusyon">
      <RadioGroup label="Göğüs Perküsyon" value={perkusyon.gogus} onChange={setPerk('gogus')}
        options={[{ value: 'normal', label: 'Normal' }, { value: 'matite', label: 'Matite' }, { value: 'timpanizm', label: 'Timpanizm' }]} />
      <RadioGroup label="Karın Perküsyon" value={perkusyon.karin} onChange={setPerk('karin')}
        options={[{ value: 'normal', label: 'Normal' }, { value: 'matite', label: 'Matite' }, { value: 'timpanizm', label: 'Timpanizm' }]} />
    </div>,

    // Step 4: Palpasyon
    <div key="palpasyon">
      <RadioGroup label="Lenf Nodülleri" value={palpasyon.lenfler} onChange={setPalp('lenfler')}
        options={[{ value: 'normal', label: 'Normal' }, { value: 'şiş', label: 'Şiş' }]} />
      {palpasyon.lenfler === 'şiş' && (
        <CheckGroup label="Hangi Lenf Nodülleri?" values={palpasyon.lenfBolge || []} onChange={setPalp('lenfBolge')}
          options={[
            { value: 'submandibular', label: 'Submandibular' },
            { value: 'prescapular', label: 'Prescapular' },
            { value: 'aksiller', label: 'Aksiller' },
            { value: 'inguinal', label: 'İnguinal' },
            { value: 'popliteal', label: 'Popliteal' },
            { value: 'mezenterik', label: 'Mezenterik' },
            { value: 'generalize', label: 'Generalize' },
          ]}
        />
      )}
      <CheckGroup label="Karın Palpasyon" values={palpasyon.karinPal} onChange={setPalp('karinPal')}
        options={[
          { value: 'normal', label: 'Normal' }, { value: 'ağrılı', label: 'Ağrılı' },
          { value: 'gergin', label: 'Gergin' }, { value: 'kitle', label: 'Kitle' },
        ]} />
      <RadioGroup label="Karaciğer" value={palpasyon.karaciger} onChange={setPalp('karaciger')}
        options={[{ value: 'normal', label: 'Normal' }, { value: 'büyümüş', label: 'Büyümüş' }]} />
      <RadioGroup label="Dalak" value={palpasyon.dalak} onChange={setPalp('dalak')}
        options={[{ value: 'normal', label: 'Normal' }, { value: 'büyümüş', label: 'Büyümüş' }]} />
    </div>,
  ]

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Geri</button>
        <h1 style={s.title}>🔍 Vaka Bul</h1>
        <p style={s.sub}>Muayene bulgularını gir, benzer vakaları bul</p>
      </div>

      {!results ? (
        <div style={s.card}>
          {/* Step indicator */}
          <div style={s.stepBar}>
            {STEPS.map((st, i) => (
              <div key={st} style={s.stepItem}>
                <div style={{ ...s.stepDot, ...(i === step ? s.stepActive : i < step ? s.stepDone : {}) }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ ...s.stepLabel, ...(i === step ? { color: '#4f46e5', fontWeight: 600 } : {}) }}>{st}</span>
              </div>
            ))}
          </div>

          {/* Step content */}
          <div style={s.stepContent}>
            <h2 style={s.stepTitle}>{STEPS[step]}</h2>
            {stepContent[step]}
          </div>

          {/* Navigation */}
          <div style={s.navRow}>
            {step > 0 && (
              <button style={s.btnSecondary} onClick={() => setStep(s => s - 1)}>← Geri</button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button style={s.btnPrimary} onClick={() => setStep(s => s + 1)}>İleri →</button>
            ) : (
              <button style={s.btnSearch} onClick={search} disabled={loading}>
                {loading ? 'Aranıyor...' : '🔍 Vaka Ara'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={s.stepTitle}>Sonuçlar</h2>
            <button style={s.btnSecondary} onClick={() => setResults(null)}>← Yeniden Ara</button>
          </div>

          {/* Derived symptoms */}
          {results.derivedSymptoms?.length > 0 && (
            <div style={s.sympBox}>
              <span style={{ fontSize: '0.8rem', color: '#718096', marginRight: '0.5rem' }}>Aranan:</span>
              {results.derivedSymptoms.map(sym => (
                <span key={sym} style={s.sympTag}>{sym}</span>
              ))}
            </div>
          )}

          {results.results.length === 0 ? (
            <div style={s.noResult}>
              <p>Eşleşen vaka bulunamadı.</p>
              <p style={{ fontSize: '0.9rem', color: '#718096' }}>{results.totalSearched} vaka tarandı.</p>
            </div>
          ) : (
            <>
              <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {results.totalSearched} vaka içinden {results.results.length} eşleşme bulundu.
              </p>
              {results.results.map((c) => (
                <div key={c.id} style={s.resultCard}>
                  <div style={s.resultHeader} onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={s.scoreTag}>{c.score} eşleşme</span>
                        <strong style={{ fontSize: '1rem' }}>
                          {c.animal_type === 'kedi' ? '🐱' : c.animal_type === 'kopek' ? '🐶' : '🐾'} {c.breed || 'Melez'}
                          {c.age_value ? ` · ${c.age_value} ${c.age_unit}` : ''}
                        </strong>
                      </div>
                      <div style={s.diagnosis}>{c.diagnosis}</div>
                    </div>
                    <span style={{ color: '#a0aec0', fontSize: '1.2rem' }}>{expanded === c.id ? '▲' : '▼'}</span>
                  </div>

                  {expanded === c.id && (
                    <div style={s.resultBody}>
                      <button style={s.detailBtn} onClick={() => navigate(`/vaka/${c.id}`)}>
                        Vakayı Aç →
                      </button>
                      {c.symptoms?.length > 0 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <strong style={s.sectionLabel}>Semptomlar</strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                            {c.symptoms.map(sym => (
                              <span key={sym} style={s.sympTag}>{sym}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {c.summary && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <strong style={s.sectionLabel}>Özet</strong>
                          <p style={{ margin: '0.4rem 0 0', color: '#4a5568', fontSize: '0.9rem' }}>{c.summary}</p>
                        </div>
                      )}
                      {c.lab_values?.length > 0 && (
                        <div>
                          <strong style={s.sectionLabel}>Lab Değerleri</strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                            {c.lab_values.map((lv, i) => (
                              <span key={i} style={{ ...s.labTag, background: lv.status === 'yuksek' ? '#fed7d7' : lv.status === 'dusuk' ? '#bee3f8' : '#e2e8f0' }}>
                                {lv.name}: {lv.value} {lv.unit} ({lv.status})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {c.raw_text && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <strong style={s.sectionLabel}>Ham Metin</strong>
                          <p style={{ margin: '0.4rem 0 0', color: '#718096', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{c.raw_text}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(160deg, #0f2d3a 0%, #0d2035 50%, #0a1628 100%)', fontFamily: 'sans-serif', padding: '2rem 1rem' },
  header: { textAlign: 'center', marginBottom: '2rem' },
  backBtn: { background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '0.95rem', marginBottom: '0.5rem' },
  title: { fontSize: '2rem', color: '#1a202c', margin: '0 0 0.25rem' },
  sub: { color: '#718096', margin: 0 },
  card: { maxWidth: 700, margin: '0 auto', background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },

  stepBar: { display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flex: 1 },
  stepDot: { width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#718096' },
  stepActive: { background: '#4f46e5', color: 'white' },
  stepDone: { background: '#48bb78', color: 'white' },
  stepLabel: { fontSize: '0.7rem', color: '#a0aec0', textAlign: 'center' },
  stepTitle: { fontSize: '1.3rem', color: '#1a202c', marginBottom: '1.5rem' },
  stepContent: { minHeight: 200 },

  field: { marginBottom: '1.25rem' },
  fieldRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' },
  radioRow: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  pill: { padding: '0.35rem 0.85rem', borderRadius: '2rem', border: '2px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.85rem', color: '#4a5568', transition: 'all 0.15s' },
  pillActive: { background: '#4f46e5', color: 'white', borderColor: '#4f46e5' },
  input: { padding: '0.4rem 0.75rem', border: '2px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '1rem', width: 100, outline: 'none' },
  checkGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' },

  navRow: { display: 'flex', marginTop: '2rem', gap: '1rem' },
  btnPrimary: { padding: '0.6rem 1.5rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  btnSecondary: { padding: '0.6rem 1.25rem', background: 'white', color: '#4f46e5', border: '2px solid #4f46e5', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' },
  btnSearch: { padding: '0.75rem 2rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 },

  sympBox: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem', alignItems: 'center' },
  sympTag: { background: '#ebf4ff', color: '#2b6cb0', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem' },
  labTag: { padding: '0.2rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.8rem', color: '#2d3748' },
  noResult: { textAlign: 'center', padding: '3rem', color: '#4a5568' },
  resultCard: { border: '1px solid #e2e8f0', borderRadius: '0.75rem', marginBottom: '0.75rem', overflow: 'hidden' },
  resultHeader: { padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: '#fafafa' },
  resultBody: { padding: '1rem', borderTop: '1px solid #e2e8f0' },
  scoreTag: { background: '#f0fff4', color: '#276749', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #c6f6d5' },
  diagnosis: { color: '#4a5568', fontSize: '0.9rem', marginTop: '0.25rem' },
  sectionLabel: { fontSize: '0.8rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' },
  detailBtn: { marginBottom: '0.75rem', padding: '0.45rem 1.2rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 },
}
