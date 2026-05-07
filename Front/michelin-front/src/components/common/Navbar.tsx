import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loggedIn, logout, introUnlocked } = useAuthStore()

  const isIntro = location.pathname === '/' && !introUnlocked
  if (isIntro) return null

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#fdfdfd',
        borderBottom: '1px solid #ddd'
      }}
    >
      <div
        className="relative flex items-center justify-between px-[5vw]"
        style={{ height: '56px' }}
      >
        {/* 로고 */}
        <div
          onClick={() => navigate('/')}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontSize: '1.1rem',
            letterSpacing: '-1px',
            cursor: 'pointer',
            color: '#111'
          }}
        >
          THE <span style={{ color: '#e62117' }}>PLATE</span>
        </div>

        {/* 검색창 - 정중앙 고정 */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px'
          }}
        >
          <div
            onClick={() => navigate('/restaurants')}
            className="flex items-center gap-3 cursor-pointer"
            style={{
              border: '1px solid #ddd',
              padding: '7px 14px',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#111'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#ddd'}
          >
            <span style={{ color: '#e62117', fontSize: '0.6rem' }}>●</span>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.65rem',
                letterSpacing: '2px',
                color: '#888',
                userSelect: 'none',
                flex: 1
              }}
            >
              SEARCH RESTAURANTS
            </span>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.6rem',
                color: '#ccc',
                userSelect: 'none',
                letterSpacing: '1px'
              }}
            >
              ⌘K
            </span>
          </div>
        </div>

        {/* 메뉴 + 버튼 */}
        <div className="flex items-center gap-8">
          <div
            className="hidden md:flex gap-8"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.65rem',
              letterSpacing: '3px'
            }}
          >
            <span
              onClick={() => navigate('/restaurants')}
              className="cursor-pointer"
              style={{ color: '#111' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e62117'}
              onMouseLeave={e => e.currentTarget.style.color = '#111'}
            >
              RESTAURANTS
            </span>
            <span
              onClick={() => navigate('/map')}
              className="cursor-pointer"
              style={{ color: '#111' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e62117'}
              onMouseLeave={e => e.currentTarget.style.color = '#111'}
            >
              MAP
            </span>
          </div>

          <div
            className="flex items-center gap-6"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.65rem',
              letterSpacing: '2px'
            }}
          >
            {loggedIn ? (
              <>
                <span
                  onClick={() => navigate('/mypage')}
                  className="cursor-pointer"
                  style={{ color: '#111' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e62117'}
                  onMouseLeave={e => e.currentTarget.style.color = '#111'}
                >
                  MY PAGE
                </span>
                <button
                  onClick={logout}
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.6rem',
                    letterSpacing: '2px',
                    border: '1px solid #111',
                    background: 'transparent',
                    padding: '5px 14px',
                    cursor: 'pointer',
                    color: '#111',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#111'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#111'
                  }}
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <span
                  onClick={() => navigate('/login')}
                  className="cursor-pointer"
                  style={{ color: '#111' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e62117'}
                  onMouseLeave={e => e.currentTarget.style.color = '#111'}
                >
                  LOGIN
                </span>
                <button
                  onClick={() => navigate('/register')}
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.6rem',
                    letterSpacing: '2px',
                    border: '1px solid #111',
                    background: '#111',
                    padding: '5px 14px',
                    cursor: 'pointer',
                    color: '#fff',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#111'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#111'
                    e.currentTarget.style.color = '#fff'
                  }}
                >
                  JOIN
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar