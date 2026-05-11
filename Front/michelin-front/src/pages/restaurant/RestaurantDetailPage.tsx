import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRestaurantDetail } from '../../service/restaurantApi'

interface Restaurant {
  id: number
  restaurantName: string
  grade: string
  city: string
  district: string
  address: string
  phone: string
  isGreenStar: string
  viewCount: number
  mainImageUrl: string | null
  lat: number
  lng: number
  kakaoPlaceUrl: string
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'

const gradeLabel = (grade: string) => {
  if (grade === '1스타') return '★ 1 STAR'
  if (grade === '빕 구르망') return 'BIB GOURMAND'
  return 'SELECTED'
}

function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    try {
      setLoading(true)
      const res = await getRestaurantDetail(Number(id))
      setRestaurant(res.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openKakaoMap = () => {
    if (restaurant?.kakaoPlaceUrl) {
      window.open(restaurant.kakaoPlaceUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem', fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '3px', color: '#aaa' }}>
        LOADING...
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem', fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '3px', color: '#aaa' }}>
        RESTAURANT NOT FOUND
      </div>
    )
  }

  const infoRows = [
    { label: 'GRADE', value: gradeLabel(restaurant.grade), color: '#e62117' },
    { label: 'ADDRESS', value: restaurant.address || '-' },
    { label: 'PHONE', value: restaurant.phone || '-' },
    { label: 'REGION', value: restaurant.district + ' · ' + restaurant.city },
    { label: 'GREEN STAR', value: restaurant.isGreenStar === 'Y' ? '🌿 YES' : '-' },
    { label: 'VIEWS', value: String(restaurant.viewCount) },
  ]

  return (
    <div style={{ fontFamily: "'Space Mono', monospace", background: '#fdfdfd', minHeight: '100vh' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '420px' }}>

        <div style={{ position: 'relative', overflow: 'hidden', background: '#1a1a1a' }}>
          <img
            src={restaurant.mainImageUrl || FALLBACK_IMAGE}
            alt={restaurant.restaurantName}
            onError={e => { e.currentTarget.src = FALLBACK_IMAGE }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, filter: 'grayscale(1)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.3))' }} />
        </div>

        <div style={{ background: '#111', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px' }}>
          <div style={{ fontSize: '8px', letterSpacing: '1.5px', border: '1px solid #e62117', color: '#e62117', padding: '2px 10px', display: 'inline-block', marginBottom: '12px', width: 'fit-content' }}>
            {gradeLabel(restaurant.grade)}
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 500, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '12px' }}>
            {restaurant.restaurantName}
          </div>
          <div style={{ fontSize: '9px', letterSpacing: '3px', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>
            {restaurant.district} · {restaurant.city}
          </div>
          {restaurant.isGreenStar === 'Y' && (
            <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#4caf50', marginBottom: '1rem' }}>
              🌿 MICHELIN GREEN STAR
            </div>
          )}
          <div
            onClick={() => navigate('/restaurants')}
            style={{ fontSize: '9px', letterSpacing: '2px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', marginTop: 'auto' }}
          >
            ← BACK TO LIST
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', padding: '3rem 5vw' }}>

        <div>
          <div style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '0.5px solid #eee' }}>
            <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#aaa', marginBottom: '1rem' }}>
              RESTAURANT INFO
            </div>
            {infoRows.map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', padding: '10px 0', borderBottom: '0.5px solid #eee' }}>
                <span style={{ color: '#aaa', letterSpacing: '1px' }}>{row.label}</span>
                <span style={{ color: row.color || '#111', letterSpacing: '1px' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '0.5px solid #eee' }}>
            <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#aaa', marginBottom: '1rem' }}>
              LOCATION
            </div>
            <div style={{ background: '#f5f5f5', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.5px solid #eee' }}>
              <span style={{ fontSize: '10px', letterSpacing: '2px', color: '#bbb' }}>P4 지도 연동 예정</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#aaa', marginBottom: '1rem' }}>
              REVIEWS
            </div>
            <div style={{ background: '#f5f5f5', padding: '2rem', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', letterSpacing: '2px', color: '#bbb' }}>P3 리뷰 연동 예정</span>
            </div>
          </div>
        </div>

        <div>
          <div style={{ border: '0.5px solid #eee', padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#aaa', marginBottom: '1rem' }}>
              QUICK ACTION
            </div>
            {restaurant.kakaoPlaceUrl && (
              <button
                onClick={openKakaoMap}
                style={{ display: 'block', width: '100%', padding: '10px', background: '#FEE500', color: '#111', fontSize: '10px', letterSpacing: '2px', textAlign: 'center', border: 'none', cursor: 'pointer', marginBottom: '8px' }}
              >
                카카오맵에서 보기
              </button>
            )}
            <div style={{ fontSize: '9px', letterSpacing: '1px', color: '#aaa', textAlign: 'center', marginTop: '1rem' }}>
              VIEWS · {restaurant.viewCount}
            </div>
          </div>

          <div style={{ border: '0.5px solid #eee', padding: '1.5rem' }}>
            <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#aaa', marginBottom: '1rem' }}>
              COORDINATES
            </div>
            <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '1px', lineHeight: 2 }}>
              <div>LAT · {restaurant.lat}</div>
              <div>LNG · {restaurant.lng}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default RestaurantDetailPage