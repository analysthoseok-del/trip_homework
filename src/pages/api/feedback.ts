import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'feedback.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
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
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    res.status(500).json({ ok: false, error: message });
  }
}
