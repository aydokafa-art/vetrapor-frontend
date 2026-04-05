import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

export default function Breeds() {
  const { animalType } = useParams()
  const navigate = useNavigate()
  const [breeds, setBreeds] = useState([])
  const [loading, setLoading] = useState(true)

  const label = animalType === 'kedi' ? '🐱 Kedi' : animalType === 'kus' ? '🦎 Egzotik' : '🐶 Köpek'
  const emoji = animalType === 'kedi' ? '🐱' : animalType === 'kus' ? '🦎' : '🐶'

  useEffect(() => {
    axios.get(`/api/cases/breeds/${animalType}`)
      .then(r => setBreeds(r.data))
      .catch(() => setBreeds([]))
      .finally(() => setLoading(false))
  }, [animalType])

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate('/')}>← Geri</button>
      <h1 style={styles.title}>{label} Cinsleri</h1>

      <button
        style={styles.allCasesBtn}
        onClick={() => navigate(`/${animalType}/tum-vakalar`)}
      >
        Tüm {label} Vakalarını Gör →
      </button>

      {loading && <p>Yükleniyor...</p>}

      {!loading && breeds.length === 0 && (
        <div style={styles.empty}>
          <p>Henüz bu türe ait vaka bulunmuyor.</p>
          <button style={styles.adminBtn} onClick={() => navigate('/admin')}>
            Rapor Ekle
          </button>
        </div>
      )}

      <div style={styles.grid}>
        {breeds.map(breed => (
          <div
            key={breed}
            style={styles.card}
            onClick={() => navigate(`/${animalType}/${encodeURIComponent(breed)}`)}
          >
            <span style={styles.icon}>{emoji}</span>
            <h3 style={styles.breedName}>{breed}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f0f4f8',
    padding: '2rem',
    fontFamily: 'sans-serif',
  },
  back: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#4a5568',
    marginBottom: '1rem',
    padding: 0,
  },
  title: {
    fontSize: '1.8rem',
    color: '#1a202c',
    marginBottom: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s',
  },
  icon: { fontSize: '2rem', display: 'block', marginBottom: '0.5rem' },
  breedName: { margin: 0, color: '#2d3748', fontSize: '1rem' },
  empty: { textAlign: 'center', color: '#718096', marginTop: '4rem' },
  adminBtn: {
    marginTop: '1rem',
    padding: '0.6rem 1.5rem',
    background: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  allCasesBtn: {
    display: 'inline-block',
    marginBottom: '1.5rem',
    padding: '0.65rem 1.6rem',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '0.6rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
  }
}
