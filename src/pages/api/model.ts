import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const MODEL_FILE = path.join(DATA_DIR, 'model.json');

export default function handler(req, res) {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

    if (req.method === 'GET') {
      const model = existsSync(MODEL_FILE) ? JSON.parse(readFileSync(MODEL_FILE, 'utf-8')) : { weights: { concern: 3, skin: 4, age: 1 } };
      return res.status(200).json({ ok: true, model });
    }

    if (req.method === 'POST') {
      const body = req.body;
      writeFileSync(MODEL_FILE, JSON.stringify(body, null, 2));
      return res.status(200).json({ ok: true });
    }

    res.status(405).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
}
