import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card animate-fade-in" style={{ textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <h1 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontSize: '2.5rem' }}>자갈치 셰프</h1>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: 'var(--foreground-color)', opacity: 0.8 }}>
          자갈치 시장의 생생한 맛을 경험하세요. 로컬 상인과 셰프가 당신만의 미식 여행을 만들어 드립니다.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/marketplace" className="btn-primary" style={{ display: 'inline-block', fontSize: '1.2rem', padding: '14px 28px', backgroundColor: '#007db5' }}>
            🐟 마켓플레이스 입장하기
          </Link>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/login" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
              로그인
            </Link>
            <Link href="/signup" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
              회원가입 (상인/여행객)
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
