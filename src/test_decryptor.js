const fs = require('fs');

// d1, d2, d3 파일을 불러와서 BigInt 배열로 변환
const d1 = JSON.parse(fs.readFileSync('d1.json')).map(BigInt);
const d2 = JSON.parse(fs.readFileSync('d2.json')).map(BigInt);
const d3 = JSON.parse(fs.readFileSync('d3.json')).map(BigInt);

// 시크릿키 s = 256개 전부 붙여서 사용
const s =[
  [-1, -1, 1, 0, 0, 0, 1, -1, 0, -1, 1, -1, -1, -1, 0, 0],
  [1, 1, -1, 0, 0, 1, 0, -1, -1, 1, 0, 0, 1, 1, 0, 1],
  [0, 1, 1, -1, 1, 0, 0, 0, -1, -1, 0, -1, 0, 1, 0, -1],
  [0, 1, 1, 1, -1, -1, -1, 0, 0, 1, 1, -1, 0, -1, -1, 1],
  [-1, 1, 1, -1, 0, 1, 0, 1, 0, -1, 0, 0, 0, -1, -1, 1],
  [0, 1, 1, 0, 0, 0, 0, -1, 1, 0, 0, 1, -1, 0, 1, 0],
  [0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, -1, 1],
  [-1, 0, 1, -1, -1, 0, 0, -1, -1, -1, 1, 1, 0, -1, 1, 0],
  [1, -1, 0, 0, -1, 1, -1, 0, 0, 0, 1, 1, -1, 1, -1, 1],
  [1, -1, 1, -1, 0, 1, 1, 1, 0, -1, 0, 0, 0, 1, 0, -1],
  [-1, 0, 1, -1, 0, 0, -1, -1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, -1, -1, 0, 1, -1, 0, 1, 1, 0, 1, 0, -1, 1, 0],
  [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, -1, -1, -1, 0, 1],
  [-1, 1, 1, -1, -1, 1, 0, -1, 1, -1, -1, 1, 0, 0, 0, 1],
  [-1, 1, 0, 0, 0, 0, 1, 0, -1, 1, 1, -1, -1, 0, 0, -1],
  [-1, 1, -1, -1, -1, 0, 0, 0, -1, -1, 0, 1, 1, 0, -1, -1]
];

// s를 BigInt 배열로 변환 (2차원 배열 처리)
const sBig = s.map(row => row.map(BigInt));

// polyMulMod 함수 (encryptor.js에서 복사)
function polyMulMod(p1, p2, q = 2n ** 120n) {
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

// DELTA 값 (2^100으로 변경)
const DELTA = 2n ** 100n;

// 정규화 함수 추가
function normalizePolynomial(poly, scale) {
  return poly.map(x => x / scale);
}

// d1, d2, d3 정규화
const d1Norm = normalizePolynomial(d1, 2n ** 60n);
const d2Norm = normalizePolynomial(d2, 2n ** 60n);
const d3Norm = normalizePolynomial(d3, 2n ** 60n);

// s^2 계산
const s2 = polyMulMod(sBig.flat(), sBig.flat());

// d2·s 계산
const d2s = polyMulMod(d2Norm, sBig.flat());

// d3·s^2 계산
const d3s2 = polyMulMod(d3Norm, s2);

// 거리 계산 함수
function evaluateDistanceSquared(d1, d2s, d3s2, delta) {
  let sum = 0n;
  console.log("\n=== 계산 과정 ===");
  console.log("d1[0]:", d1[0].toString());
  console.log("d2s[0]:", d2s[0].toString());
  console.log("d3s2[0]:", d3s2[0].toString());
  
  for (let i = 0; i < d1.length; i++) {
    // 각 항을 delta로 나누어 정규화
    const d1Norm = d1[i] / delta;
    const d2sNorm = d2s[i] / delta;
    const d3s2Norm = d3s2[i] / delta;
    
    // 정규화된 값으로 계산
    const term = d1Norm + d2sNorm + d3s2Norm;
    const squared = term * term;
    sum = sum + squared;
    
    if (i < 5) {  // 처음 5개 항만 출력
      console.log(`\n항 ${i}:`);
      console.log(`d1[${i}]/DELTA: ${d1Norm.toString()}`);
      console.log(`d2s[${i}]/DELTA: ${d2sNorm.toString()}`);
      console.log(`d3s2[${i}]/DELTA: ${d3s2Norm.toString()}`);
      console.log(`합: ${term.toString()}`);
      console.log(`제곱: ${squared.toString()}`);
    }
  }
  
  console.log("\n=== 최종 결과 ===");
  console.log("sum:", sum.toString());
  
  return sum;
}

// 거리 계산 실행 (정규화된 값 사용)
const distance = evaluateDistanceSquared(d1Norm, d2s, d3s2, DELTA);

// 결과 출력
console.log("제곱 거리(BigInt):", distance.toString());
console.log("제곱 거리(Number):", Number(distance).toFixed(6));