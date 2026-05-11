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

// ── shimmer 애니메이션 ────────────────────────────────────────────────
const shimmerStyle = `
  @keyframes shimmer {
    0%   { background-position: -600px 0 }
    100% { background-position:  600px 0 }
  }
  .skeleton {
    background: linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
  }
  .skeleton-dark {
    background: linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
  }
`

// ── 스켈레톤 블록 ────────────────────────────────────────────────────
function SkeletonBlock({
  className = 'skeleton',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return <div className={className} style={{ borderRadius: 0, ...style }} />
}

// ── 디테일 페이지 스켈레톤 ───────────────────────────────────────────
function DetailPageSkeleton() {
  return (
    <div style={{ fontFamily: "'Space Mono', monospace", background: '#fdfdfd', minHeight: '100vh' }}>

      {/* 히어로 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:h-[420px]">

        {/* 이미지 영역 */}
        <SkeletonBlock className="skeleton-dark" style={{ height: '260px' }} />

        {/* 텍스트 패널 */}
        <div className="bg-[#111] flex flex-col justify-end p-6 sm:p-8 md:p-10 gap-3">
          {/* 등급 배지 */}
          <SkeletonBlock className="skeleton-dark" style={{ width: '80px', height: '18px' }} />
          {/* 제목 2줄 */}
          <SkeletonBlock className="skeleton-dark" style={{ width: '70%', height: '36px' }} />
          <SkeletonBlock className="skeleton-dark" style={{ width: '45%', height: '36px' }} />
          {/* 지역 */}
          <SkeletonBlock className="skeleton-dark" style={{ width: '120px', height: '12px', marginTop: '4px' }} />
          {/* 뒤로가기 */}
          <SkeletonBlock className="skeleton-dark" style={{ width: '100px', height: '10px', marginTop: 'auto' }} />
        </div>
      </div>

      {/* 본문 스켈레톤 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 px-4 sm:px-8 lg:px-[5vw] py-8 lg:py-12">

        {/* 메인 컬럼 */}
        <div>
          {/* RESTAURANT INFO */}
          <div className="mb-8 pb-8 border-b border-[#eee]">
            <SkeletonBlock style={{ width: '120px', height: '10px', marginBottom: '16px' }} />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-[10px] border-b border-[#eee]">
                <SkeletonBlock style={{ width: '60px', height: '10px' }} />
                <SkeletonBlock style={{ width: `${80 + (i % 3) * 40}px`, height: '10px' }} />
              </div>
            ))}
          </div>

          {/* LOCATION */}
          <div className="mb-8 pb-8 border-b border-[#eee]">
            <SkeletonBlock style={{ width: '80px', height: '10px', marginBottom: '16px' }} />
            <SkeletonBlock style={{ height: '200px' }} />
          </div>

          {/* REVIEWS */}
          <div>
            <SkeletonBlock style={{ width: '70px', height: '10px', marginBottom: '16px' }} />
            <SkeletonBlock style={{ height: '120px' }} />
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-3">
          <div className="border border-[#eee] p-5">
            <SkeletonBlock style={{ width: '100px', height: '10px', marginBottom: '16px' }} />
            <SkeletonBlock style={{ height: '36px', marginBottom: '16px' }} />
            <SkeletonBlock style={{ width: '80px', height: '10px', margin: '0 auto' }} />
          </div>
          <div className="border border-[#eee] p-5">
            <SkeletonBlock style={{ width: '100px', height: '10px', marginBottom: '16px' }} />
            <SkeletonBlock style={{ width: '120px', height: '10px', marginBottom: '8px' }} />
            <SkeletonBlock style={{ width: '120px', height: '10px' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────

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

  // ── 로딩: 스켈레톤 ──────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{shimmerStyle}</style>
        <DetailPageSkeleton />
      </>
    )
  }

  // ── 데이터 없음 ─────────────────────────────────────────────────────
  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
        <p
          className="text-[11px] tracking-[3px] text-[#aaa]"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          RESTAURANT NOT FOUND
        </p>
      </div>
    )
  }

  const infoRows = [
    { label: 'GRADE',      value: gradeLabel(restaurant.grade), color: 'text-[#e62117]' },
    { label: 'ADDRESS',    value: restaurant.address || '-',    color: 'text-[#111]' },
    { label: 'PHONE',      value: restaurant.phone || '-',      color: 'text-[#111]' },
    { label: 'REGION',     value: `${restaurant.district} · ${restaurant.city}`, color: 'text-[#111]' },
    { label: 'GREEN STAR', value: restaurant.isGreenStar === 'Y' ? '🌿 YES' : '-', color: 'text-[#111]' },
    { label: 'VIEWS',      value: String(restaurant.viewCount), color: 'text-[#111]' },
  ]

  return (
    <div
      className="bg-[#fdfdfd] min-h-screen"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {/* ── 히어로 ──────────────────────────────────────────────────────
          모바일  : 이미지 위 / 텍스트 아래 세로 스택
          md 이상 : 좌우 반반 그리드
      ─────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:h-[420px]">

        {/* 이미지 */}
        <div className="relative overflow-hidden bg-[#1a1a1a] h-[260px] md:h-auto">
          <img
            src={restaurant.mainImageUrl || FALLBACK_IMAGE}
            alt={restaurant.restaurantName}
            onError={e => { e.currentTarget.src = FALLBACK_IMAGE }}
            className="w-full h-full object-cover opacity-70 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/30 hidden md:block" />
        </div>

        {/* 텍스트 패널 */}
        <div className="bg-[#111] flex flex-col justify-end p-6 sm:p-8 md:p-10">
          <div className="inline-block border border-[#e62117] text-[#e62117] text-[8px] tracking-[1.5px] px-3 py-[2px] mb-3 self-start">
            {gradeLabel(restaurant.grade)}
          </div>
          <h1
            className="text-white text-2xl sm:text-3xl md:text-[2.5rem] font-medium leading-tight mb-3"
            style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-1px' }}
          >
            {restaurant.restaurantName}
          </h1>
          <p className="text-[9px] tracking-[3px] text-white/40 mb-6">
            {restaurant.district} · {restaurant.city}
          </p>
          {restaurant.isGreenStar === 'Y' && (
            <p className="text-[9px] tracking-[2px] text-[#4caf50] mb-4">
              🌿 MICHELIN GREEN STAR
            </p>
          )}
          <button
            onClick={() => navigate('/restaurants')}
            className="text-[9px] tracking-[2px] text-white/30 hover:text-white/60 transition-colors mt-auto text-left cursor-pointer bg-transparent border-none"
          >
            ← BACK TO LIST
          </button>
        </div>
      </div>

      {/* ── 본문 ────────────────────────────────────────────────────────
          모바일  : 단일 컬럼 (사이드바가 메인 아래로)
          lg 이상 : 좌(메인) + 우(사이드바 360px) 2컬럼
      ─────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 px-4 sm:px-8 lg:px-[5vw] py-8 lg:py-12">

        {/* 메인 컬럼 */}
        <div>
          <section className="mb-8 pb-8 border-b border-[#eee]">
            <p className="text-[9px] tracking-[3px] text-[#aaa] mb-4">RESTAURANT INFO</p>
            {infoRows.map((row, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-[11px] py-[10px] border-b border-[#eee] gap-4"
              >
                <span className="text-[#aaa] tracking-[1px] shrink-0">{row.label}</span>
                <span className={`${row.color} tracking-[1px] text-right break-all`}>{row.value}</span>
              </div>
            ))}
          </section>

          <section className="mb-8 pb-8 border-b border-[#eee]">
            <p className="text-[9px] tracking-[3px] text-[#aaa] mb-4">LOCATION</p>
            <div className="bg-[#f5f5f5] h-[200px] sm:h-[240px] flex items-center justify-center border border-[#eee]">
              <span className="text-[10px] tracking-[2px] text-[#bbb]">P4 지도 연동 예정</span>
            </div>
          </section>

          <section>
            <p className="text-[9px] tracking-[3px] text-[#aaa] mb-4">REVIEWS</p>
            <div className="bg-[#f5f5f5] p-8 text-center">
              <span className="text-[10px] tracking-[2px] text-[#bbb]">P3 리뷰 연동 예정</span>
            </div>
          </section>
        </div>

        {/* 사이드바 */}
        <div className="space-y-3">
          <div className="border border-[#eee] p-5">
            <p className="text-[9px] tracking-[3px] text-[#aaa] mb-4">QUICK ACTION</p>
            {restaurant.kakaoPlaceUrl && (
              <button
                onClick={openKakaoMap}
                className="block w-full py-[10px] bg-[#FEE500] text-[#111] text-[10px] tracking-[2px] text-center border-none cursor-pointer hover:brightness-95 transition-all mb-2"
              >
                카카오맵에서 보기
              </button>
            )}
            <p className="text-[9px] tracking-[1px] text-[#aaa] text-center mt-4">
              VIEWS · {restaurant.viewCount}
            </p>
          </div>

          <div className="border border-[#eee] p-5">
            <p className="text-[9px] tracking-[3px] text-[#aaa] mb-4">COORDINATES</p>
            <div className="text-[10px] text-[#aaa] tracking-[1px] leading-loose">
              <p>LAT · {restaurant.lat}</p>
              <p>LNG · {restaurant.lng}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestaurantDetailPage