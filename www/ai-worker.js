import { Chess } from './vendor/chess.js';

const values = { p:100, n:320, b:330, r:500, q:900, k:0 };

function evaluate(g){
  let score = 0;
  const board = g.board();
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++){
    const p = board[r][c];
    if (!p) continue;
    const center = 7 - Math.abs(3.5 - r) - Math.abs(3.5 - c);
    const bonus = p.type === 'p'
      ? (p.color === 'w' ? 6 - r : r - 1) * 8
      : (p.type === 'n' || p.type === 'b') ? center * 9 : 0;
    score += (p.color === 'w' ? 1 : -1) * (values[p.type] + bonus);
  }
  return score;
}

function search(g, depth, alpha, beta, ply){
  if (g.isCheckmate()) return g.turn() === 'w' ? -100000 + ply : 100000 - ply;
  if (g.isDraw()) return 0;
  if (depth === 0) return evaluate(g);

  const white = g.turn() === 'w';
  const moves = g.moves({ verbose:true })
    .sort((a, b) => (values[b.captured] || 0) - (values[a.captured] || 0));

  let best = white ? -Infinity : Infinity;
  for (const m of moves){
    g.move(m);
    const v = search(g, depth - 1, alpha, beta, ply + 1);
    g.undo();
    best = white ? Math.max(best, v) : Math.min(best, v);
    if (white) alpha = Math.max(alpha, best);
    else beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

self.onmessage = ({ data }) => {
  try {
    const g = new Chess();
    for (const san of data.history) g.move(san);
    const moves = g.moves({ verbose:true });
    let chosen;

    if (data.depth === 1){
      const captures = moves.filter(m => m.captured);
      const pool = captures.length && Math.random() < 0.65 ? captures : moves;
      chosen = pool[Math.floor(Math.random() * pool.length)];
    } else {
      const white = g.turn() === 'w';
      let best = white ? -Infinity : Infinity;
      moves.sort((a, b) => (values[b.captured] || 0) - (values[a.captured] || 0));
      for (const m of moves){
        g.move(m);
        const v = search(g, data.depth - 1, -Infinity, Infinity, 1);
        g.undo();
        if (!chosen || (white ? v > best : v < best)){ best = v; chosen = m; }
      }
    }
    self.postMessage({
      generation: data.generation,
      move: chosen ? { from: chosen.from, to: chosen.to, promotion: chosen.promotion } : null
    });
  } catch (e) {
    self.postMessage({ generation: data.generation, error: String(e) });
  }
};
