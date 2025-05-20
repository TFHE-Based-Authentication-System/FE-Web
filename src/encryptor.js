export const N = 256n;
export const Q = 2n ** 120n;
export const DELTA = 2n ** 80n;

export class Complex {
  constructor(re, im) {
    this.re = re;
    this.im = im;
  }
}

export function hermitianExtend(vec) {
  return vec.concat([...vec].reverse());
}

export function genSmallPoly(n, values) {
  return Array.from({ length: n }, () =>
    BigInt(values[Math.floor(Math.random() * values.length)])
  );
}

export function polyMulMod(p1, p2, q = Q) {
  const Nint = Number(N);
  const full = new Array(2 * Nint - 1).fill(0n);
  for (let i = 0; i < Nint; i++) {
    for (let j = 0; j < Nint; j++) {
      full[i + j] += BigInt(p1[i]) * BigInt(p2[j]);
    }
  }

  const reduced = new Array(Nint).fill(0n);
  for (let i = 0; i < full.length; i++) {
    const idx = i % Nint;
    if (i < Nint) {
      reduced[idx] += full[i];
    } else {
      reduced[idx] -= full[i]; // x^N ≡ -1
    }
    reduced[idx] = ((reduced[idx] % q) + q) % q;
  }

  return reduced;
}

export function pureIFFT(X) {
  const N = X.length;
  let result = [];

  for (let n = 0; n < N; n++) {
    let re_sum = 0, im_sum = 0;
    for (let k = 0; k < N; k++) {
      const angle = (2 * Math.PI * k * n) / N;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const a = X[k].re, b = X[k].im;
      re_sum += a * cos - b * sin;
      im_sum += a * sin + b * cos;
    }
    result.push(new Complex(re_sum / N, im_sum / N));
  }

  return result;
}

export function encryptEmbedding(embedding) {
  const extended = hermitianExtend(embedding);
  const X_input = extended.map(x => new Complex(x, 0));
  const ifft = pureIFFT(X_input);

  const m = ifft.map(z => {
    const val = BigInt(Math.round(z.re * Number(DELTA)));
    return ((val % Q) + Q) % Q;
  });

  // a ∈ [-Q/2, Q/2]
  const a = Array.from({ length: Number(N) }, () => {
    const rand = BigInt(Math.floor(Math.random() * Number(Q)));
    return ((rand - Q / 2n + Q) % Q);
  });

  const s = genSmallPoly(Number(N), [-1n, 0n, 1n]);
  const e = genSmallPoly(Number(N), [-1n, 0n, 1n]);
  const b = a.map((ai, i) => ((-ai * s[i] + e[i]) % Q + Q) % Q);

  const u = genSmallPoly(Number(N), [0n, 1n]);
  const e1 = genSmallPoly(Number(N), [-1n, 0n, 1n]);
  const e2 = genSmallPoly(Number(N), [-1n, 0n, 1n]);

  const bu = polyMulMod(b, u);
  const au = polyMulMod(a, u);

  const c1 = m.map((mi, i) => ((mi + bu[i] + e1[i]) % Q + Q) % Q);
  const c2 = au.map((ai, i) => ((ai + e2[i]) % Q + Q) % Q);

  return {
    full: {
      c1, c2, a, b, s, u, m, originalIFFT: ifft
    }
  };
}

export function decryptEmbedding(c1, c2, s) {
  const s_c2 = polyMulMod(s, c2);
  return c1.map((ci, i) => ((ci + s_c2[i]) % Q + Q) % Q);
}

export function verifyEncryptedMessage(originalIFFT, decryptedBigVec) {
  const diffs = originalIFFT.map((z, i) => {
    const expected = BigInt(Math.round(z.re * Number(DELTA)));
    const actual = decryptedBigVec[i];
    return expected > actual ? expected - actual : actual - expected;
  });

  const maxDiff = diffs.reduce((max, val) => val > max ? val : max, 0n);
  const floatError = Number(maxDiff) / Number(DELTA);

  console.log("🔍 최대 오차 (BigInt):", maxDiff.toString());
  console.log("📉 실수 기준 최대 오차 (maxDiff / DELTA):", floatError.toExponential(10));

  return decryptedBigVec.map(bi => Number(bi) / Number(DELTA));
}

// ... (기존 코드 유지)
export function evaluateDistanceSquared(d1, d2, d3, s) {
  const s2 = polyMulMod(s, s); // s²
  const d2s = polyMulMod(d2, s); // d₂·s
  const d3s2 = polyMulMod(d3, s2); // d₃·s²

  const m_squared_scaled = d1.map((val, i) =>
    ((val + d2s[i] + d3s2[i]) % Q + Q) % Q
  );

  const m_squared = m_squared_scaled.map(x => Number(x) / Number(DELTA) ** 2);
  const distance = Math.sqrt(m_squared.reduce((sum, x) => sum + x, 0));
  return distance;
}

