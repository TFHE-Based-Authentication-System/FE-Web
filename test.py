# export const N = 256n;
# export const Q = 2n ** 60n;
# export const DELTA = 2n ** 40n;

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
#   return Array.from({ length: n }, () =>
#     BigInt(values[Math.floor(Math.random() * values.length)])
#   );
# }

# export function polyMulMod(p1, p2, q = Q) {
#   // const Nint = Number(N);
#   const Nint = p1.length;
#   const full = new Array(2 * Nint - 1).fill(0n);
#   for (let i = 0; i < Nint; i++) {
#     for (let j = 0; j < Nint; j++) {
#       full[i + j] += BigInt(p1[i]) * BigInt(p2[j]);
#     }
#   }

#   const reduced = new Array(Nint).fill(0n);
#   for (let i = 0; i < full.length; i++) {
#     const idx = i % Nint;
#     if (i < Nint) {
#       reduced[idx] += full[i];
#     } else {
#       reduced[idx] -= full[i]; // x^N ≡ -1
#     }
#     reduced[idx] = ((reduced[idx] % q) + q) % q;
#   }

#   return reduced;
# }
# // export function polyMulMod(p1, p2, q = Q, label = "🔍 디버그 곱셈", shouldSave = false) {
# //   const Nint = p1.length;
# //   const full = new Array(2 * Nint - 1).fill(0n);
# //   const log = [];

# //   log.push(`=== ${label} 시작 ===`);

# //   for (let i = 0; i < Nint; i++) {
# //     for (let j = 0; j < Nint; j++) {
# //       const term = BigInt(p1[i]) * BigInt(p2[j]);
# //       full[i + j] += term;

# //       if (term !== 0n) {
# //         const line = `📌 p1[${i}] * p2[${j}] = ${p1[i]} * ${p2[j]} = ${term} → full[${i + j}] = ${full[i + j]}`;
# //         console.log(line);
# //         log.push(line);
# //       }
# //     }
# //   }

# //   const reduced = new Array(Nint).fill(0n);
# //   for (let i = 0; i < full.length; i++) {
# //     const idx = i % Nint;
# //     const action = i < Nint ? '+' : '-';
# //     const line = `full[${i}] (${full[i]}) ${action}→ reduced[${idx}]`;
# //     log.push(line);

# //     if (i < Nint) reduced[idx] += full[i];
# //     else reduced[idx] -= full[i];

# //     reduced[idx] = ((reduced[idx] % q) + q) % q;
# //   }

# //   log.push(`📉 Reduced 결과 (앞 10개):`);
# //   reduced.slice(0, 10).forEach((val, i) => {
# //     log.push(`  reduced[${i}] = ${val}`);
# //   });

# //   if (shouldSave) {
# //     saveDebugLog(log, `${label.replace(/[^a-zA-Z0-9]/g, "_")}.txt`);
# //   }

# //   return reduced;
# // }

# // export function polyMulMod(p1, p2, q = Q, label = "🔍 디버그 곱셈") {
# //   const Nint = p1.length;
# //   const full = new Array(2 * Nint - 1).fill(0n);

# //   console.log(`\n=== ${label} 시작 ===`);
# //   for (let i = 0; i < Nint; i++) {
# //     for (let j = 0; j < Nint; j++) {
# //       const term = BigInt(p1[i]) * BigInt(p2[j]);
# //       full[i + j] += term;

# //       if (term !== 0n) {
# //         console.log(`📌 p1[${i}] * p2[${j}] = ${p1[i]} * ${p2[j]} = ${term} → full[${i + j}] = ${full[i + j]}`);
# //       }
# //     }
# //   }

# //   const reduced = new Array(Nint).fill(0n);
# //   for (let i = 0; i < full.length; i++) {
# //     const idx = i % Nint;
# //     if (i < Nint) {
# //       reduced[idx] += full[i];
# //     } else {
# //       reduced[idx] -= full[i]; // x^N ≡ -1
# //     }
# //     reduced[idx] = ((reduced[idx] % q) + q) % q;
# //   }

# //   console.log(`📉 Reduced 결과 (앞 10개):`);
# //   reduced.slice(0, 10).forEach((val, i) => {
# //     console.log(`  reduced[${i}] = ${val}`);
# //   });

# //   return reduced;
# // }


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
# // Ifft 하기 전 값을 더한 것과 IFFT한것의 [0]번째 값 비교
# // export function encryptEmbedding(embedding) {
# //   const extended = hermitianExtend(embedding);
# //   const X_input = extended.map(x => new Complex(x, 0));
# //   const ifft = pureIFFT(X_input);

# //   const m = ifft.map(z => {
# //     const val = BigInt(Math.round(z.re * Number(DELTA)));
# //     return ((val % Q) + Q) % Q;
# //   });

# //   val[0] 


# //   // a ∈ [-Q/2, Q/2]
# //   const a = Array.from({ length: Number(N) }, () => {
# //     const rand = BigInt(Math.floor(Math.random() * Number(Q)));
# //     return ((rand - Q / 2n + Q) % Q);
# //   });

# //   const s = genSmallPoly(Number(N), [-1n, 0n, 1n]);
# //   const e = genSmallPoly(Number(N), [-1n, 0n, 1n]);
# //   const b = a.map((ai, i) => ((-ai * s[i] + e[i]) % Q + Q) % Q);

# //   const u = genSmallPoly(Number(N), [0n, 1n]);
# //   const e1 = genSmallPoly(Number(N), [-1n, 0n, 1n]);
# //   const e2 = genSmallPoly(Number(N), [-1n, 0n, 1n]);

# //   const bu = polyMulMod(b, u);
# //   const au = polyMulMod(a, u);

# //   const c1 = m.map((mi, i) => ((mi + bu[i] + e1[i]) % Q + Q) % Q);
# //   const c2 = au.map((ai, i) => ((ai + e2[i]) % Q + Q) % Q);

# //   return {
# //     full: {
# //       c1, c2, a, b, s, u, m, originalIFFT: ifft
# //     }
# //   };
# // }

# export function encryptEmbedding(embedding) {
#   const scaled = embedding.map(x => x * 2**40); // 스케일링 적용
#   // const extended = hermitianExtend(embedding); //기존 코드
#   const extended = hermitianExtend(scaled);
#   const X_input = extended.map(x => new Complex(x, 0));
#   const ifft = pureIFFT(X_input);

#   const m = ifft.map(z => {
#     const val = BigInt(Math.round(z.re * Number(DELTA)));
#     return ((val % Q) + Q) % Q;
#   });

  
#   const sigma = m[0];
#   const raw_re0 = ifft[0].re;
#   const rounded_val0 = Math.round(raw_re0 * Number(DELTA));
#   console.log("🎯 IFFT[0].re =", raw_re0);
#   console.log("🔢 σ (정수형) = Math.round(re * DELTA) =", rounded_val0);
#   console.log("🧮 σ (BigInt 변환 후 mod Q) =", sigma.toString());
  


#   // a ∈ [-Q/2, Q/2]
#   const a = Array.from({ length: Number(N) }, () => {
#     const rand = BigInt(Math.floor(Math.random() * Number(Q)));
#     return ((rand - Q / 2n + Q) % Q);
#   });

#   const s = genSmallPoly(Number(N), [-1n, 0n, 1n]);
#   const e = genSmallPoly(Number(N), [-1n, 0n, 1n]);
#   const b = a.map((ai, i) => ((-ai * s[i] + e[i]) % Q + Q) % Q);
#   console.log("🧪 s =", s); // s가 전부 0인지 확인

#   const u = genSmallPoly(Number(N), [0n, 1n]);
#   const e1 = genSmallPoly(Number(N), [-1n, 0n, 1n]);
#   const e2 = genSmallPoly(Number(N), [-1n, 0n, 1n]);

#   const bu = polyMulMod(b, u);
#   const au = polyMulMod(a, u);

#   const c1 = m.map((mi, i) => ((mi + bu[i] + e1[i]) % Q + Q) % Q);
#   const c2 = au.map((ai, i) => ((ai + e2[i]) % Q + Q) % Q);

#   return {
#     full: {
#       c1, c2, a, b, s, u, m, originalIFFT: ifft
#     }
#   };
# }

# function saveDebugLog(logLines, filename = "poly_debug_log.txt") {
#   const blob = new Blob([logLines.join('\n')], { type: "text/plain" });
#   const url = URL.createObjectURL(blob);
#   const a = document.createElement("a");
#   a.href = url;
#   a.download = filename;
#   a.click();
#   URL.revokeObjectURL(url);
# }




# export function decryptEmbedding(c1, c2, s) {
#   const s_c2 = polyMulMod(s, c2);
#   return c1.map((ci, i) => ((ci + s_c2[i]) % Q + Q) % Q);
# }

# export function verifyEncryptedMessage(originalIFFT, decryptedBigVec) {
#   const diffs = originalIFFT.map((z, i) => {
#     const expected = BigInt(Math.round(z.re * Number(DELTA)));
#     const actual = decryptedBigVec[i];
#     return expected > actual ? expected - actual : actual - expected;
#   });

#   const maxDiff = diffs.reduce((max, val) => val > max ? val : max, 0n);
#   const floatError = Number(maxDiff) / Number(DELTA);

#   console.log("🔍 최대 오차 (BigInt):", maxDiff.toString());
#   console.log("📉 실수 기준 최대 오차 (maxDiff / DELTA):", floatError.toExponential(10));

#   return decryptedBigVec.map(bi => Number(bi) / Number(DELTA));
# }

# export function evaluateDistanceSquared(d1, d2, d3, s) {
#   const s2 = polyMulMod(s, s);       // s²
#   const d2s = polyMulMod(d2, s);     // d₂·s
#   const d3s2 = polyMulMod(d3, s2);   // d₃·s²


#   const m_squared_scaled = d1.map((val, i) =>
#     ((val + d2s[i] + d3s2[i]) % Q + Q) % Q
#   );

#   const m_squared = m_squared_scaled.map(x => Number(x) / Number(DELTA) ** 2);
#   const distance = Math.sqrt(m_squared.reduce((sum, x) => sum + x, 0));
#   return distance;
# }

# // export function evaluateDistanceSquared(d1, d2, d3, s) {
# //   const s2 = polyMulMod(s, s);       // s²
# //   const d2s = polyMulMod(d2, s);     // d₂·s
# //   console.log("🧪 d2 (앞부분):", d2.slice(0, 5));
# //   console.log("🧪 s  (앞부분):", s.slice(0, 5));

# //   // const testMul = polyMulMod(d2.slice(0, 5), s.slice(0, 5));
# //   // console.log("🧮 d2·s (테스트):", testMul);


# //   const d3s2 = polyMulMod(d3, s2);   // d₃·s²

# //   console.log("🧮 d1:", d1.slice(0, 10).map(String));
# //   console.log("🧮 d2·s:", d2s.slice(0, 10).map(String));
# //   console.log("🧮 d3·s²:", d3s2.slice(0, 10).map(String));

# //   const m_squared_scaled = d1.map((val, i) =>
# //     ((val + d2s[i] + d3s2[i]) % Q + Q) % Q
# //   );

# //   const m_squared = m_squared_scaled.map(x => Number(x) / Number(DELTA) ** 2);
  
# //   console.table(
# //     m_squared.slice(0, 10).map((val, i) => ({
# //       index: i,
# //       "m̃² (정규화된 값)": val,
# //       "m̃² * Δ²": Number(m_squared_scaled[i]),
# //     }))
# //   );

# //   const distance = Math.sqrt(m_squared.reduce((sum, x) => sum + x, 0));
# //   console.log("📏 최종 유클리드 거리:", distance.toFixed(100));  // 소수점 12자리까지 출력

# //   return distance;
# // }
