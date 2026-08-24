"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { PRODUCTS as PRODUCT_CATALOG, type Product } from "../../lib/products";

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
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      if (raw) setSavedProfiles(JSON.parse(raw));
    } catch (e) {
      console.warn("프로필 불러오기 실패", e);
    }
  }, []);

  function persistProfiles(list: Profile[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(list));
    setSavedProfiles(list);
  }

  function saveProfile() {
    if (!profileName.trim()) {
      alert("프로필 이름을 입력하세요.");
      return;
    }

    const profile: Profile = {
      name: profileName.trim(),
      ageRange,
      skinType,
      concerns,
      allergy,
    };

    const nextProfiles = [...savedProfiles, profile];
    persistProfiles(nextProfiles);
    setProfileName("");
    alert("프로필이 저장되었습니다.");
  }

  function loadProfile(idx: number) {
    const profile = savedProfiles[idx];
    if (!profile) return;

    setAgeRange(profile.ageRange);
    setSkinType(profile.skinType);
    setConcerns(profile.concerns);
    setAllergy(profile.allergy);
    setSelectedProfileIndex(idx);
    alert(`${profile.name} 프로필을 불러왔습니다.`);
  }

  function deleteProfile(idx: number) {
    const nextProfiles = savedProfiles.filter((_, i) => i !== idx);
    persistProfiles(nextProfiles);
  }

  function toggleConcern(item: string) {
    setConcerns((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item]
    );
  }

  function parseAllergens(text: string) {
    return text
      .split(/[,\s]+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
  }

  async function computeRecommendations() {
    const allergens = parseAllergens(allergy);

    let weights = { concern: 3, skin: 4, age: 1 };
    try {
      const response = await fetch("/api/model");
      if (response.ok) {
        const data = await response.json();
        if (data?.model?.weights) {
          weights = data.model.weights;
        }
      }
    } catch {
      // Fallback to default weights if API is unavailable.
    }

    const scored = PRODUCT_CATALOG.map((product) => {
      const hasAllergen = (product.ingredients || []).some((ingredient) =>
        allergens.some(
          (allergen) =>
            ingredient.toLowerCase().includes(allergen) ||
            allergen.includes(ingredient.toLowerCase())
        )
      );

      if (hasAllergen) {
        return { ...product, score: -999, excluded: true } as Product & { score: number; excluded: boolean };
      }

      let score = 0;
      const concernMatches = product.tags.filter((tag) => concerns.includes(tag)).length;
      score += concernMatches * (weights.concern || 3);
      if (product.recommendedFor?.includes(skinType)) score += weights.skin || 4;
      if (product.suitableAges?.includes(ageRange)) score += weights.age || 1;

      return { ...product, score } as Product & { score: number };
    });

    const filtered = scored
      .filter((item) => item.score > -999)
      .sort((a, b) => b.score - a.score || a.id - b.id);

    setResults(filtered.slice(0, 5));

    try {
      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            ageRange,
            skinType,
            concerns,
            allergy,
          },
          event: "recommendation_view",
          results: filtered.slice(0, 5).map(({ id, name }) => ({ id, name })),
          createdAt: new Date().toISOString(),
        }),
      });
    } catch {
      // Ignore analytics errors.
    }
  }

  async function handleSubmit() {
    await computeRecommendations();
    setStep(4);
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          &larr; 홈으로 돌아가기
        </Link>
        <h1>피부 타입 테스트</h1>
      </header>

      <main className={styles.card}>
        {step === 1 && (
          <section>
            <h2>연령대 선택</h2>
            <div className={styles.row}>
              {["10-19", "20-29", "30-39", "40+"].map((range) => (
                <label
                  key={range}
                  className={ageRange === range ? styles.chipActive : styles.chip}
                >
                  <input
                    type="radio"
                    name="age"
                    value={range}
                    checked={ageRange === range}
                    onChange={() => setAgeRange(range)}
                  />
                  {range}
                </label>
              ))}
            </div>
            <div className={styles.actions}>
              <button type="button" onClick={() => setStep(2)} className={styles.primary}>
                다음
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2>피부 타입 선택</h2>
            <div className={styles.row}>
              {["건성", "지성", "복합성", "민감성", "중성"].map((type) => (
                <label
                  key={type}
                  className={skinType === type ? styles.chipActive : styles.chip}
                >
                  <input
                    type="radio"
                    name="skinType"
                    value={type}
                    checked={skinType === type}
                    onChange={() => setSkinType(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
            <div className={styles.actions}>
              <button type="button" onClick={() => setStep(1)}>
                이전
              </button>
              <button type="button" onClick={() => setStep(3)} className={styles.primary}>
                다음
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2>관심 고민 선택</h2>
            <div className={styles.rowWrap}>
              {["수분", "미백", "자외선", "노화", "모공", "트러블", "진정"].map((concern) => (
                <label
                  key={concern}
                  className={concerns.includes(concern) ? styles.chipActive : styles.chip}
                >
                  <input
                    type="checkbox"
                    checked={concerns.includes(concern)}
                    onChange={() => toggleConcern(concern)}
                  />
                  {concern}
                </label>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <label className={styles.label}>
                알레르기/주의성분 (선택)
                <input
                  className={styles.input}
                  placeholder="예: 향료, 알콜"
                  value={allergy}
                  onChange={(event) => setAllergy(event.target.value)}
                />
              </label>
            </div>

            <div style={{ marginTop: 12 }} className={styles.profileRow}>
              <input
                className={styles.input}
                placeholder="프로필 이름(선택)"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
              />
              <button type="button" onClick={saveProfile} className={styles.primary}>
                프로필 저장
              </button>
            </div>

            {savedProfiles.length > 0 && (
              <div style={{ marginTop: 12 }} className={styles.profileList}>
                <select
                  value={selectedProfileIndex ?? ""}
                  onChange={(event) => loadProfile(Number(event.target.value))}
                >
                  <option value="">저장된 프로필 불러오기</option>
                  {savedProfiles.map((profile, index) => (
                    <option key={`${profile.name}-${index}`} value={index}>
                      {profile.name} — {profile.skinType} · {profile.ageRange}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedProfileIndex !== null) deleteProfile(selectedProfileIndex);
                  }}
                  style={{ marginLeft: 8 }}
                >
                  삭제
                </button>
              </div>
            )}

            <div className={styles.actions}>
              <button type="button" onClick={() => setStep(2)}>
                이전
              </button>
              <button type="button" onClick={handleSubmit} className={styles.primary}>
                추천 받기
              </button>
            </div>
          </section>
        )}

        {step === 4 && results && (
          <section>
            <h2>추천 제품</h2>
            <p className={styles.small}>
              선택한 정보: {ageRange} · {skinType} · {concerns.join(" / ") || "없음"}
            </p>
            <div className={styles.results}>
              {results.map((product) => (
                <div key={product.id} className={styles.resultCard}>
                  <div className={styles.resultLeft}>
                    <div className={styles.thumb}></div>
                  </div>
                  <div className={styles.resultBody}>
                    <strong>{product.name}</strong>
                    <span className={styles.muted}>{product.type} · {product.price}</span>
                    <div className={styles.muted} style={{ marginTop: 6 }}>
                      추천 이유: {product.tags.filter((tag) => concerns.includes(tag)).join(", ") || (product.recommendedFor?.includes(skinType) ? "피부 타입 적합" : "")}
                    </div>
                    <div className={styles.resultActions}>
                      <button type="button" className={styles.primary}>
                        제품 보기
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            fetch("/api/feedback", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                profile: { ageRange, skinType, concerns, allergy },
                                productId: product.id,
                                liked: true,
                                createdAt: new Date().toISOString(),
                              }),
                            });
                          } catch {
                            // Ignore analytics error.
                          }
                          alert("담기(샘플 피드백)가 등록되었습니다.");
                        }}
                      >
                        담기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.actions} style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setResults(null);
                  setConcerns([]);
                }}
              >
                다시하기
              </button>
              <Link href="/" className={styles.primary}>
                홈으로
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
