import { hermitianExtend, Complex, pureIFFT, DELTA, Q } from './encryptor.js';


// ✅ 예시 임베딩 벡터 (실제 얼굴 임베딩 대신 임의로 테스트용 값)
const embedding = Array.from({ length: 128 }, (_, i) => i / 128); // 0 ~ 0.992

// 1. Hermitian 확장
const extended = hermitianExtend(embedding);

// 2. Complex 변환
const X_input = extended.map(x => new Complex(x, 0));

// 3. IFFT 수행
const ifft = pureIFFT(X_input);

// 4. 메시지로 변환 (정수화)
const m = ifft.map(z => {
  const val = BigInt(Math.round(z.re * Number(DELTA)));
  return ((val % Q) + Q) % Q;
});

// ✅ val[0] = m[0]
const sigma = m[0];
const originalReal0 = ifft[0].re;
const recoveredFloat = Number(sigma) / Number(DELTA);

// ✅ embedding 총합 확인
const embeddingSum = embedding.reduce((a, b) => a + b, 0);

console.log("===== IFFT 체크 테스트 =====");
console.log("▶️ embedding 총합:", embeddingSum.toFixed(6));
console.log("▶️ ifft[0].re (실수):", originalReal0.toFixed(6));
console.log("▶️ val[0] (정수):", sigma.toString());
console.log("▶️ val[0] / DELTA:", recoveredFloat.toFixed(6));
