import { useNavigate } from 'react-router-dom'

function Footer() {
  const navigate = useNavigate()

  return (
    <footer
      style={{
        borderTop: '1px solid #eee',
        background: '#fdfdfd',
        fontFamily: "'Space Mono', monospace"
      }}
    >
      {/* 상단 */}
      <div
        className="px-[5vw] pt-[40px] pb-[32px]"
        style={{ borderBottom: '1px solid #eee' }}
      >
        {/* 로고 */}
        <div
          onClick={() => navigate('/')}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontSize: '1.8rem',
            letterSpacing: '-2px',
            color: '#111',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          THE <span style={{ color: '#e62117' }}>PLATE</span>
        </div>

        {/* 설명 + 링크 */}
        <div className="flex justify-between items-end">
          <p
            style={{
              fontSize: '0.65rem',
              letterSpacing: '2px',
              color: '#aaa',
              lineHeight: 1.8,
              margin: 0
            }}
          >
            MICHELIN GUIDE BUSAN 2026<br />
            CURATED RESTAURANT ARCHIVE
          </p>
          <div
            className="flex gap-6"
            style={{
              fontSize: '0.65rem',
              letterSpacing: '2px'
            }}
          >
            <span
              onClick={() => navigate('/restaurants')}
              className="cursor-pointer"
              style={{ color: '#888' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e62117'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}
            >
              RESTAURANTS
            </span>
            <span
              onClick={() => navigate('/map')}
              className="cursor-pointer"
              style={{ color: '#888' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e62117'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}
            >
              MAP
            </span>
          </div>
        </div>
      </div>

      {/* 하단 */}
      <div
        className="flex justify-between items-center px-[5vw] py-[20px]"
        style={{ background: '#f5f5f5' }}
      >
        <span
          style={{
            fontSize: '0.6rem',
            letterSpacing: '1px',
            color: '#aaa'
          }}
        >
          © 2026 THE PLATE. ALL RIGHTS RESERVED
        </span>
        <span
          style={{
            fontSize: '0.6rem',
            letterSpacing: '2px',
            color: '#aaa',
            fontFamily: "'Space Mono', monospace"
          }}
        >
          <span style={{ color: '#e62117' }}>●</span> BUSAN 2026
        </span>
      </div>
    </footer>
  )
}

export default Footer