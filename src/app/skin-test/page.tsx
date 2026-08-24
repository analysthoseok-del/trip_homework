"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { PRODUCTS } from "../../lib/products";

type Product = {
  id: number;
  name: string;
  tags: string[];
  type: string;
  price: string;
  ingredients?: string[];
  recommendedFor?: string[]; // 피부 타입
  suitableAges?: string[];
};

const PRODUCTS: Product[] = [
  { id: 1, name: "Cloud Dew Serum", tags: ["수분", "진정"], type: "진정 세럼", price: "₩29,000", ingredients: ["향료"], recommendedFor: ["민감성","건성"], suitableAges: ['20-29','30-39'] },
  { id: 2, name: "Velvet Barrier Cream", tags: ["보습", "장벽"], type: "보습 크림", price: "₩34,000", ingredients: ["글리세린"], recommendedFor: ["건성"], suitableAges: ['30-39','40+'] },
  { id: 3, name: "Fresh Glow Sun Shield", tags: ["자외선", "가벼움"], type: "선크림", price: "₩27,000", ingredients: ["옥시벤존"], recommendedFor: ["복합성","지성"], suitableAges: ['10-19','20-29'] },
  { id: 4, name: "Pore Clear Toner", tags: ["모공", "피지"], type: "토너", price: "₩18,000", ingredients: ["알콜"], recommendedFor: ["지성"], suitableAges: ['20-29','30-39'] },
  { id: 5, name: "Soothing Mask Pack", tags: ["진정", "수분"], type: "마스크", price: "₩9,900", ingredients: ["알로에"], recommendedFor: ["민감성","건성"], suitableAges: ['10-19','20-29','30-39'] },
];

type Profile = {
  name: string;
  ageRange: string;
  skinType: string;
  concerns: string[];
  allergy: string;
};

const PROFILE_KEY = "bloompick_profiles";

export default function SkinTest() {
  const [step, setStep] = useState(1);
  const [ageRange, setAgeRange] = useState("20-29");
  const [skinType, setSkinType] = useState("복합성");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [allergy, setAllergy] = useState("");
  const [results, setResults] = useState<Product[] | null>(null);

  const [profileName, setProfileName] = useState("");
  const [savedProfiles, setSavedProfiles] = useState<Profile[]>([]);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) setSavedProfiles(JSON.parse(raw));
    } catch (e) {
      console.warn("프로필 불러오기 실패", e);
    }
  }, []);

  function persistProfiles(list: Profile[]) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(list));
    setSavedProfiles(list);
  }

  function saveProfile() {
    if (!profileName.trim()) return alert("프로필 이름을 입력하세요.");
    const p: Profile = { name: profileName.trim(), ageRange, skinType, concerns, allergy };
    const updated = [...savedProfiles, p];
    persistProfiles(updated);
    setProfileName("");
    alert("프로필이 저장되었습니다.");
  }

  function loadProfile(idx: number) {
    const p = savedProfiles[idx];
    if (!p) return;
    setAgeRange(p.ageRange);
    setSkinType(p.skinType);
    setConcerns(p.concerns);
    setAllergy(p.allergy);
    setSelectedProfileIndex(idx);
    alert(`${p.name} 프로필을 불러왔습니다.`);
  }

  function deleteProfile(idx: number) {
    const updated = savedProfiles.filter((_, i) => i !== idx);
    persistProfiles(updated);
  }

  function toggleConcern(item: string) {
    setConcerns((c) => (c.includes(item) ? c.filter((x) => x !== item) : [...c, item]));
  }

  function parseAllergens(text: string) {
    return text
      .split(/[,\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  async function computeRecommendations() {
    const allergens = parseAllergens(allergy);

      // fetch current model weights from API (or fallback to defaults)
      let weights = { concern: 3, skin: 4, age: 1 };
      try {
        const resp = await fetch('/api/model');
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.model && data.model.weights) weights = data.model.weights;
        }
      } catch (e) {
        // ignore and use defaults
      }

      const scored = PRODUCTS.map((p) => {
        const hasAllergen = (p.ingredients || []).some((ing) =>
          allergens.some((a) => ing.toLowerCase().includes(a) || a.includes(ing.toLowerCase()))
        );
        if (hasAllergen) return { ...p, score: -999, excluded: true } as any;

        let score = 0;
        const concernMatches = p.tags.filter((t) => concerns.includes(t)).length;
        score += concernMatches * (weights.concern || 3);
        if (p.recommendedFor && p.recommendedFor.includes(skinType)) score += (weights.skin || 4);
        if (p.suitableAges && p.suitableAges.includes(ageRange)) score += (weights.age || 1);

        return { ...p, score } as any;
      });

      const filtered = scored.filter((s: any) => s.score > -999);
      filtered.sort((a: any, b: any) => b.score - a.score || a.id - b.id);
      setResults(filtered.slice(0, 5));

    // optional: send implicit feedback of 'view' for analytics
    try {
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: { ageRange, skinType, concerns, allergy }, event: 'recommendation_view', results: filtered.slice(0,5).map(r=>({id:r.id,name:r.name})), createdAt: new Date().toISOString() }),
      });
    } catch(e) {}
  }
    }

  async function handleSubmit() {
      await computeRecommendations();
    setStep(4);
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>&larr; 홈으로 돌아가기</Link>
        <h1>피부 타입 테스트</h1>
      </header>

      <main className={styles.card}>
        {step === 1 && (
          <section>
            <h2>연령대 선택</h2>
            <div className={styles.row}>
              {['10-19','20-29','30-39','40+'].map((r) => (
                <label key={r} className={ageRange===r?styles.chipActive:styles.chip}>
                  <input type="radio" name="age" value={r} checked={ageRange===r} onChange={()=>setAgeRange(r)} />
                  {r}
                </label>
              ))}
            </div>
            <div className={styles.actions}>
              <button onClick={()=>setStep(2)} className={styles.primary}>다음</button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2>피부 타입 선택</h2>
            <div className={styles.row}>
              {['건성','지성','복합성','민감성','중성'].map((t)=> (
                <label key={t} className={skinType===t?styles.chipActive:styles.chip}>
                  <input type="radio" name="stype" value={t} checked={skinType===t} onChange={()=>setSkinType(t)} />
                  {t}
                </label>
              ))}
            </div>
            <div className={styles.actions}>
              <button onClick={()=>setStep(1)}>이전</button>
              <button onClick={()=>setStep(3)} className={styles.primary}>다음</button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2>관심 고민 선택</h2>
            <div className={styles.rowWrap}>
              {['수분','미백','자외선','노화','모공','트러블','진정'].map((c)=> (
                <label key={c} className={concerns.includes(c)?styles.chipActive:styles.chip}>
                  <input type="checkbox" checked={concerns.includes(c)} onChange={()=>toggleConcern(c)} />
                  {c}
                </label>
              ))}
            </div>
            <div style={{marginTop:12}}>
              <label className={styles.label}>알레르기/주의성분 (선택)
                <input className={styles.input} placeholder="예: 향료, 알콜" value={allergy} onChange={(e)=>setAllergy(e.target.value)} />
              </label>
            </div>

            <div style={{marginTop:12}} className={styles.profileRow}>
              <input className={styles.input} placeholder="프로필 이름(선택)" value={profileName} onChange={(e)=>setProfileName(e.target.value)} />
              <button onClick={saveProfile} className={styles.primary}>프로필 저장</button>
            </div>

            {savedProfiles.length > 0 && (
              <div style={{marginTop:12}} className={styles.profileList}>
                <select value={selectedProfileIndex ?? ""} onChange={(e)=>loadProfile(Number(e.target.value))}>
                  <option value="">저장된 프로필 불러오기</option>
                  {savedProfiles.map((p, idx)=> (
                    <option key={idx} value={idx}>{p.name} — {p.skinType} · {p.ageRange}</option>
                  ))}
                </select>
                <button onClick={()=>{ if (selectedProfileIndex != null) deleteProfile(selectedProfileIndex); }} style={{marginLeft:8}}>삭제</button>
              </div>
            )}

            <div className={styles.actions}>
              <button onClick={()=>setStep(2)}>이전</button>
              <button onClick={handleSubmit} className={styles.primary}>추천 받기</button>
            </div>
          </section>
        )}

        {step === 4 && results && (
          <section>
            <h2>추천 제품</h2>
            <p className={styles.small}>선택한 정보: {ageRange} · {skinType} · {concerns.join(' / ') || '없음'}</p>
            <div className={styles.results}>
              {results.map(r => (
                <div key={r.id} className={styles.resultCard}>
                  <div className={styles.resultLeft}>
                    <div className={styles.thumb}></div>
                  </div>
                  <div className={styles.resultBody}>
                    <strong>{r.name}</strong>
                    <span className={styles.muted}>{r.type} · {r.price}</span>
                    <div className={styles.muted} style={{marginTop:6}}>
                      추천 이유: {r.tags.filter(t=>concerns.includes(t)).join(', ') || (r.recommendedFor?.includes(skinType)? '피부 타입 적합':'' )}
                    </div>
                    <div className={styles.resultActions}>
                      <button className={styles.primary}>제품 보기</button>
                                          <button onClick={()=>{
                                            // send feedback like action for training
                                            try { fetch('/api/feedback', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ profile:{ ageRange, skinType, concerns, allergy }, productId: r.id, liked: true, createdAt: new Date().toISOString() }) }); } catch(e){}
                                            alert('담기(샘플 피드백)가 등록되었습니다.');
                                          }}>담기</button>
                                        </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.actions} style={{marginTop:12}}>
              <button onClick={()=>{ setStep(1); setResults(null); setConcerns([]); }}>다시하기</button>
              <Link href="/" className={styles.primary}>홈으로</Link>
            </div>
          </section>
        )}
      </main>

    </div>
  );
}
