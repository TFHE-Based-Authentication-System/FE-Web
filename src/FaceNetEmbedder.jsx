import * as faceapi from 'face-api.js';
// import { encryptEmbedding, decryptEmbedding, verifyEncryptedMessage, Q, DELTA } from "./encryptor";
import {
  encryptEmbedding,
  decryptEmbedding,
  verifyEncryptedMessage,
  Q,
  DELTA,
  evaluateDistanceSquared, // ✅ 추가
} from "./encryptor";
import { useEffect, useRef, useState } from 'react';

function FaceEmbedding() {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68'),
        faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector'),
      ]);
  
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setModelsLoaded(true);
    })();
  }, []);
  

  const extractEmbedding = async () => {
    const video = videoRef.current;
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection ? Array.from(detection.descriptor) : null;
  };

  const signedModQ = (x) => (x > Q / 2n ? x - Q : x);

  const handleVerifyDecryption = async () => {
    if (!modelsLoaded) {
      alert("모델이 아직 로드되지 않았습니다.");
      return;
    }

    const embedding = await extractEmbedding();
    if (!embedding) {
      alert("❗ 얼굴을 찾을 수 없습니다.");
      return;
    }

    const { c1, c2, s, originalIFFT } = encryptEmbedding(embedding).full;
    const decrypted = decryptEmbedding(c1, c2, s);
    const m_signed = decrypted.map(x => signedModQ(x));
    const approx = m_signed.map(x => Number(x) / Number(DELTA));

    // 비교표 형태로 콘솔에 출력
    console.table(
      approx.slice(0, 10).map((val, i) => ({
        index: i,
        "복호화된 실수": val,
        "원래 IFFT 실수": originalIFFT[i].re,
        "오차": val - originalIFFT[i].re
      }))
    );

    const errors = approx.map((val, i) => val - originalIFFT[i].re);
    const mse = errors.reduce((sum, err) => sum + err * err, 0) / approx.length;
    const maxError = Math.max(...errors.map(Math.abs));

    console.log(`📉 MSE (복호화 정확도): ${mse.toExponential(4)}`);
    console.log(`📈 최대 오차: ${maxError.toExponential(4)}`);
    alert("✅ 복호화 검증 완료. 콘솔에서 비교 표 확인하세요.");
  };

  const handleCapture = async () => {
    if (!modelsLoaded) return alert('아직 모델이 로드되지 않았습니다.');
    const embedding = await extractEmbedding();
    if (!embedding) return alert('❗ 얼굴을 찾을 수 없습니다.');

    const { c1, c2, s } = encryptEmbedding(embedding).full;
    const c1_str = c1.map(x => x.toString());
    const c2_str = c2.map(x => x.toString());
    const s_str = s.map(x => x.toString())

    const userId = localStorage.getItem("userId");
    if (!userId || isNaN(userId)) return alert("유저 정보가 없습니다.");

    fetch("https://faceauthserver.shop/api/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: Number(userId), vector: { c1: c1_str, c2: c2_str, s: s_str } }) 
    })
      .then(res => res.text())
      .then(data => console.log("✔️ 저장 완료:", data))
      .catch(err => console.error("❌ 저장 실패:", err));

    alert('✅ 얼굴 등록 및 암호화 완료');
  };

  const handleSaveForServer = async () => {
    if (!modelsLoaded) return alert('모델이 아직 로드되지 않았습니다.');
  
    const embedding = await extractEmbedding();
    if (!embedding) return alert('❗ 얼굴을 찾을 수 없습니다.');
  
    const { c1, c2, s } = encryptEmbedding(embedding).full;
  
    const c1_str = c1.map(x => x.toString());
    const c2_str = c2.map(x => x.toString());
    const s_str = s.map(x => x.toString()); // ✅ 배열 형태로 변환
  
    const json = JSON.stringify({ c1: c1_str, c2: c2_str, s: s_str }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = "received_vector.json";
    a.click();
  
    URL.revokeObjectURL(url);
    alert("✅ 비교용 암호문 저장 완료: received_vector.json");
  };
  

  const handleTestSave = async () => {
    if (!modelsLoaded) return alert('모델 로드 중입니다.');
    const embedding = await extractEmbedding();
    if (!embedding) return alert('❗ 얼굴을 찾을 수 없습니다.');

    const { c1, c2 } = encryptEmbedding(embedding).full;
    const c1_str = c1.map(x => x.toString());
    const c2_str = c2.map(x => x.toString());

    const blob = new Blob([JSON.stringify({ c1: c1_str, c2: c2_str }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "encrypted_test_vector.json";
    a.click();
    URL.revokeObjectURL(url);
    alert("✅ 테스트용 암호문 저장 완료 (JSON)");
  };

  const handleVerify = async () => {
    if (!modelsLoaded) return alert('아직 모델이 로드되지 않았습니다.');
    const embedding = await extractEmbedding();
    if (!embedding) return alert('❗ 얼굴을 찾을 수 없습니다.');

    const { c1, c2 } = encryptEmbedding(embedding).full;
    const c1_str = c1.map(x => x.toString());
    const c2_str = c2.map(x => x.toString());

    const email = localStorage.getItem("email");
    if (!email) return alert("이메일 정보가 없습니다.");

    fetch("https://faceauthserver.shop/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, vector: { c1: c1_str, c2: c2_str } })
    })
      .then(res => res.json())
      .then(data => {
        console.log("🔍 인증 결과:", data);
        alert(data.match ? "✅ 얼굴 인증 성공!" : "❌ 얼굴 인증 실패");
      })
      .catch(err => {
        console.error("❌ 인증 요청 실패:", err);
        alert("❌ 서버 오류");
      });
  };

  const handleCompareWithServerResult = async () => {
    try {
      // 서버(Spring Boot)에서 d1, d2, d3 받아오기
      const email = localStorage.getItem("email");
      if (!email) return alert("이메일 정보가 없습니다.");
  
      const res = await fetch(`https://faceauthserver.shop/api/compare/result?email=${email}`);
      const { d1, d2, d3 } = await res.json();
  
      // 시크릿키 불러오기
      const s_str = localStorage.getItem("secretKey");
      if (!s_str) return alert("Secret key가 없습니다. 먼저 얼굴을 등록하세요.");
  
      const s = JSON.parse(s_str).map(BigInt);
      const d1_bi = d1.map(BigInt);
      const d2_bi = d2.map(BigInt);
      const d3_bi = d3.map(BigInt);
  
      // 거리 계산
      const distance = evaluateDistanceSquared(d1_bi, d2_bi, d3_bi, s);
      console.log(`📏 복호화된 거리 제곱값: ${distance}`);
      alert(`🔍 두 벡터 간 거리 ≈ ${distance.toFixed(6)}`);
    } catch (err) {
      console.error("❌ 거리 비교 실패:", err);
      alert("❗ 거리 계산 중 오류 발생");
    }
  };
  

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '2rem',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#212529' }}>🔐 얼굴 인증 시스템</h2>
  
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="640"
        height="480"
        style={{
          border: '2px solid #dee2e6',
          borderRadius: '12px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          marginBottom: '1rem'
        }}
      />
  
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button className="primary-button" onClick={handleCapture}>얼굴 등록</button>
        <button className="primary-button" onClick={handleVerify}>얼굴 인증</button>
        <button className="secondary-button" onClick={handleTestSave}>📥 암호문 저장</button>
        <button className="secondary-button" onClick={handleVerifyDecryption}>🔍 복호화 검증</button>
      </div>
    </div>
  );
  
}

export default FaceEmbedding;