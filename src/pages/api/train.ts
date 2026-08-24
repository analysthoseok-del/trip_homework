import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FB_FILE = path.join(DATA_DIR, 'feedback.json');
const MODEL_FILE = path.join(DATA_DIR, 'model.json');

// Very small trainer that computes weights by simple heuristic based on feedback
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!existsSync(FB_FILE)) return res.status(400).json({ ok: false, error: 'no feedback' });
    const feedback = JSON.parse(readFileSync(FB_FILE, 'utf-8')) as Array<{ profile?: unknown; liked?: boolean }>;

    const agg = { concern: 0, skin: 0, age: 0, count: 0 };
    feedback.forEach((f: { profile?: unknown; liked?: boolean }) => {
      if (!f || !f.profile) return;
      const { liked } = f;
      const sign = liked ? 1 : -1;
      agg.count += 1;
      agg.concern += sign * 1;
      agg.skin += sign * 1;
      agg.age += sign * 0.5;
    });

    const base = { concern: 3, skin: 4, age: 1 };
    const normalized = {
      concern: Math.max(0.1, base.concern + agg.concern / Math.max(1, agg.count)),
      skin: Math.max(0.1, base.skin + agg.skin / Math.max(1, agg.count)),
      age: Math.max(0.1, base.age + agg.age / Math.max(1, agg.count)),
    };

    const model = { weights: normalized, trainedAt: new Date().toISOString(), trainingCount: agg.count };
    writeFileSync(MODEL_FILE, JSON.stringify(model, null, 2));
    res.status(200).json({ ok: true, model });
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    res.status(500).json({ ok: false, error: message });
  }
}
