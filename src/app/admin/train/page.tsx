"use client";

import { useEffect, useState } from "react";

export default function AdminTrain() {
  const [model, setModel] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [weights, setWeights] = useState({ concern: 3, skin: 4, age: 1 });

  useEffect(()=>{ fetch('/api/model').then(r=>r.json()).then(d=>{ if(d.model) { setModel(d.model); setWeights(d.model.weights || weights); } }) },[]);

  async function runTrain() {
    setStatus('training');
    const res = await fetch('/api/train', { method: 'POST' });
    const data = await res.json();
    if (data.ok) { setModel(data.model); setWeights(data.model.weights); setStatus('trained'); }
    else setStatus('error');
  }

  async function saveWeights() {
    setStatus('saving');
    const res = await fetch('/api/model', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ weights }) });
    if (res.ok) setStatus('saved');
    else setStatus('error');
  }

  return (
    <div style={{maxWidth:920, margin:'24px auto'}}>
      <h1>Admin — 추천 모델 훈련 및 가중치 튜닝</h1>
      <p>현재 모델: {model ? JSON.stringify(model) : '없음'}</p>
      <div style={{display:'flex', gap:12, marginTop:12}}>
        <button onClick={runTrain}>자동 학습 실행</button>
        <button onClick={saveWeights}>가중치 저장</button>
      </div>

      <div style={{marginTop:20}}>
        <label>concern: <input type="number" value={weights.concern} onChange={(e)=>setWeights(s=>({ ...s, concern: Number(e.target.value) }))} /></label>
        <label style={{marginLeft:12}}>skin: <input type="number" value={weights.skin} onChange={(e)=>setWeights(s=>({ ...s, skin: Number(e.target.value) }))} /></label>
        <label style={{marginLeft:12}}>age: <input type="number" value={weights.age} onChange={(e)=>setWeights(s=>({ ...s, age: Number(e.target.value) }))} /></label>
      </div>

      <div style={{marginTop:12}}>
        <p>Status: {status}</p>
      </div>
    </div>
  );
}
