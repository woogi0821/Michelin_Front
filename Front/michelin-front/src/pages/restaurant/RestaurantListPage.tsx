import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRestaurantList } from '../../service/restaurantApi'

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

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1582450871972-ed5ca60b6f3d?w=600',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600',
  'https://images.unsplash.com/photo-1569058242252-62324e68884c?w=600',
  'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600',
  'https://images.unsplash.com/photo-1547928576-a4a33237ce35?w=600',
  'https://images.unsplash.com/photo-1529692236671-f1f6e9482172?w=600',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600',
]

const gradeLabel = (grade: string) => {
  if (grade === '1스타') return '★ 1 STAR'
  if (grade === '빕 구르망') return 'BIB GOURMAND'
  return 'SELECTED'
}

const getImage = (restaurant: Restaurant, index: number) => {
  return restaurant.mainImageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
}

const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
  e.currentTarget.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
}

const imgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  opacity: 0.7,
  filter: 'grayscale(1)',
  display: 'block',
  transition: '0.3s'
}

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)'
}

const gradeTagStyle: React.CSSProperties = {
  fontSize: '8px',
  letterSpacing: '1.5px',
  border: '1px solid #e62117',
  color: '#e62117',
  padding: '2px 8px',
  display: 'inline-block',
  marginBottom: '6px'
}

function RestaurantListPage() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({
    grade: '',
    city: '',
    isGreenStar: '',
  })

  const SIZE = 12

  useEffect(() => {
    fetchList()
  }, [page, filters])

  const fetchList = async () => {
    try {
      setLoading(true)
      const params: any = { page, size: SIZE }
      if (filters.grade) params.grade = filters.grade
      if (filters.city) params.city = filters.city
      if (filters.isGreenStar) params.isGreenStar = filters.isGreenStar
      const res = await getRestaurantList(params)
      setRestaurants(res.data.data.content)
      setTotalCount(res.data.data.totalElements)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key as keyof typeof prev] === value ? '' : value
    }))
    setPage(0)
  }

  const totalPages = Math.ceil(totalCount / SIZE)
  const featured = restaurants.slice(0, 3)
  const rest = restaurants.slice(3)

  return (
    <div style={{ fontFamily: "'Space Mono', monospace", background: '#fdfdfd', minHeight: '100vh', padding: '2rem 5vw' }}>

      {/* 페이지 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', borderBottom: '2px solid #111', paddingBottom: '12px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-1px', color: '#111' }}>
          THE <span style={{ color: '#e62117' }}>PLATE</span>.
        </div>
        <div style={{ fontSize: '10px', letterSpacing: '3px', color: '#aaa' }}>
          BUSAN 2026 · {totalCount} RESTAURANTS
        </div>
      </div>

      {/* 필터바 */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: '#aaa', letterSpacing: '2px', marginRight: '4px' }}>GRADE</span>
        {['', '1스타', '빕 구르망', '선정 레스토랑'].map((g, i) => (
          <button
            key={i}
            onClick={() => handleFilter('grade', g)}
            style={{
              fontSize: '10px', padding: '4px 12px',
              border: `0.5px solid ${filters.grade === g ? '#111' : '#ddd'}`,
              background: filters.grade === g ? '#111' : 'transparent',
              color: filters.grade === g ? '#fff' : '#888',
              cursor: 'pointer', letterSpacing: '1px'
            }}
          >
            {g === '' ? 'ALL' : gradeLabel(g)}
          </button>
        ))}
        <div style={{ width: '1px', height: '14px', background: '#ddd', margin: '0 4px' }} />
        <span style={{ fontSize: '10px', color: '#aaa', letterSpacing: '2px', marginRight: '4px' }}>REGION</span>
        {['', '부산', '서울'].map((c, i) => (
          <button
            key={i}
            onClick={() => handleFilter('city', c)}
            style={{
              fontSize: '10px', padding: '4px 12px',
              border: `0.5px solid ${filters.city === c ? '#111' : '#ddd'}`,
              background: filters.city === c ? '#111' : 'transparent',
              color: filters.city === c ? '#fff' : '#888',
              cursor: 'pointer', letterSpacing: '1px'
            }}
          >
            {c === '' ? '전체' : c}
          </button>
        ))}
        <div style={{ width: '1px', height: '14px', background: '#ddd', margin: '0 4px' }} />
        <button
          onClick={() => handleFilter('isGreenStar', 'Y')}
          style={{
            fontSize: '10px', padding: '4px 12px',
            border: `0.5px solid ${filters.isGreenStar === 'Y' ? '#2d7a2d' : '#ddd'}`,
            background: filters.isGreenStar === 'Y' ? '#2d7a2d' : 'transparent',
            color: filters.isGreenStar === 'Y' ? '#fff' : '#888',
            cursor: 'pointer', letterSpacing: '1px'
          }}
        >
          🌿 GREEN STAR
        </button>
        <span style={{ fontSize: '10px', color: '#aaa', letterSpacing: '1px', marginLeft: 'auto' }}>
          {totalCount} RESULTS
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa', letterSpacing: '3px', fontSize: '11px' }}>
          LOADING...
        </div>
      ) : (
        <>
          {/* 매거진 상단 그리드 */}
          {featured.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', marginBottom: '3px' }}>
              {/* 메인 큰 이미지 */}
              <div
                onClick={() => navigate(`/restaurants/${featured[0].id}`)}
                style={{ position: 'relative', height: '320px', overflow: 'hidden', background: '#1a1a1a', cursor: 'pointer' }}
              >
                <img
                  src={getImage(featured[0], 0)}
                  alt={featured[0].restaurantName}
                  style={imgStyle}
                  onError={e => handleImgError(e, 0)}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0)'; e.currentTarget.style.opacity = '0.9' }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(1)'; e.currentTarget.style.opacity = '0.7' }}
                />
                <div style={overlayStyle} />
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: '#fff' }}>
                  <div style={gradeTagStyle}>{gradeLabel(featured[0].grade)}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 500 }}>{featured[0].restaurantName}</div>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>{featured[0].district}</div>
                </div>
              </div>

              {/* 우측 작은 이미지 2개 */}
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '3px', height: '320px' }}>
                {featured.slice(1, 3).map((r, i) => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/restaurants/${r.id}`)}
                    style={{ position: 'relative', overflow: 'hidden', background: '#1a1a1a', cursor: 'pointer' }}
                  >
                    <img
                      src={getImage(r, i + 1)}
                      alt={r.restaurantName}
                      style={imgStyle}
                      onError={e => handleImgError(e, i + 1)}
                      onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0)'; e.currentTarget.style.opacity = '0.9' }}
                      onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(1)'; e.currentTarget.style.opacity = '0.7' }}
                    />
                    <div style={overlayStyle} />
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', color: '#fff' }}>
                      <div style={{ ...gradeTagStyle, fontSize: '8px', padding: '2px 7px' }}>{gradeLabel(r.grade)}</div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '13px', fontWeight: 500 }}>{r.restaurantName}</div>
                      <div style={{ fontSize: '9px', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{r.district}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4열 카드 그리드 */}
          {rest.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px', marginBottom: '3px' }}>
              {rest.map((r, i) => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/restaurants/${r.id}`)}
                  style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', background: '#1a1a1a', height: '200px' }}
                >
                  <img
                    src={getImage(r, i + 3)}
                    alt={r.restaurantName}
                    style={imgStyle}
                    onError={e => handleImgError(e, i + 3)}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0)'; e.currentTarget.style.opacity = '0.9' }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(1)'; e.currentTarget.style.opacity = '0.7' }}
                  />
                  <div style={{ ...overlayStyle, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', color: '#fff' }}>
                    <div style={{ ...gradeTagStyle, fontSize: '8px', padding: '2px 7px', marginBottom: '4px' }}>{gradeLabel(r.grade)}</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '12px', fontWeight: 500 }}>{r.restaurantName}</div>
                    <div style={{ fontSize: '9px', letterSpacing: '1px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{r.district}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', marginTop: '3rem' }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ width: '28px', height: '28px', border: '0.5px solid #ddd', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '12px' }}
            >‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i).map(i => (
              <button
                key={i}
                onClick={() => setPage(i)}
                style={{
                  width: '28px', height: '28px',
                  border: `0.5px solid ${page === i ? '#111' : '#ddd'}`,
                  background: page === i ? '#111' : 'transparent',
                  color: page === i ? '#fff' : '#888',
                  cursor: 'pointer', fontSize: '11px'
                }}
              >{i + 1}</button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              style={{ width: '28px', height: '28px', border: '0.5px solid #ddd', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '12px' }}
            >›</button>
          </div>
        </>
      )}
    </div>
  )
}

export default RestaurantListPage