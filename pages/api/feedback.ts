import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'feedback.json');

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const body = req.body;
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const prev = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf-8')) : [];
    prev.push({ ...body, createdAt: new Date().toISOString() });
    writeFileSync(FILE, JSON.stringify(prev, null, 2));

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
}
