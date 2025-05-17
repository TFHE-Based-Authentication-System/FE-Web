# 복호화 테스트

#   // // 암호화 관련 상수
#   // const N = 256;
#   // const DELTA = Math.pow(2, 20);

#   // // 복소수 표현 구조
#   // class Complex {
#   //   constructor(re, im) {
#   //     this.re = re;
#   //     this.im = im;
#   //   }
#   // }

#   // // -------------------------
#   // // 1. Hermitian 확장
#   // // -------------------------
#   // export function hermitianExtend(vec) {
#   //   return vec.concat([...vec].reverse());
#   // }

#   // // -------------------------
#   // // 2. 수식 기반 IFFT
#   // // -------------------------
#   // export function pureIFFT(X) {
#   //   const N = X.length;
#   //   let result = [];

#   //   for (let n = 0; n < N; n++) {
#   //     let re_sum = 0, im_sum = 0;
#   //     for (let k = 0; k < N; k++) {
#   //       const angle = (2 * Math.PI * k * n) / N;
#   //       const cos = Math.cos(angle);
#   //       const sin = Math.sin(angle);
#   //       const a = X[k].re, b = X[k].im;
#   //       re_sum += a * cos - b * sin;
#   //       im_sum += a * sin + b * cos;
#   //     }
#   //     result.push(new Complex(re_sum / N, im_sum / N));
#   //   }

#   //   return result;
#   // }

#   // // -------------------------
#   // // 3. 다항식 생성 및 곱
#   // // -------------------------
#   // export function genSmallPoly(n, values) {
#   //   return Array.from({ length: n }, () => values[Math.floor(Math.random() * values.length)]);
#   // }

#   // // 원형 컨볼루션 또는 Z_n[x]/(x^N-1) 에서의 다항식 곱셈
#   // export function polyMul(p1, p2) {
#   //   const N = p1.length;
#   //   const result = new Array(N).fill(0);
#   //   for (let i = 0; i < N; i++) {
#   //     for (let j = 0; j < N; j++) {
#   //       const idx = (i + j) % N;
#   //       result[idx] += p1[i] * p2[j];
#   //     }
#   //   }
#   //   return result;
#   // }

#   // // -------------------------
#   // // 4. 암호화 전체 파이프라인
#   // // -------------------------
#   // export function encryptEmbedding(embedding) {
#   //   const extended = hermitianExtend(embedding);                 // 128 → 256
#   //   const X_input = extended.map(x => new Complex(x, 0));
#   //   const ifft = pureIFFT(X_input);
#   //   const m = ifft.map(z => Math.round(z.re * DELTA));          // 메시지 다항식 (정수)

#   //   const a = Array.from({ length: N }, () => Math.random() * 2 - 1); // 공개키 a : [-1, 1) 범위의 실수 난수를 생성
#   //   const s = genSmallPoly(N, [-1, 0, 1]);                            // 비밀키 s
#   //   const e = genSmallPoly(N, [-1, 0, 1]);                            // 노이즈 e
#   //   const b = a.map((ai, i) => -ai * s[i] + e[i]);                    // 공개키 b = -as + e

#   //   const u = genSmallPoly(N, [0, 1]);                                // 암호화용 u
#   //   const e1 = genSmallPoly(N, [-1, 0, 1]);
#   //   const e2 = genSmallPoly(N, [-1, 0, 1]);

#   //   const bu = polyMul(b, u); // u·b
#   //   const au = polyMul(a, u); // u·a

#   //   // (m,0)+u⋅(b,a)+(e1,e2)=(m+u⋅b+e1, u⋅a+e2)
#   //   const c1 = m.map((mi, i) => mi + bu[i] + e1[i]); // c₁ = m + u·b + e₁
#   //   const c2 = au.map((val, i) => val + e2[i]); // c₂ = u·a + e₂

#   //   return {
#   //     full: { c1, c2, a, s, u }  // 🔥 u 추가
#   //   };
    
#   //   // 복호화 해보기-> 서버에 보내기

#   //   // 백엔드 유클리드 거리-> 설치 쉬운 라이브러리 링크 리눅스 환경 지원 pip 명령어로 설치

#   //   // 프론트에서 복호화 구현 암호화 잘되었는지 확인 , 백엔드에서는 라이브러리 사용방법 익히기, 다음주에는 프론트에서 백엔드로 암호문 보내서 백엔드 처리 연결
#   // }
#   const N = 256;
# const DELTA = Math.pow(2, 20);

# class Complex {
#   constructor(re, im) {
#     this.re = re;
#     this.im = im;
#   }
# }

# // 1. Hermitian 확장 (128 → 256)
# export function hermitianExtend(vec) {
#   return vec.concat([...vec].reverse());
# }

# // 2. 수식 기반 IFFT
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

# // 3. 다항식 생성 및 곱
# export function genSmallPoly(n, values) {
#   return Array.from({ length: n }, () => values[Math.floor(Math.random() * values.length)]);
# }

# export function polyMul(p1, p2) {
#   const N = p1.length;
#   const result = new Array(N).fill(0);
#   for (let i = 0; i < N; i++) {
#     for (let j = 0; j < N; j++) {
#       const idx = (i + j) % N;
#       result[idx] += p1[i] * p2[j];
#     }
#   }
#   return result;
# }

# // 4. 암호화 함수
# export function encryptEmbedding(embedding) {
#   const extended = hermitianExtend(embedding);                 
#   const X_input = extended.map(x => new Complex(x, 0));
#   const ifft = pureIFFT(X_input);
#   const m = ifft.map(z => Math.round(z.re * DELTA));           

#   const a = Array.from({ length: N }, () => Math.random() * 2 - 1);
#   const s = genSmallPoly(N, [-1, 0, 1]);                            
#   const e = genSmallPoly(N, [-1, 0, 1]);                            
#   const b = a.map((ai, i) => -ai * s[i] + e[i]);                    

#   const u = genSmallPoly(N, [0, 1]);                                
#   const e1 = genSmallPoly(N, [-1, 0, 1]);
#   const e2 = genSmallPoly(N, [-1, 0, 1]);

#   const bu = polyMul(b, u); 
#   const au = polyMul(a, u); 

#   const c1 = m.map((mi, i) => mi + bu[i] + e1[i]);
#   const c2 = au.map((val, i) => val + e2[i]);

#   return {
#     full: { c1, c2, a, s, u, m, originalIFFT: ifft }
#   };
# }

# // 5. 복호화 함수
# export function decryptEmbedding(c1, c2, s) {
#   const s_c2 = polyMul(s, c2);
#   const m_rec = c1.map((ci, i) => ci + s_c2[i]);
#   return m_rec.map(val => val / DELTA);  // 복호화 후 실수로 변환
# }

# // 6. 테스트 예시 실행
# export function testEncryption() {
#   const embedding = Array.from({ length: 128 }, () => Math.random()); 

#   const { c1, c2, s, m, originalIFFT } = encryptEmbedding(embedding).full;
#   const decrypted = decryptEmbedding(c1, c2, s);

#   // 결과 출력
#   console.log("✅ 복호화된 임베딩 (앞 10개):", decrypted.slice(0, 10));
#   console.log("🎯 원래 IFFT 임베딩 (앞 10개):", originalIFFT.slice(0, 10).map(z => z.re));

#   // 평균 제곱 오차(MSE)도 확인해보자
#   const mse = originalIFFT.reduce((sum, z, i) => {
#     const diff = z.re - decrypted[i];
#     return sum + diff * diff;
#   }, 0) / N;
#   console.log(`📉 MSE (Mean Squared Error): ${mse.toExponential(4)}`);
# }