import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FB_FILE = path.join(DATA_DIR, 'feedback.json');
const MODEL_FILE = path.join(DATA_DIR, 'model.json');

// Very small trainer that computes weights by simple heuristic based on feedback
export default function handler(req, res) {
  try {
    if (!existsSync(FB_FILE)) return res.status(400).json({ ok: false, error: 'no feedback' });
    const feedback = JSON.parse(readFileSync(FB_FILE, 'utf-8'));

    // feedback records expected shape: { profile: {...}, productId: number, liked: boolean }
    // compute simple scores: for each record, if liked increase weights for matched tags/skin/age

    const agg = { concern: 0, skin: 0, age: 0, count: 0 };
    feedback.forEach((f) => {
      if (!f || !f.profile) return;
      const { profile, productId, liked } = f;
      const sign = liked ? 1 : -1;
      // assume product data available in memory - but for this trainer we'll just increment counters
      agg.count += 1;
      // rough heuristic: if liked, add +1 to concern, +1 to skin, +0.5 to age
      agg.concern += sign * 1;
      agg.skin += sign * 1;
      agg.age += sign * 0.5;
    });

    // default weights scaled by average
    const base = { concern: 3, skin: 4, age: 1 };
    const normalized = {
      concern: Math.max(0.1, base.concern + agg.concern / Math.max(1, agg.count)),
      skin: Math.max(0.1, base.skin + agg.skin / Math.max(1, agg.count)),
      age: Math.max(0.1, base.age + agg.age / Math.max(1, agg.count)),
    };

    const model = { weights: normalized, trainedAt: new Date().toISOString(), trainingCount: agg.count };
    writeFileSync(MODEL_FILE, JSON.stringify(model, null, 2));
    res.status(200).json({ ok: true, model });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
}
