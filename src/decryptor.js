function decryptTotalDistanceSquared(d1, d2, d3, s, Q) {
  const DELTA = 2n ** 40n;
  let total = 0n;
  for (let i = 0; i < d1.length; i++) {
      const si = BigInt(s[i]);
      const si2 = si * si;
      // 서버에서 받은 값이 이미 DELTA^2가 곱해진 상태
      const term = BigInt(d1[i]) + BigInt(d2[i]) * si + BigInt(d3[i]) * si2;
      total += term;
  }
  
  // DELTA^2로 나누어 정규화
  const DELTA_SQ = DELTA * DELTA;
  const normalized = Number(total * 1000000n / DELTA_SQ) / 1000000;
  
  return normalized;
}
  module.exports = { decryptTotalDistanceSquared };
  