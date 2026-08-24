import styles from "./page.module.css";

const categories = [
  "수분 진정",
  "미백 케어",
  "자외선 차단",
  "세럼 토너",
  "모공 관리",
  "저자극 라인",
];

const products = [
  {
    name: "Cloud Dew Serum",
    type: "진정 세럼",
    rating: "4.9",
    price: "₩29,000",
    tag: "민감성 추천",
    accent: "pink",
  },
  {
    name: "Velvet Barrier Cream",
    type: "보습 크림",
    rating: "4.8",
    price: "₩34,000",
    tag: "건성 추천",
    accent: "gold",
  },
  {
    name: "Fresh Glow Sun Shield",
    type: "선크림",
    rating: "4.9",
    price: "₩27,000",
    tag: "SPF 50+",
    accent: "green",
  },
];

const routines = [
  { title: "아침 루틴", desc: "가볍게 수분 충전과 자외선 차단으로 피부를 보호해요.", icon: "☀️" },
  { title: "저녁 루틴", desc: "세안 후 진정 세럼과 보습 크림으로 밤 동안 회복을 돕습니다.", icon: "🌙" },
  { title: "주 1회 케어", desc: "필링과 마스크로 모공과 톤을 정리해 칙칙함을 줄여줘요.", icon: "✨" },
];

const testimonials = [
  { name: "하린", text: "민감한 피부인데도 자극 없이 매일 편하게 쓰고 있어요." },
  { name: "유나", text: "피부 타입별 추천이 정확해서 쇼핑이 훨씬 쉬워졌어요." },
  { name: "서현", text: "추천 루틴대로 했더니 피부결이 한결 부드러워졌습니다." },
];

const stats = [
  { value: "12k+", label: "추천 완료" },
  { value: "4.9/5", label: "사용자 만족도" },
  { value: "95%", label: "재구매 만족" },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          Bloom<span>Pick</span>
        </div>
        <nav className={styles.nav} aria-label="메인 네비게이션">
          <a href="#recommend">추천</a>
          <a href="#categories">카테고리</a>
          <a href="#routines">루틴</a>
          <a href="#review">리뷰</a>
        </nav>
        <a href="/skin-test" className={styles.headerButton}>
          맞춤 추천 받기
        </a>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>AI 피부 분석 기반 추천</span>
            <h1>내 피부 상태와 취향에 딱 맞는 화장품을 만나보세요.</h1>
            <p>
              민감성, 건성, 지성, 복합성까지 피부 타입별로 필요한 제품과 루틴을
              추천해 드립니다. 부담 없이, 자신감 있게 피부 관리 시작해 보세요.
            </p>
            <div className={styles.heroActions}>
              <a href="#recommend" className={styles.primaryButton}>
                맞춤 추천 시작
              </a>
              <a href="#categories" className={styles.secondaryButton}>
                인기 카테고리
              </a>
            </div>
            <div className={styles.ratingRow}>
              <div className={styles.ratingPill}>★★★★★ 4.9</div>
              <span>실제 사용자 후기 기반</span>
            </div>
          </div>

          <div className={styles.heroVisual} aria-label="추천 제품 미리보기">
            <div className={styles.visualCardMain}>
              <div className={styles.productBadge}>Best Seller</div>
              <div className={styles.productBottle}>
                <span>Glow</span>
              </div>
              <div className={styles.productInfo}>
                <strong>Cloud Dew Serum</strong>
                <span>수분 진정 + 장벽 케어</span>
              </div>
            </div>
            <div className={styles.visualCardSmall}>
              <span>오늘의 피부 타입</span>
              <strong>복합성 · 수분 부족</strong>
              <small>추천 점수 92%</small>
            </div>
          </div>
        </section>

        <section className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section id="recommend" className={styles.matchSection}>
          <div className={styles.sectionTitle}>
            <span>피부 타입 매칭</span>
            <h2>내 피부에 맞는 추천 조합</h2>
          </div>

          <div className={styles.matchGrid}>
            <div className={styles.matchCard}>
              <div className={styles.matchHeader}>
                <span className={styles.typeTag}>지성</span>
                <span className={styles.matchScore}>92%</span>
              </div>
              <h3>가볍고 산뜻한 세럼</h3>
              <ul>
                <li>피지 조절 + 유분 밸런스</li>
                <li>모공 케어 기능 강화</li>
                <li>무겁지 않은 제형 추천</li>
              </ul>
            </div>

            <div className={styles.matchCard}>
              <div className={styles.matchHeader}>
                <span className={styles.typeTagAlt}>건성</span>
                <span className={styles.matchScore}>95%</span>
              </div>
              <h3>보습 강화 루틴</h3>
              <ul>
                <li>수분 다량 충전</li>
                <li>장벽 보호 크림</li>
                <li>촉촉한 마무리감</li>
              </ul>
            </div>

            <div className={styles.matchCard}>
              <div className={styles.matchHeader}>
                <span className={styles.typeTagSoft}>민감성</span>
                <span className={styles.matchScore}>90%</span>
              </div>
              <h3>저자극 라인</h3>
              <ul>
                <li>무향 · 무알코올</li>
                <li>진정 성분 중심</li>
                <li>장기 사용 안정성</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="categories" className={styles.categorySection}>
          <div className={styles.sectionTitle}>
            <span>관심 카테고리</span>
            <h2>원하는 케어에 집중해 보세요</h2>
          </div>
          <div className={styles.categoryList}>
            {categories.map((category) => (
              <button key={category} type="button" className={styles.categoryChip}>
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.productSection}>
          <div className={styles.sectionTitle}>
            <span>인기 제품</span>
            <h2>실제 사용자에게 많이 선택된 화장품</h2>
          </div>

          <div className={styles.productGrid}>
            {products.map((product) => (
              <article key={product.name} className={styles.productCard}>
                <div className={`${styles.productArt} ${styles[product.accent]}`}>
                  <span>{product.type}</span>
                </div>
                <div className={styles.productMeta}>
                  <div className={styles.productRow}>
                    <span className={styles.productTag}>{product.tag}</span>
                    <span className={styles.productRating}>★ {product.rating}</span>
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.type}</p>
                  <div className={styles.productRow}>
                    <strong>{product.price}</strong>
                    <button type="button">담기</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="routines" className={styles.routineSection}>
          <div className={styles.sectionTitle}>
            <span>추천 루틴</span>
            <h2>다양한 고민에 맞는 피부 관리 패턴</h2>
          </div>

          <div className={styles.routineGrid}>
            {routines.map((routine) => (
              <div key={routine.title} className={styles.routineCard}>
                <div className={styles.routineIcon}>{routine.icon}</div>
                <h3>{routine.title}</h3>
                <p>{routine.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="review" className={styles.reviewSection}>
          <div className={styles.sectionTitle}>
            <span>사용자 리뷰</span>
            <h2>믿을 수 있는 후기와 변화를 확인해보세요</h2>
          </div>

          <div className={styles.reviewGrid}>
            {testimonials.map((review) => (
              <blockquote key={review.name} className={styles.reviewCard}>
                <p>“{review.text}”</p>
                <footer>{review.name}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
