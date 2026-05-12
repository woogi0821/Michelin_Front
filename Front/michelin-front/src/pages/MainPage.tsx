import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { getRestaurantList } from '../service/restaurantApi'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1582450871972-ed5ca60b6f3d?w=800',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800',
  'https://images.unsplash.com/photo-1569058242252-62324e68884c?w=800',
  'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
  'https://images.unsplash.com/photo-1547928576-a4a33237ce35?w=800',
  'https://images.unsplash.com/photo-1529692236671-f1f6e9482172?w=800',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
]

interface Restaurant {
  id: number
  restaurantName: string
  grade: string
  district: string
  mainImageUrl: string | null
}

const gradeLabel = (grade: string) => {
  if (grade === '1스타') return '★ 1 STAR'
  if (grade === '빕 구르망') return 'BIB GOURMAND'
  return 'SELECTED'
}

function MainPage() {
  const { introUnlocked, setIntroUnlocked } = useAuthStore()
  const [step, setStep] = useState<'intro' | 'unlocking' | 'unlocked'>(
    () => introUnlocked ? 'unlocked' : 'intro'
  )
  const [featured, setFeatured] = useState<Restaurant[]>([])
  const navigate = useNavigate()
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleUnlock = () => {
    setStep('unlocking')
    setTimeout(() => {
      setStep('unlocked')
      setIntroUnlocked()
    }, 1500)
  }

  useEffect(() => {
    if (step !== 'unlocked') return
    const fetchFeatured = async () => {
      try {
        const res = await getRestaurantList({ page: 0, size: 8 })
        setFeatured(res.data.data.content)
      } catch (e) {
        console.error(e)
      }
    }
    fetchFeatured()
  }, [step])

  useEffect(() => {
    if (step !== 'unlocked' || featured.length === 0) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    cardRefs.current.forEach(ref => {
      if (ref) observer.observe(ref)
    })
    return () => observer.disconnect()
  }, [step, featured])

  const getImage = (restaurant: Restaurant, index: number) => {
    return restaurant.mainImageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  }

  return (
    <>
      {/* ── 인트로 오버레이 ───────────────────────────────────────────── */}
      {step !== 'unlocked' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className={`absolute top-0 left-0 w-1/2 h-full bg-[#111]
                        transition-transform duration-[1200ms] ease-in-out
                        ${step === 'unlocking' ? '-translate-x-full' : ''}`}
          />
          <div
            className={`absolute top-0 right-0 w-1/2 h-full bg-[#111]
                        transition-transform duration-[1200ms] ease-in-out
                        ${step === 'unlocking' ? 'translate-x-full' : ''}`}
          />
          <div
            className={`relative z-[60] flex flex-col items-center text-white px-6 text-center
                        transition-opacity duration-500
                        ${step === 'unlocking' ? 'opacity-0' : 'opacity-100'}`}
          >
            <p
              style={{ fontFamily: "'Space Mono', monospace" }}
              className="tracking-[6px] sm:tracking-[10px] text-xs mb-4 uppercase"
            >
              TOP SECRET
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 900,
                fontSize: 'clamp(2.5rem, 10vw, 6rem)',
                color: '#e62117',
                letterSpacing: '-2px',
                margin: 0,
                lineHeight: 1
              }}
            >
              MICHELIN 2026
            </h2>
            <button
              onClick={handleUnlock}
              style={{ fontFamily: "'Space Mono', monospace" }}
              className="mt-10 border border-white text-white bg-transparent
                         px-8 sm:px-12 py-4 text-xs tracking-[4px] sm:tracking-[6px] uppercase
                         hover:bg-white hover:text-black transition-all duration-300
                         cursor-pointer w-full sm:w-auto"
            >
              DECODE & OPEN
            </button>
          </div>
        </div>
      )}

      {/* ── 메인 콘텐츠 ──────────────────────────────────────────────── */}
      {step === 'unlocked' && (
        <>
          {/* ── 히어로 헤더 ────────────────────────────────────────────
              모바일  : 텍스트 → 이미지 세로 스택
              lg 이상 : 텍스트(좌) + 이미지(우) 2컬럼
          ─────────────────────────────────────────────────────────── */}
          <header className="px-[5vw] pt-[60px] pb-[60px]">
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-end">

              {/* 텍스트 */}
              <div className="flex flex-col justify-end lg:h-[60vh]">
                <h1
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 900,
                    fontSize: 'clamp(3.5rem, 15vw, 9.5rem)',
                    lineHeight: 0.85,
                    letterSpacing: '-4px',
                    margin: 0,
                    color: '#111'
                  }}
                >
                  THE<br />PLATE
                </h1>
                <p
                  style={{ fontFamily: "'Space Mono', monospace" }}
                  className="tracking-[8px] sm:tracking-[12px] text-[#e62117] font-black mt-5 text-xs sm:text-sm"
                >
                  BUSAN, KOREA
                </p>
              </div>

              {/* 히어로 이미지
                  모바일  : 전체 너비, 높이 50vw (너무 크지 않게)
                  lg 이상 : 오른쪽 정렬 85%, 높이 60vh
              */}
              <div className="w-full lg:w-[85%] lg:justify-self-end">
                <div className="w-full overflow-hidden h-[50vw] sm:h-[40vw] lg:h-[60vh]">
                  <img
                    src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200"
                    alt="Main Hero"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'grayscale(1)',
                      transform: 'scale(1.1)',
                      transition: '2.5s cubic-bezier(0.19, 1, 0.22, 1)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.filter = 'grayscale(0)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.filter = 'grayscale(1)'
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* ── FEATURED 섹션 ───────────────────────────────────────────
              모바일  : 1컬럼
              sm      : 2컬럼
              lg      : 4컬럼
          ─────────────────────────────────────────────────────────── */}
          <section className="px-[5vw] py-16 sm:py-20 lg:py-[120px]">

            {/* 헤더 */}
            <div className="flex justify-between items-center mb-10 sm:mb-[60px]">
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  margin: 0,
                  color: '#111'
                }}
              >
                FEATURED
              </h2>
              <button
                onClick={() => navigate('/restaurants')}
                style={{ fontFamily: "'Space Mono', monospace" }}
                className="border border-[#111] text-[#111] bg-transparent
                           px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs tracking-[3px] sm:tracking-[4px] uppercase
                           hover:bg-[#111] hover:text-white transition-all duration-300
                           cursor-pointer whitespace-nowrap"
              >
                VIEW ALL →
              </button>
            </div>

            {featured.length === 0 ? (
              <div
                className="text-center py-16 text-[11px] tracking-[3px] text-[#aaa]"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                LOADING...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[3px]">
                {featured.map((item, index) => (
                  <div
                    key={item.id}
                    ref={el => { cardRefs.current[index] = el }}
                    onClick={() => navigate(`/restaurants/${item.id}`)}
                    className="relative cursor-pointer overflow-hidden bg-[#1a1a1a]
                               h-[260px] sm:h-[280px] lg:h-[280px]"
                    style={{ transitionDelay: `${index * 0.05}s` }}
                  >
                    <img
                      src={getImage(item, index)}
                      alt={item.restaurantName}
                      onError={e => { e.currentTarget.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length] }}
                      className="w-full h-full object-cover opacity-70 grayscale block transition-all duration-300"
                      onMouseEnter={e => {
                        e.currentTarget.style.filter = 'grayscale(0)'
                        e.currentTarget.style.opacity = '0.9'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.filter = 'grayscale(1)'
                        e.currentTarget.style.opacity = '0.7'
                      }}
                    />
                    {/* 그라데이션 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* 카드 하단 텍스트 */}
                    <div className="absolute bottom-[14px] left-[14px] text-white">
                      <div
                        className="text-[8px] tracking-[1.5px] border border-[#e62117] text-[#e62117]
                                   px-[7px] py-[2px] inline-block mb-[5px]"
                      >
                        {gradeLabel(item.grade)}
                      </div>
                      <div
                        className="text-[13px] font-medium"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {item.restaurantName}
                      </div>
                      <div className="text-[9px] tracking-[1px] text-white/60 mt-[2px]">
                        {item.district}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  )
}

export default MainPage