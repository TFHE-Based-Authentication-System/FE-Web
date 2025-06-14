export const N = 256n;
export const Q = 2n ** 120n;
export const DELTA = 2n ** 60n;

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
  const Nint = p1.length;
  const full = new Array(2 * Nint - 1).fill(0n);
  for (let i = 0; i < Nint; i++) {
    for (let j = 0; j < Nint; j++) {
      full[i + j] = (full[i + j] + (p1[i] * p2[j]) % q) % q;
    }
  }

  const reduced = new Array(Nint).fill(0n);
  for (let i = 0; i < full.length; i++) {
    const idx = i % Nint;
    if (i < Nint) {
      reduced[idx] = (reduced[idx] + full[i]) % q;
    } else {
      reduced[idx] = (reduced[idx] - full[i] + q) % q;
    }
  }

  return reduced;
}


// export function polyMulMod(p1, p2, q = Q, label = "🔍 디버그 곱셈", shouldSave = false) {
//   const Nint = p1.length;
//   const full = new Array(2 * Nint - 1).fill(0n);
//   const log = [];

//   log.push(`=== ${label} 시작 ===`);

//   for (let i = 0; i < Nint; i++) {
//     for (let j = 0; j < Nint; j++) {
//       const term = BigInt(p1[i]) * BigInt(p2[j]);
//       full[i + j] += term;

//       if (term !== 0n) {
//         const line = `📌 p1[${i}] * p2[${j}] = ${p1[i]} * ${p2[j]} = ${term} → full[${i + j}] = ${full[i + j]}`;
//         console.log(line);
//         log.push(line);
//       }
//     }
//   }

//   const reduced = new Array(Nint).fill(0n);
//   for (let i = 0; i < full.length; i++) {
//     const idx = i % Nint;
//     const action = i < Nint ? '+' : '-';
//     const line = `full[${i}] (${full[i]}) ${action}→ reduced[${idx}]`;
//     log.push(line);

//     if (i < Nint) reduced[idx] += full[i];
//     else reduced[idx] -= full[i];

//     reduced[idx] = ((reduced[idx] % q) + q) % q;
//   }

//   log.push(`📉 Reduced 결과 (앞 10개):`);
//   reduced.slice(0, 10).forEach((val, i) => {
//     log.push(`  reduced[${i}] = ${val}`);
//   });

//   if (shouldSave) {
//     saveDebugLog(log, `${label.replace(/[^a-zA-Z0-9]/g, "_")}.txt`);
//   }

//   return reduced;
// }

// export function polyMulMod(p1, p2, q = Q, label = "🔍 디버그 곱셈") {
//   const Nint = p1.length;
//   const full = new Array(2 * Nint - 1).fill(0n);

//   console.log(`\n=== ${label} 시작 ===`);
//   for (let i = 0; i < Nint; i++) {
//     for (let j = 0; j < Nint; j++) {
//       const term = BigInt(p1[i]) * BigInt(p2[j]);
//       full[i + j] += term;

//       if (term !== 0n) {
//         console.log(`📌 p1[${i}] * p2[${j}] = ${p1[i]} * ${p2[j]} = ${term} → full[${i + j}] = ${full[i + j]}`);
//       }
//     }
//   }

//   const reduced = new Array(Nint).fill(0n);
//   for (let i = 0; i < full.length; i++) {
//     const idx = i % Nint;
//     if (i < Nint) {
//       reduced[idx] += full[i];
//     } else {
//       reduced[idx] -= full[i]; // x^N ≡ -1
//     }
//     reduced[idx] = ((reduced[idx] % q) + q) % q;
//   }

//   console.log(`📉 Reduced 결과 (앞 10개):`);
//   reduced.slice(0, 10).forEach((val, i) => {
//     console.log(`  reduced[${i}] = ${val}`);
//   });

//   return reduced;
// }


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
  console.log("[암호화] 원본 임베딩 벡터:", embedding.slice(0, 10)); // 👈 로그 추가
  
  //  const scaled = embedding.map(x => x * 2**40); // 스케일링 적용
  const extended = hermitianExtend(embedding); //기존 코드
  // const extended = hermitianExtend(scaled);
  
  const X_input = extended.map(x => new Complex(x, 0));
  const ifft = pureIFFT(X_input);

  console.log("[암호화] 원본 IFFT 실수:", ifft.map(z => z.re).slice(0, 10));

  const signedModQ = (x) => (x > Q / 2n ? x - Q : x);
  const m = ifft.map(z => {
    const val = BigInt(Math.round(z.re * Number(DELTA)));
    const modded = ((val % Q) + Q) % Q;
    return signedModQ(modded);
  });

  console.log("[암호화] 암호화된 m (정수):", m.slice(0, 10));

  const a = Array.from({ length: Number(N) }, () => {
    const rand = BigInt(Math.floor(Math.random() * Number(Q)));
    return ((rand - Q / 2n + Q) % Q);
  });

  const s = genSmallPoly(Number(N), [-1n, 0n, 1n]);
  const e = new Array(Number(N)).fill(0n);
  const e1 = new Array(Number(N)).fill(0n);
  const e2 = new Array(Number(N)).fill(0n);
  const u = new Array(Number(N)).fill(0n);
  // 다항식 곱으로 b 계산
  const as = polyMulMod(a, s, Q);
  const b = as.map((val, i) => ((-val + e[i]) % Q + Q) % Q);

  // const u = genSmallPoly(Number(N), [0n, 1n]);
  // const e1 = genSmallPoly(Number(N), [-1n, 0n, 1n]);
  // const e2 = genSmallPoly(Number(N), [-1n, 0n, 1n]);

  const bu = polyMulMod(b, u);
  const au = polyMulMod(a, u);

  const c1 = m.map((mi, i) => ((mi + bu[i] + e1[i]) % Q + Q) % Q);
  const c2 = au.map((ai, i) => ((ai + e2[i]) % Q + Q) % Q);

  return {
    full: { c1, c2, a, b, s, u, m, originalIFFT: ifft }
  };
}




export function decryptEmbedding(c1, c2, s) {
  const s_c2 = polyMulMod(s, c2);

  const decrypted = c1.map((ci, i) => ((ci + s_c2[i]) % Q + Q) % Q);

  const signedModQ = (x) => (x > Q / 2n ? x - Q : x);
  const m_signed = decrypted.map(x => signedModQ(x));

  const DELTA_F = 2 ** 40;  // DELTA in float
  const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);  // 2^53 - 1

  const approx = m_signed.map((x, i) => {
    // 안전한 변환 범위 확인
    if (x > maxSafe || x < -maxSafe) {
      console.warn(`⚠️ Index ${i}: x=${x} exceeds JS safe range`);
    }

    const floatX = Number(x);  // JS에서 부동소수점 정밀도 손실 감수
    const real = floatX / DELTA_F;
    return real;
  });

  console.log("🔓 복호화된 실수:", approx.slice(0, 10));
  return approx;
}

export function verifyDecryptionTable(originalIFFT, approx) {
  const diffs = approx.map((val, i) => val - originalIFFT[i].re);
  const table = approx.slice(0, 10).map((val, i) => ({
    index: i,
    "복호화된 실수": val.toFixed(6),
    "원래 IFFT 실수": originalIFFT[i].re.toFixed(6),
    "오차": diffs[i].toExponential(3),
  }));
  console.table(table);

  const mse = diffs.reduce((sum, err) => sum + err * err, 0) / approx.length;
  const maxError = Math.max(...diffs.map(Math.abs));
  console.log(`📉 MSE (복호화 정확도): ${mse.toExponential(4)}`);
  console.log(`📈 최대 오차: ${maxError.toExponential(4)}`);

  return { mse, maxError };
}



export function evaluateDistanceSquared(d1, d2, d3, s) {
  const s2 = polyMulMod(s, s);       // s²
  const d2s = polyMulMod(d2, s);     // d₂·s
  const d3s2 = polyMulMod(d3, s2);   // d₃·s²

  const m_squared_scaled = d1.map((val, i) =>
    ((val + d2s[i] + d3s2[i]) % Q + Q) % Q
  );

  let totalBigInt = 0n;
  for (let x of m_squared_scaled) {
    totalBigInt = (totalBigInt + x) % Q;
  }

  const DELTA_SQUARED = DELTA * DELTA;
  const distance_squared = Number(totalBigInt) / Number(DELTA_SQUARED);

  const threshold = 0.2;
  const isSamePerson = distance_squared < threshold;

  console.log("📦 m̃² 총합(BigInt):", totalBigInt.toString());
  console.log("🧮 정규화된 거리(제곱):", distance_squared);
  console.log("✅ 동일인 여부:", isSamePerson ? "동일인" : "다른 사람");

  return { distance_squared, isSamePerson };
}





// export function evaluateDistanceSquared(d1, d2, d3, s) {
//   const s2 = polyMulMod(s, s);       // s²
//   const d2s = polyMulMod(d2, s);     // d₂·s
//   console.log("🧪 d2 (앞부분):", d2.slice(0, 5));
//   console.log("🧪 s  (앞부분):", s.slice(0, 5));

//   // const testMul = polyMulMod(d2.slice(0, 5), s.slice(0, 5));
//   // console.log("🧮 d2·s (테스트):", testMul);


//   const d3s2 = polyMulMod(d3, s2);   // d₃·s²

//   console.log("🧮 d1:", d1.slice(0, 10).map(String));
//   console.log("🧮 d2·s:", d2s.slice(0, 10).map(String));
//   console.log("🧮 d3·s²:", d3s2.slice(0, 10).map(String));

//   const m_squared_scaled = d1.map((val, i) =>
//     ((val + d2s[i] + d3s2[i]) % Q + Q) % Q
//   );

//   const m_squared = m_squared_scaled.map(x => Number(x) / Number(DELTA) ** 2);
  
//   console.table(
//     m_squared.slice(0, 10).map((val, i) => ({
//       index: i,
//       "m̃² (정규화된 값)": val,
//       "m̃² * Δ²": Number(m_squared_scaled[i]),
//     }))
//   );

//   const distance = Math.sqrt(m_squared.reduce((sum, x) => sum + x, 0));
//   console.log("📏 최종 유클리드 거리:", distance.toFixed(100));  // 소수점 12자리까지 출력

//   return distance;
// }
