# export const N = 256n;
# export const Q = 2n ** 128n;
# export const DELTA = 2n ** 45n;

# export class Complex {
#   constructor(re, im) {
#     this.re = re;
#     this.im = im;
#   }
# }

# export function hermitianExtend(vec) {
#   return vec.concat([...vec].reverse());
# }

# export function genSmallPoly(n, values) {
#   return Array.from({ length: n }, () => BigInt(values[Math.floor(Math.random() * values.length)]));
# }

# export function safeMod(x, mod) {
#   const res = x % mod;

  

#   return res < 0n ? res + mod : res;
# }




# export function polyMulMod(p1, p2) {
#   const n = p1.length;
#   const full = Array(2 * n).fill(0n);

#   for (let i = 0; i < n; i++) {
#     for (let j = 0; j < n; j++) {
#       const a = BigInt(p1[i]);
#       const b = BigInt(p2[j]);
#       const mul = a * b;
#       full[i + j] += mul;

#       if (i < 2 && j < 5) {
#         console.log(`🧮 polyMulMod[${i}][${j}]: ${a} * ${b} = ${mul}`);
#       }
#     }
#   }

#   // full 배열 일부 확인
#   console.log("📊 full[0..9] =", full.slice(0, 10));

#   let reduced = new Array(n).fill(0n);
#   for (let i = 0; i < 2 * n - 1; i++) {
#     const idx = i % n;
#     reduced[idx] = safeMod(reduced[idx] + full[i], Q);
#   }

#   console.log("📉 reduced[0..9] =", reduced.slice(0, 10));
#   return reduced;
# }




# export function pureIFFT(X) {
#   const N = X.length;
#   let result = [];

#   for (let n = 0; n < N; n++) {
#     let re_sum = 0, im_sum = 0;
#     for (let k = 0; k < N; k++) {
#       const angle = (2 * Math.PI * k * n) / N;
#       const cos = Math.cos(angle);
#       const sin = Math.sin(angle);
#       const a = X[k].re, b = X[k].im;
#       re_sum += a * cos - b * sin;
#       im_sum += a * sin + b * cos;
#     }
#     result.push(new Complex(re_sum / N, im_sum / N));
#   }

#   return result;
# }

# export function encryptEmbedding(embedding) {
#   // 🧪 [1] 스케일링
#   const scaleFactor = 1000000;
#   const scaledEmbedding = embedding.map(x => x * scaleFactor);

#   // 🧪 [2] Hermitian Extend 후 IFFT
#   const extended = hermitianExtend(scaledEmbedding);
#   const X_input = extended.map(x => new Complex(x, 0));
#   const ifft = pureIFFT(X_input);

#   // 🧪 [3] z.re * DELTA -> 정수화 및 로그
#   ifft.forEach((z, i) => {
#     const scaled = z.re * Number(DELTA);
#     if (i < 10) console.log(`📊 IFFT[${i}] = ${z.re}, scaled = ${scaled}`);
#   });

#   // 암호화 중 IFFT 후
#   const m = ifft.map(z => {
#   const scaledReal = z.re * Number(DELTA);         // Float * DELTA
#   const val = BigInt(Math.round(scaledReal));      // 정수화
#   return safeMod(val, Q);                          // 모듈러 Q
#   });


#   const sigma = m[0];

#   // 🛠️ 암호화 다항식 생성
#   const a = Array.from({ length: Number(N) }, () => {
#     const rand = BigInt(Math.floor(Math.random() * Number(Q)));
#     return ((rand - Q / 2n + Q) % Q);
#   });

#   const s = genSmallPoly(Number(N), [-1n, 1n]); // 0 비율 낮추기

#   const e = genSmallPoly(Number(N), [-1n, 0n, 1n]);
#   const b = a.map((ai, i) => safeMod(-ai * s[i] + e[i], Q));

#   const u = genSmallPoly(Number(N), [0n, 1n]);
#   const e1 = genSmallPoly(Number(N), [-1n, 0n, 1n]);
#   const e2 = genSmallPoly(Number(N), [-1n, 0n, 1n]);

#   const bu = polyMulMod(b, u);
#   const au = polyMulMod(a, u);

#   const c1 = m.map((mi, i) => safeMod(mi + bu[i] + e1[i], Q));
#   const c2 = au.map((ai, i) => safeMod(ai + e2[i], Q));

#   // 🧪 로그 출력
#   console.log("🧪 변환된 m 값 (10개):", m.slice(0, 10));
#   console.log("🧪 s 내부 0 포함 여부:", s.includes(0n));

#   return {
#     full: {
#       c1, c2, a, b, s, u, m, originalIFFT: ifft
#     }
#   };
# }

# export function decryptEmbedding(c1, c2, s) {
#   const s_c2 = polyMulMod(s, c2);
#   return c1.map((ci, i) => safeMod(ci + s_c2[i], Q));
# }

# function toBigIntArray(arr) {
#   return arr.map(x => BigInt(x));
# }

# // ✅ 안전한 다항식 평가 (d1 + d2·s + d3·s²)
# export function polyEvalExpanded(d1, d2, d3, s, q = Q) {
#   const n = d1.length;
#   const result = new Array(n);
#   for (let i = 0; i < n; i++) {
#     const si = BigInt(s[i]);
#     const d2i = BigInt(d2[i]);
#     const d3i = BigInt(d3[i]);

#     const t1 = safeMod(BigInt(d1[i]), q);
#     const t2 = safeMod(d2i * si, q);
#     const t3 = safeMod(d3i * si * si, q);
    

#     // 🪵 디버깅 로그 (곱셈이 0이 되는 경우만)
#     if ((d2i * si === 0n || d3i * si * si === 0n) && i < 10) {
#       console.log(`🧮 polyEvalExpanded[${i}]`);
#       console.log(`    d2[i]=${d2i}, s[i]=${si}, d2[i]*s[i]=${d2i * si}`);
#       console.log(`    d3[i]=${d3i}, s[i]^2=${si * si}, d3[i]*s[i]^2=${d3i * si * si}`);
#     }

#     result[i] = safeMod(t1 + t2 + t3, q);
#   }
#   return result;
# }


# export function evaluateDistanceSquared(d1_raw, d2_raw, d3_raw, s_raw) {
#   const d1 = toBigIntArray(d1_raw);
#   const d2 = toBigIntArray(d2_raw);
#   const d3 = toBigIntArray(d3_raw);

#   let s;
#   if (typeof s_raw === "string") {
#     s = JSON.parse(s_raw).map(BigInt);
#   } else if (typeof s_raw[0] === "string") {
#     s = s_raw.map(BigInt);
#   } else {
#     s = s_raw;
#   }
#   console.log("🔍 s 벡터:", s);
#   const s2 = polyMulMod(s, s);
  
#   s2.forEach((val, i) => {
#     if (i < 10 || val !== 0n) { // 앞쪽 10개 또는 0이 아닌 값만 출력
#       console.log(`s2[${i}] = ${val}`);
#     }
#   });
#   const d2s = polyMulMod(d2, s);
#   const d3s2 = polyMulMod(d3, s2);
#   console.log("🔍 d2.length =", d2.length);
#   console.log("🔍 s.length =", s.length);
#   console.log("🔍 s2.length =", s2.length);
#   // 🧮 디버깅 로그 추가
#   for (let i = 0; i < 10; i++) {
#     console.log(`🔍 [${i}] d1=${d1[i]}`);
#     console.log(`       d2s=${d2s[i]} ← d2·s`);
#     console.log(`       d3s2=${d3s2[i]} ← d3·s²`);
#     const total = safeMod(d1[i] + d2s[i] + d3s2[i], Q);
#     console.log(`       m²[i]=${total}`);
#   }
  
#   const m_squared_scaled = d1.map((v, i) =>
#     safeMod(v + d2s[i] + d3s2[i], Q)
#   );

#   const m_squared = m_squared_scaled.map(x =>
#     Number(x) / Number(DELTA) ** 2
#   );
#   const distance = Math.sqrt(m_squared.reduce((sum, x) => sum + x, 0));

#   console.log("📏 최종 유클리드 거리:", distance);
#   return distance;
# }

