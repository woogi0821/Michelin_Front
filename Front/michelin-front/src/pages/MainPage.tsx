import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import { useAuthStore } from '../store/useAuthStore'

const sampleData = [
  { id: 1, name: '모리 (Mori)', category: 'KAISEKI', grade: '1 STAR', imageUrl: 'https://images.unsplash.com/photo-1582450871972-ed5ca60b6f3d?w=800' },
  { id: 2, name: '피오또 (Fiotto)', category: 'ITALIAN', grade: '1 STAR', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800' },
  { id: 3, name: '백일평냉', category: 'NAEGMYEON', grade: 'BIB GOURMAND', imageUrl: 'https://images.unsplash.com/photo-1569058242252-62324e68884c?w=800' },
  { id: 4, name: '비비재', category: 'BIBIMBAP', grade: 'BIB GOURMAND', imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800' },
  { id: 5, name: '평양집', category: 'NAEGMYEON', grade: 'SELECTED', imageUrl: 'https://images.unsplash.com/photo-1547928576-a4a33237ce35?w=800' },
  { id: 6, name: '울트라바이트', category: 'MODERN', grade: 'SELECTED', imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6e9482172?w=800' },
  { id: 7, name: '토오루', category: 'JAPANESE', grade: 'SELECTED', imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800' },
  { id: 8, name: '담미옥', category: 'NAEGMYEON', grade: 'SELECTED', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800' },
]

function MainPage() {
  const { introUnlocked, setIntroUnlocked } = useAuthStore()
  const [step, setStep] = useState<'intro' | 'unlocking' | 'unlocked'>(
    () => introUnlocked ? 'unlocked' : 'intro'
  )
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
  }, [step])

  return (
    <>
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
            className={`relative z-[60] flex flex-col items-center text-white
                        transition-opacity duration-500
                        ${step === 'unlocking' ? 'opacity-0' : 'opacity-100'}`}
          >
            <p
              style={{ fontFamily: "'Space Mono', monospace" }}
              className="tracking-[10px] text-xs mb-4 uppercase"
            >
              TOP SECRET
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 900,
                fontSize: 'clamp(3rem, 10vw, 6rem)',
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
                         px-12 py-4 text-xs tracking-[6px] uppercase
                         hover:bg-white hover:text-black transition-all duration-300
                         cursor-pointer"
            >
              DECODE & OPEN
            </button>
          </div>
        </div>
      )}

      {step === 'unlocked' && (
        <>
          <header className="px-[5vw] pt-[60px] pb-[60px]">
            <div
              style={{ alignItems: 'flex-end' }}
              className="flex flex-col gap-8 lg:grid lg:grid-cols-2"
            >
              <div
                className="text-left flex flex-col justify-end"
                style={{ height: '60vh' }}
              >
                <div>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 900,
                      fontSize: 'clamp(4rem, 15vw, 9.5rem)',
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
                    className="tracking-[12px] text-[#e62117] font-black mt-5 text-sm"
                  >
                    BUSAN, KOREA
                  </p>
                </div>
              </div>

              <div
                style={{ width: '85%', justifySelf: 'end' }}
                className="w-full"
              >
                <div style={{ height: '60vh' }} className="w-full overflow-hidden">
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
                      const img = e.currentTarget
                      img.style.filter = 'grayscale(0)'
                      img.style.transform = 'scale(1)'
                    }}
                    onMouseLeave={e => {
                      const img = e.currentTarget
                      img.style.filter = 'grayscale(1)'
                      img.style.transform = 'scale(1.1)'
                    }}
                  />
                </div>
              </div>
            </div>
          </header>

          <section className="px-[5vw] py-[120px]">
            <div className="flex justify-between items-center mb-[60px]">
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
                           px-6 py-3 text-xs tracking-[4px] uppercase
                           hover:bg-[#111] hover:text-white transition-all duration-300
                           cursor-pointer"
              >
                VIEW ALL →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-[50px]">
              {sampleData.map((item, index) => (
                <div
                  key={item.id}
                  ref={el => { cardRefs.current[index] = el }}
                  style={{ transitionDelay: `${index * 0.05}s` }}
                  onClick={() => navigate(`/restaurants/${item.id}`)}
                >
                  <RestaurantCard
                    name={item.name}
                    category={item.category}
                    grade={item.grade}
                    imageUrl={item.imageUrl}
                  />
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  )
}

export default MainPage