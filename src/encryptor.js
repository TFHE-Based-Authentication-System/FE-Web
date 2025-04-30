// 암호화 관련 상수
const N = 256;
const DELTA = Math.pow(2, 20);

// 복소수 표현 구조
class Complex {
  constructor(re, im) {
    this.re = re;
    this.im = im;
  }
}

// -------------------------
// 1. Hermitian 확장
// -------------------------
export function hermitianExtend(vec) {
  return vec.concat([...vec].reverse());
}

// -------------------------
// 2. 수식 기반 IFFT
// -------------------------
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

// -------------------------
// 3. 다항식 생성 및 곱
// -------------------------
export function genSmallPoly(n, values) {
  return Array.from({ length: n }, () => values[Math.floor(Math.random() * values.length)]);
}

export function polyMul(p1, p2) {
  const N = p1.length;
  const result = new Array(N).fill(0);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const idx = (i + j) % N;
      result[idx] += p1[i] * p2[j];
    }
  }
  return result;
}

// -------------------------
// 4. 암호화 전체 파이프라인
// -------------------------
export function encryptEmbedding(embedding) {
  const extended = hermitianExtend(embedding);                 // 128 → 256
  const X_input = extended.map(x => new Complex(x, 0));
  const ifft = pureIFFT(X_input);
  const m = ifft.map(z => Math.round(z.re * DELTA));          // 메시지 다항식 (정수)

  const a = Array.from({ length: N }, () => Math.random() * 2 - 1); // 공개키 a
  const s = genSmallPoly(N, [-1, 0, 1]);                            // 비밀키 s
  const e = genSmallPoly(N, [-1, 0, 1]);                            // 노이즈 e
  const b = a.map((ai, i) => -ai * s[i] + e[i]);                    // 공개키 b

  const u = genSmallPoly(N, [0, 1]);                                // 암호화용 u
  const e1 = genSmallPoly(N, [-1, 0, 1]);
  const e2 = genSmallPoly(N, [-1, 0, 1]);

  const bu = polyMul(b, u);
  const au = polyMul(a, u);

  const c1 = m.map((mi, i) => mi + bu[i] + e1[i]);
  const c2 = au.map((val, i) => val + e2[i]);

  return {
    m: m.slice(0, 10),
    a: a.slice(0, 10),
    b: b.slice(0, 10),
    c1: c1.slice(0, 10),
    c2: c2.slice(0, 10),
    full: { a, b, c1, c2 } // 전체 전송용
  };
}
