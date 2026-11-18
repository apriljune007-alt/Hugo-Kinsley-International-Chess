import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'package.json',
  'capacitor.config.json',
  'www/index.html',
  'www/ai-worker.js',
  'www/vendor/chess.js'
];

for (const relativePath of required) {
  const absolutePath = path.join(root, relativePath);
  try {
    await access(absolutePath, constants.R_OK);
  } catch {
    throw new Error(`缺少必要檔案：${relativePath}`);
  }
}

const index = await readFile(path.join(root, 'www/index.html'), 'utf8');
const worker = await readFile(path.join(root, 'www/ai-worker.js'), 'utf8');

const checks = [
  ['主程式應載入本地 chess.js', index.includes("const ENGINE='./vendor/chess.js'" )],
  ['主程式應使用獨立 AI Worker', index.includes("const WORKER='./ai-worker.js'" )],
  ['AI Worker 應載入本地 chess.js', worker.includes("from './vendor/chess.js'" )],
  ['主程式不應使用遠端 HTTP(S) 資源', !/https?:\/\//i.test(index)]
];

for (const [description, valid] of checks) {
  if (!valid) throw new Error(`驗證失敗：${description}`);
}

console.log(`專案驗證通過：${required.length} 個必要檔案可讀取，離線載入設定正確。`);
