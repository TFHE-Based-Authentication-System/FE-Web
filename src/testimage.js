// yein(평문)
// 암호화 생략: DELTA만 곱해서 정수화 후 전송
export function preparePlainEmbedding(embedding) {
  // Step 1. 스케일링 없이 원본 사용
  const X_input = hermitianExtend(embedding).map(x => new Complex(x, 0));

  // Step 2. IFFT 수행
  const ifft = pureIFFT(X_input);

  // Step 3. 정수화 후 BigInt로 변환
  const m_plain = ifft.map(z => {
    const scaled = Math.round(z.re * Number(DELTA));
    return BigInt(scaled);
  });

  console.log("📨 평문 전송용 임베딩 정수 벡터:", m_plain);
  return { m_plain, originalIFFT: ifft };
}

export function analyzeServerVectorMSE(receivedBigVec) {
  const DELTA_f = Number(DELTA);

  // 1. BigInt → 실수 변환
  const receivedFloatVec = receivedBigVec.map(bi => Number(bi) / DELTA_f);

  // 2. 평균 계산
  const mean = receivedFloatVec.reduce((sum, x) => sum + x, 0) / receivedFloatVec.length;

  // 3. 평균 제곱 오차 (편차^2의 평균) = 분산 = MSE
  const mse = receivedFloatVec.reduce((sum, x) => {
    const diff = x - mean;
    return sum + diff * diff;
  }, 0) / receivedFloatVec.length;

  // 출력
  console.log("📦 서버 응답 벡터 요약");
  console.log(`📊 평균: ${mean.toFixed(6)}`);
  console.log(`📉 MSE(=분산): ${mse.toExponential(6)}`);

  return {
    mse,
    mean,
    receivedFloatVec
  };
}
