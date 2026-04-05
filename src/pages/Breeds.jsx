import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || ''

const getHash = (str) => [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0)

const getImage = (animalType, breed) => {
  const h = getHash(breed)
  if (animalType === 'kedi') return `https://cataas.com/cat?seed=${(h % 100) + 1}&width=400&height=260`
  if (animalType === 'kopek') return `https://placedog.net/400/260?id=${(h % 50) + 1}`
  const seeds = ['gecko','parrot','rabbit','iguana','chameleon','hedgehog','hamster','turtle','bird','ferret']
  return `https://loremflickr.com/400/260/${seeds[h % seeds.length]},cute?random=${h % 30}`
}

const cleanBreed = (name) => {
  if (!name) return name
  // Uzun parantez içerikleri temizle
  let cleaned = name
    .replace(/\s*\(lenfosarkom.*?\)/gi, '')
    .replace(/\s*\(melez olarak değerlendirildi\)/gi, '')
    .replace(/\s*\(melez olası\)/gi, '')
    .replace(/\s*\(çeşitli ırklar.*?\)/gi, '')
    .replace(/\s*\(safkan.*?\)/gi, '')
    .replace(/\s*\(derleme.*?\)/gi, '')
    .replace(/kanis\b/gi, 'Kaniş')
    .trim()
  // Çok uzunsa kırp
  if (cleaned.length > 28) cleaned = cleaned.substring(0, 26) + '…'
  return cleaned
}

export default function Breeds() {
  const { animalType } = useParams()
  const navigate = useNavigate()
  const [breeds, setBreeds] = useState([])
  const [loading, setLoading] = useState(true)

  const label = animalType === 'kedi' ? '🐱 Kedi' : animalType === 'kus' ? '🦎 Egzotik' : '🐶 Köpek'

  useEffect(() => {
    axios.get(`${API}/api/cases/breeds/${animalType}`)
      .then(r => setBreeds(r.data))
      .catch(() => setBreeds([]))
      .finally(() => setLoading(false))
  }, [animalType])

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate('/')}>← Geri</button>
      <h1 style={styles.title}>{label} Cinsleri</h1>

      <button style={styles.allCasesBtn} onClick={() => navigate(`/${animalType}/tum-vakalar`)}>
        Tüm {label} Vakalarını Gör →
      </button>

      <p style={{ fontSize: '0.8rem', color: '#a0aec0', marginBottom: '1rem', fontStyle: 'italic' }}>
        * Görseller yalnızca temsilidir; fotoğraflardaki hayvanlar epikrizlerdeki hastalarla eşleşmemektedir.
      </p>

      {loading && <p style={{ color: '#718096' }}>Yükleniyor...</p>}
      {!loading && breeds.length === 0 && <div style={styles.empty}><p>Henüz bu türe ait vaka bulunmuyor.</p></div>}

      <div style={styles.grid}>
        {breeds.map(breed => (
          <div
            key={breed}
            style={styles.card}
            onClick={() => navigate(`/${animalType}/${encodeURIComponent(breed)}`)}
          >
            <img
              src={getImage(animalType, breed)}
              alt={breed}
              style={styles.img}
              onError={e => { e.target.src = `https://picsum.photos/seed/${getHash(breed)}/400/260` }}
            />
            <div style={styles.overlay}>
              <span style={styles.breedName}>{cleanBreed(breed)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(160deg, #2d1b4e 0%, #1a1a3e 50%, #0f172a 100%)', padding: '2rem', fontFamily: 'sans-serif' },
  back: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#94a3b8', marginBottom: '1rem', padding: 0 },
  title: { fontSize: '1.8rem', color: 'white', marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  card: {
    borderRadius: '0.875rem',
    overflow: 'hidden',
    cursor: 'pointer',
    position: 'relative',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    aspectRatio: '4/3',
    background: '#e2e8f0',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.72))',
    padding: '1.5rem 0.75rem 0.7rem',
  },
  breedName: { color: 'white', fontWeight: 700, fontSize: '0.95rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' },
  empty: { textAlign: 'center', color: '#718096', marginTop: '4rem' },
  allCasesBtn: {
    display: 'inline-block', marginBottom: '1.5rem', padding: '0.65rem 1.6rem',
    background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.6rem',
    cursor: 'pointer', fontSize: '1rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
  }
}
