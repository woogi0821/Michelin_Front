import { useState } from 'react'

interface Notice {
  id: number
  category: 'NOTICE' | 'UPDATE' | 'EVENT'
  title: string
  date: string
  content: string
  isPinned?: boolean
}

const NOTICES: Notice[] = [
  {
    id: 1,
    category: 'NOTICE',
    title: '미쉐린 가이드 2026 서울 선정 레스토랑 업데이트 안내',
    date: '2026.05.10',
    content: `미쉐린 가이드 2026 서울 편 선정 결과를 반영하여 레스토랑 정보가 업데이트되었습니다.\n\n이번 업데이트에서는 신규 선정 레스토랑 12곳이 추가되었으며, 등급 변경 사항도 함께 반영되었습니다. 그린스타 인증 레스토랑 또한 최신 정보로 갱신되었으니 검색 시 참고하시기 바랍니다.\n\n더 정확한 정보 제공을 위해 지속적으로 노력하겠습니다.`,
    isPinned: true,
  },
  {
    id: 2,
    category: 'UPDATE',
    title: '지도 기능 업데이트 — 반경 검색 및 마커 개선',
    date: '2026.05.07',
    content: `지도 페이지에 반경 검색 기능이 추가되었습니다.\n\n현재 위치 또는 원하는 지점을 기준으로 반경 내 레스토랑을 확인할 수 있습니다. 마커 색상도 등급별로 구분되어 더욱 직관적으로 이용하실 수 있습니다.\n\n• 1스타: 레드 마커\n• 빕 구르망: 오렌지 마커\n• 셀렉티드: 그레이 마커\n• 그린스타: 그린 마커`,
    isPinned: false,
  },
  {
    id: 3,
    category: 'EVENT',
    title: '[이벤트] 리뷰 작성 이벤트 — 선정 레스토랑 방문 후기를 공유해주세요',
    date: '2026.05.01',
    content: `THE PLATE 오픈 기념 리뷰 작성 이벤트를 진행합니다.\n\n기간: 2026년 5월 1일 ~ 5월 31일\n대상: 미쉐린 선정 레스토랑 방문 후 리뷰 작성 회원\n혜택: 추첨을 통해 미쉐린 가이드 공식 굿즈 증정\n\n많은 참여 부탁드립니다. 여러분의 솔직한 리뷰가 다른 미식가들에게 큰 도움이 됩니다.`,
    isPinned: false,
  },
  {
    id: 4,
    category: 'NOTICE',
    title: '서비스 이용약관 및 개인정보처리방침 개정 안내',
    date: '2026.04.25',
    content: `서비스 이용약관 및 개인정보처리방침이 아래와 같이 개정됩니다.\n\n시행일: 2026년 5월 25일\n주요 변경 내용:\n• 개인정보 보유 기간 명확화\n• 제3자 제공 항목 세분화\n• 이용자 권리 행사 절차 간소화\n\n개정된 약관은 시행일 이후 자동으로 적용됩니다. 동의하지 않으실 경우 시행일 이전까지 회원 탈퇴가 가능합니다.`,
    isPinned: false,
  },
  {
    id: 5,
    category: 'UPDATE',
    title: '리뷰 기능 오픈 — 별점 및 사진 첨부 지원',
    date: '2026.04.20',
    content: `리뷰 기능이 정식으로 오픈되었습니다.\n\n이제 방문한 레스토랑에 대한 리뷰를 작성하고 별점을 남길 수 있습니다. 사진 첨부 기능도 지원되어 더욱 생생한 후기 공유가 가능합니다.\n\n리뷰 작성은 로그인 후 레스토랑 상세 페이지에서 이용하실 수 있습니다.`,
    isPinned: false,
  },
  {
    id: 6,
    category: 'NOTICE',
    title: 'THE PLATE 베타 서비스 오픈 안내',
    date: '2026.04.10',
    content: `안녕하세요. THE PLATE 베타 서비스가 오픈되었습니다.\n\nTHE PLATE는 미쉐린 가이드 선정 레스토랑 정보를 한 곳에서 확인하고, 미식 경험을 기록·공유할 수 있는 플랫폼입니다.\n\n베타 기간 동안 발견하신 버그나 개선 의견은 고객센터를 통해 전달해주시면 적극 반영하겠습니다. 감사합니다.`,
    isPinned: false,
  },
]

const CATEGORY_STYLE: Record<Notice['category'], { label: string; color: string; bg: string }> = {
  NOTICE: { label: 'NOTICE', color: '#111', bg: '#f0f0f0' },
  UPDATE: { label: 'UPDATE', color: '#fff', bg: '#111' },
  EVENT: { label: 'EVENT', color: '#fff', bg: '#e62117' },
}

function NoticesPage() {
  const [openId, setOpenId] = useState<number | null>(null)

  const pinned = NOTICES.filter(n => n.isPinned)
  const regular = NOTICES.filter(n => !n.isPinned)

  const toggle = (id: number) => setOpenId(prev => (prev === id ? null : id))

  const renderItem = (notice: Notice) => {
    const cat = CATEGORY_STYLE[notice.category]
    const isOpen = openId === notice.id

    return (
      <div key={notice.id} style={{ borderBottom: '0.5px solid #e8e8e8' }}>
        {/* 헤더 행 */}
        <div
          onClick={() => toggle(notice.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '18px 0',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {/* 핀 표시 */}
          {notice.isPinned && (
            <span style={{ color: '#e62117', fontSize: '10px', flexShrink: 0 }}>📌</span>
          )}

          {/* 카테고리 배지 */}
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '8px',
            letterSpacing: '1.5px',
            color: cat.color,
            background: cat.bg,
            padding: '3px 8px',
            flexShrink: 0,
          }}>
            {cat.label}
          </span>

          {/* 제목 */}
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.7rem',
            letterSpacing: '0.5px',
            color: '#111',
            flex: 1,
            lineHeight: 1.5,
          }}>
            {notice.title}
          </span>

          {/* 날짜 + 화살표 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: '#aaa', letterSpacing: '1px' }}>
              {notice.date}
            </span>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: '#aaa',
              transition: 'transform 0.25s',
              display: 'inline-block',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </div>
        </div>

        {/* 아코디언 본문 */}
        <div style={{
          overflow: 'hidden',
          maxHeight: isOpen ? '600px' : '0',
          transition: 'max-height 0.35s ease',
        }}>
          <div style={{
            padding: '0 0 24px 0',
            marginLeft: notice.isPinned ? '164px' : '148px', // 배지 너비만큼 들여쓰기
          }}>
            <div style={{
              borderLeft: '2px solid #e62117',
              paddingLeft: '20px',
            }}>
              {notice.content.split('\n').map((line, i) => (
                <p key={i} style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.65rem',
                  color: line.startsWith('•') ? '#444' : '#666',
                  letterSpacing: '0.5px',
                  lineHeight: 1.9,
                  margin: line === '' ? '8px 0' : '0',
                }}>
                  {line || '\u00A0'}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdfdfd' }}>

      {/* 페이지 헤더 */}
      <div style={{ borderBottom: '1px solid #ddd', padding: '60px 5vw 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', letterSpacing: '4px', color: '#e62117', marginBottom: '12px' }}>
            ● THE PLATE
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-2px', color: '#111', margin: '0 0 12px' }}>
            NOTICES
          </h1>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', letterSpacing: '2px', color: '#aaa' }}>
            SERVICE UPDATES &amp; ANNOUNCEMENTS
          </p>
        </div>
      </div>

      {/* 공지사항 본문 */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 5vw 80px' }}>

        {/* 고정 공지 */}
        {pinned.length > 0 && (
          <div style={{ marginTop: '40px', marginBottom: '8px' }}>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', letterSpacing: '3px', color: '#aaa', marginBottom: '0' }}>
              PINNED
            </p>
            <div style={{ background: '#fafafa', border: '0.5px solid #e8e8e8', padding: '0 20px', marginTop: '8px' }}>
              {pinned.map(renderItem)}
            </div>
          </div>
        )}

        {/* 전체 목록 */}
        <div style={{ marginTop: '40px' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', letterSpacing: '3px', color: '#aaa', marginBottom: '0' }}>
            ALL NOTICES — {NOTICES.length} ITEMS
          </p>
          <div style={{ marginTop: '8px' }}>
            {regular.map(renderItem)}
          </div>
        </div>

      </div>
    </div>
  )
}

export default NoticesPage