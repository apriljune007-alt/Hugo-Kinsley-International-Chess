import { access, copyFile, mkdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'node_modules', 'chess.js', 'dist', 'esm', 'chess.js');
const targetDirectory = path.join(root, 'www', 'vendor');
const target = path.join(targetDirectory, 'chess.js');

try {
  await access(source, constants.R_OK);
} catch {
  throw new Error(`找不到 chess.js ESM 模組：${source}\n請先執行 npm ci 或 npm install。`);
}

await mkdir(targetDirectory, { recursive: true });
await copyFile(source, target);
console.log(`已準備離線棋規引擎：${path.relative(root, target)}`);
