import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || ''

const getHash = (str) => [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0)

const getImage = (animalType, breed) => {
  const hash = getHash(breed)
  if (animalType === 'kedi') return `https://cataas.com/cat?seed=${hash}&width=300&height=180`
  if (animalType === 'kopek') return `https://placedog.net/300/180?id=${(hash % 50) + 1}`
  // Egzotik için picsum (doğa/hayvan temalı)
  const exoticSeeds = ['gecko','parrot','turtle','rabbit','hamster','iguana','chameleon','ferret','hedgehog','bird']
  return `https://source.unsplash.com/300x180/?${exoticSeeds[hash % exoticSeeds.length]}`
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
        </div>
      )}

      <div style={styles.grid}>
        {breeds.map(breed => (
          <div
            key={breed}
            style={styles.card}
            onClick={() => navigate(`/${animalType}/${encodeURIComponent(breed)}`)}
          >
            <div style={styles.imgWrapper}>
              <img
                src={getImage(animalType, breed)}
                alt={breed}
                style={styles.img}
                onError={e => { e.target.style.display = 'none' }}
              />
            </div>
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    background: 'white',
    borderRadius: '0.875rem',
    overflow: 'hidden',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  imgWrapper: {
    width: '100%',
    height: '160px',
    overflow: 'hidden',
    background: '#f0f4f8',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  breedName: { margin: 0, color: '#2d3748', fontSize: '1rem', padding: '0.9rem 0.75rem' },
  empty: { textAlign: 'center', color: '#718096', marginTop: '4rem' },
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
