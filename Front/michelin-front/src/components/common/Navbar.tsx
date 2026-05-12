import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { getSearchAutocomplete } from '../../service/restaurantApi'

interface AutocompleteItem {
  id: number
  restaurantName: string
  grade: string
  district: string
}

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loggedIn, logout, introUnlocked } = useAuthStore()
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<AutocompleteItem[]>([])
  const [focused, setFocused] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const gradeLabel = (grade: string) => {
    if (grade === '1스타') return '★ 1 STAR'
    if (grade === '빕 구르망') return 'BIB GOURMAND'
    return 'SELECTED'
  }

  const handleKeyword = async (value: string) => {
    setKeyword(value)
    if (value.trim().length < 1) { setResults([]); return }
    try {
      const res = await getSearchAutocomplete(value)
      setResults(res.data.data || [])
    } catch { setResults([]) }
  }

  const handleSelect = (id: number) => {
    setKeyword(''); setResults([]); setFocused(false)
    setMobileSearchOpen(false); setMobileMenuOpen(false)
    navigate(`/restaurants/${id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keyword.trim()) {
      navigate(`/restaurants?keyword=${keyword}`)
      setKeyword(''); setResults([]); setFocused(false)
      setMobileSearchOpen(false); setMobileMenuOpen(false)
    }
  }

  const toggleMenu = () => {
    setMobileMenuOpen(prev => {
      if (!prev) setMobileSearchOpen(false)
      return !prev
    })
  }

  const toggleSearch = () => {
    setMobileSearchOpen(prev => {
      if (!prev) setMobileMenuOpen(false)
      return !prev
    })
  }

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFocused(false); setResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ⌘K 단축키
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setFocused(true)
      }
    }
    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  // 페이지 이동 시 전부 닫기
  useEffect(() => {
    setMobileMenuOpen(false)
    setMobileSearchOpen(false)
  }, [location.pathname])

  // 스크롤 시 메뉴 닫기
  useEffect(() => {
    const handleScroll = () => { if (mobileMenuOpen) setMobileMenuOpen(false) }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mobileMenuOpen])

  // ✅ 모든 hooks 아래로 이동 — Rules of Hooks 준수
  const isIntro = location.pathname === '/' && !introUnlocked
  if (isIntro) return null

  return (
    <>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fdfdfd', borderBottom: '1px solid #ddd' }}>

        {/* 메인 바 */}
        <div className="relative flex items-center justify-between px-[5vw]" style={{ height: '56px' }}>

          {/* 로고 */}
          <div
            onClick={() => navigate('/')}
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-1px', cursor: 'pointer', color: '#111' }}
          >
            THE <span style={{ color: '#e62117' }}>PLATE</span>
          </div>

          {/* 데스크탑 검색창 */}
          <div
            ref={dropdownRef}
            className="hidden md:block"
            style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '320px', zIndex: 200 }}
          >
            <div
              className="flex items-center gap-3"
              style={{ border: `1px solid ${focused ? '#111' : '#ddd'}`, padding: '7px 14px', transition: 'border-color 0.2s', background: '#fdfdfd' }}
            >
              <span style={{ color: '#e62117', fontSize: '0.6rem' }}>●</span>
              <input
                ref={inputRef}
                type="text"
                value={keyword}
                onChange={e => handleKeyword(e.target.value)}
                onFocus={() => setFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder="SEARCH RESTAURANTS"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', letterSpacing: '2px', color: '#888', background: 'transparent', border: 'none', outline: 'none', flex: 1, width: '100%' }}
              />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: '#ccc', userSelect: 'none', letterSpacing: '1px' }}>⌘K</span>
            </div>
            {focused && results.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fdfdfd', border: '1px solid #ddd', borderTop: 'none', maxHeight: '280px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                {results.map((item, i) => (
                  <div key={item.id} onClick={() => handleSelect(item.id)}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: i < results.length - 1 ? '0.5px solid #f0f0f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#111', letterSpacing: '1px' }}>{item.restaurantName}</div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#aaa', letterSpacing: '1px', marginTop: '2px' }}>{item.district}</div>
                    </div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#e62117', letterSpacing: '1px', border: '0.5px solid #e62117', padding: '1px 6px' }}>
                      {gradeLabel(item.grade)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {focused && keyword.length > 0 && results.length === 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fdfdfd', border: '1px solid #ddd', borderTop: 'none', padding: '14px', textAlign: 'center', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#aaa', letterSpacing: '2px' }}>
                NO RESULTS
              </div>
            )}
          </div>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-8" style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', letterSpacing: '3px' }}>
              <span onClick={() => navigate('/restaurants')} className="cursor-pointer" style={{ color: '#111' }} onMouseEnter={e => e.currentTarget.style.color = '#e62117'} onMouseLeave={e => e.currentTarget.style.color = '#111'}>RESTAURANTS</span>
              <span onClick={() => navigate('/map')} className="cursor-pointer" style={{ color: '#111' }} onMouseEnter={e => e.currentTarget.style.color = '#e62117'} onMouseLeave={e => e.currentTarget.style.color = '#111'}>MAP</span>
            </div>
            <div className="flex items-center gap-6" style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', letterSpacing: '2px' }}>
              {loggedIn ? (
                <>
                  <span onClick={() => navigate('/mypage')} className="cursor-pointer" style={{ color: '#111' }} onMouseEnter={e => e.currentTarget.style.color = '#e62117'} onMouseLeave={e => e.currentTarget.style.color = '#111'}>MY PAGE</span>
                  <button onClick={logout} style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', letterSpacing: '2px', border: '1px solid #111', background: 'transparent', padding: '5px 14px', cursor: 'pointer', color: '#111', transition: 'all 0.3s' }} onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111' }}>LOGOUT</button>
                </>
              ) : (
                <>
                  <span onClick={() => navigate('/login')} className="cursor-pointer" style={{ color: '#111' }} onMouseEnter={e => e.currentTarget.style.color = '#e62117'} onMouseLeave={e => e.currentTarget.style.color = '#111'}>LOGIN</span>
                  <button onClick={() => navigate('/register')} style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', letterSpacing: '2px', border: '1px solid #111', background: '#111', padding: '5px 14px', cursor: 'pointer', color: '#fff', transition: 'all 0.3s' }} onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111' }} onMouseLeave={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff' }}>JOIN</button>
                </>
              )}
            </div>
          </div>

          {/* 모바일 우측 아이콘 */}
          <div className="flex md:hidden items-center gap-4">
            <button
              onClick={toggleSearch}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
            >
              🔍
            </button>
            <button
              onClick={toggleMenu}
              aria-label="메뉴"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', width: '28px', height: '28px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span style={{ position: 'absolute', display: 'block', width: '20px', transition: 'opacity 0.2s', opacity: mobileMenuOpen ? 0 : 1 }}>
                <span style={{ display: 'block', width: '20px', height: '1.5px', background: '#111', marginBottom: '5px' }} />
                <span style={{ display: 'block', width: '20px', height: '1.5px', background: '#111', marginBottom: '5px' }} />
                <span style={{ display: 'block', width: '20px', height: '1.5px', background: '#111' }} />
              </span>
              <span style={{ position: 'absolute', fontSize: '18px', color: '#111', lineHeight: 1, transition: 'opacity 0.2s', opacity: mobileMenuOpen ? 1 : 0, userSelect: 'none' }}>✕</span>
            </button>
          </div>
        </div>

        {/* 모바일 검색창 */}
        {mobileSearchOpen && (
          <div className="md:hidden" style={{ padding: '10px 5vw', borderTop: '0.5px solid #eee', background: '#fdfdfd' }}>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <div className="flex items-center gap-3" style={{ border: '1px solid #111', padding: '8px 14px', background: '#fdfdfd' }}>
                <span style={{ color: '#e62117', fontSize: '0.6rem' }}>●</span>
                <input
                  type="text"
                  value={keyword}
                  onChange={e => handleKeyword(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="SEARCH RESTAURANTS"
                  autoFocus
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', letterSpacing: '2px', color: '#888', background: 'transparent', border: 'none', outline: 'none', flex: 1 }}
                />
              </div>
              {focused && results.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fdfdfd', border: '1px solid #ddd', borderTop: 'none', maxHeight: '240px', overflowY: 'auto', zIndex: 300, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  {results.map((item, i) => (
                    <div key={item.id} onClick={() => handleSelect(item.id)}
                      style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: i < results.length - 1 ? '0.5px solid #f0f0f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#111' }}>{item.restaurantName}</div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#aaa', marginTop: '2px' }}>{item.district}</div>
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#e62117', border: '0.5px solid #e62117', padding: '1px 6px' }}>{gradeLabel(item.grade)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 딤 오버레이 */}
      <div
        className="md:hidden fixed inset-0 bg-black/40 z-[110] transition-opacity duration-300"
        style={{ opacity: mobileMenuOpen ? 1 : 0, pointerEvents: mobileMenuOpen ? 'auto' : 'none' }}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* 사이드바 패널 */}
      <div
        className="md:hidden fixed top-0 right-0 h-full bg-[#fdfdfd] z-[120] flex flex-col"
        style={{
          width: 'min(75vw, 280px)',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: mobileMenuOpen ? '-4px 0 24px rgba(0,0,0,0.12)' : 'none',
        }}
      >
        {/* 사이드바 헤더 */}
        <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '0.5px solid #eee', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '1rem', letterSpacing: '-1px', color: '#111' }}>
            THE <span style={{ color: '#e62117' }}>PLATE</span>
          </span>
          <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#111', lineHeight: 1 }}>✕</button>
        </div>

        {/* 메뉴 항목 */}
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: '8px' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', letterSpacing: '2px' }}>
            <div onClick={() => navigate('/restaurants')} style={{ padding: '16px 24px', borderBottom: '0.5px solid #eee', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              RESTAURANTS <span style={{ color: '#ccc', fontSize: '10px' }}>→</span>
            </div>
            <div onClick={() => navigate('/map')} style={{ padding: '16px 24px', borderBottom: '0.5px solid #eee', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              MAP <span style={{ color: '#ccc', fontSize: '10px' }}>→</span>
            </div>
            {loggedIn ? (
              <>
                <div onClick={() => navigate('/mypage')} style={{ padding: '16px 24px', borderBottom: '0.5px solid #eee', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  MY PAGE <span style={{ color: '#ccc', fontSize: '10px' }}>→</span>
                </div>
                <div onClick={logout} style={{ padding: '16px 24px', cursor: 'pointer', color: '#e62117' }} onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  LOGOUT
                </div>
              </>
            ) : (
              <>
                <div onClick={() => navigate('/login')} style={{ padding: '16px 24px', borderBottom: '0.5px solid #eee', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  LOGIN <span style={{ color: '#ccc', fontSize: '10px' }}>→</span>
                </div>
                <div onClick={() => navigate('/register')} style={{ padding: '16px 24px', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  JOIN <span style={{ color: '#ccc', fontSize: '10px' }}>→</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 사이드바 하단 */}
        <div style={{ padding: '20px 24px', borderTop: '0.5px solid #eee', flexShrink: 0 }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '2px', color: '#ccc', margin: 0 }}>
            MICHELIN GUIDE 2026
          </p>
        </div>
      </div>
    </>
  )
}

export default Navbar