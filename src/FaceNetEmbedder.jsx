import * as faceapi from 'face-api.js';

import {
  encryptEmbedding,
  decryptEmbedding,
  evaluateDistanceSquared,
  verifyDecryptionTable,
  Q,
  DELTA,
  
} from "./encryptor";

import { useEffect, useRef, useState } from 'react';

function downloadSecretKey(s) {
  const s_str = s.map(x => x.toString());  // BigInt → 문자열
  const blob = new Blob([JSON.stringify(s_str)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'secret_key_s.json';
  a.click();

  URL.revokeObjectURL(url);
}
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
    if (!modelsLoaded) return alert("모델이 아직 로드되지 않았습니다.");
    const embedding = await extractEmbedding();
    if (!embedding) return alert("❗ 얼굴을 찾을 수 없습니다.");
  
    const { c1, c2, s, originalIFFT } = encryptEmbedding(embedding).full;
    const decrypted = decryptEmbedding(c1, c2, s);
    const approx = decrypted;
  
    verifyDecryptionTable(originalIFFT, approx); // ✅ 여기서 표와 오차 자동 출력
    alert("✅ 복호화 검증 완료. 콘솔에서 비교 결과를 확인하세요.");
  };
  

  const handleCapture = async () => {
    if (!modelsLoaded) return alert('아직 모델이 로드되지 않았습니다.');
    const embedding = await extractEmbedding();
    if (!embedding) return alert('❗ 얼굴을 찾을 수 없습니다.');

    const { c1, c2 ,s} = encryptEmbedding(embedding).full;
    const c1_str = c1.map(x => x.toString());
    const c2_str = c2.map(x => x.toString());
    const s_str = s.map(x => x.toString());
    
    downloadSecretKey(s); // ✅ 여기에 넣기

    const userId = localStorage.getItem("userId");
    if (!userId || isNaN(userId)) return alert("유저 정보가 없습니다.");
    localStorage.setItem("secretKey", JSON.stringify(s_str));

    fetch("https://faceauthserver.shop/api/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // ✅ 서버에 보낼 벡터에서 s 제거
      body: JSON.stringify({ userId: Number(userId), vector: { c1: c1_str, c2: c2_str } })

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
    localStorage.setItem("secretKey", JSON.stringify(s_str));

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

  
  function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  

  
  

  const handleCompareWithServerResult = async () => {
    try {
      const email = localStorage.getItem("email");
      if (!email) return alert("이메일 정보가 없습니다.");
  
      const s_str = localStorage.getItem("secretKey");
      if (!s_str) return alert("Secret key가 없습니다. 먼저 얼굴을 등록하세요.");
      const s = JSON.parse(s_str).map(BigInt);
  
      const embedding = await extractEmbedding();
      if (!embedding) return alert("❗ 얼굴을 찾을 수 없습니다.");
  
      const { c1, c2 } = encryptEmbedding(embedding).full;
      
      // 디버깅을 위한 로그 추가
      console.log("c1 첫 5개 값:", c1.slice(0, 5).map(x => x.toString()));
      console.log("c2 첫 5개 값:", c2.slice(0, 5).map(x => x.toString()));
  
      // BigInt를 문자열로 변환 (소수점 제거)
      const c1_str = c1.map(x => {
        const str = x.toString();
        // 소수점이 있다면 제거
        return str.includes('.') ? str.split('.')[0] : str;
      });
      const c2_str = c2.map(x => {
        const str = x.toString();
        return str.includes('.') ? str.split('.')[0] : str;
      });
  
      // 서버에 암호문 전송
      const res = await fetch("https://faceauthserver.shop/api/features/coefficients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, c1: c1_str, c2: c2_str })
      });
  
      const responseJson = await res.json();
      if (!Array.isArray(responseJson) || responseJson.length === 0) {
        console.error("❌ 서버에서 유효한 응답 없음");
        alert("❌ 비교 결과가 올바르지 않습니다.");
        return;
      }
  
      // 서버에서 받은 d1, d2, d3를 BigInt로 변환
      const d1 = responseJson.map(item => BigInt(item.a));
      const d2 = responseJson.map(item => BigInt(item.b));
      const d3 = responseJson.map(item => BigInt(item.c));
      console.log("d2 길이:", d2.length);
      console.log("s 길이:", s.length);
        // 예시: d2, s를 파일로 저장

      // downloadJSON("d1.json", d2.map(x => x.toString())); // d2는 BigInt 배열
      // downloadJSON("d2.json", d2.map(x => x.toString())); // d2는 BigInt 배열
      // downloadJSON("d3.json", d2.map(x => x.toString())); // d2는 BigInt 배열
      // // downloadJSON("d2.json", d2.map(x => x.toString())); // d2는 BigInt 배열
      // // downloadJSON("s.json", s.map(x => x.toString()));   // s도 BigInt 배열
  
  
      // 거리 계산
      const distance = evaluateDistanceSquared(d1, d2, d3, s);
      console.log(`📏 복호화된 거리 ≈ ${distance}`);
      // BigInt를 Number로 변환 후 toFixed 사용
      const distanceNum = Number(distance);
      alert(`🔍 거리 ≈ ${distanceNum.toFixed(6)} (0에 가까우면 동일인)`);
  
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
        <button className="primary-button" onClick={handleCompareWithServerResult}>얼굴 인증</button>
        <button className="secondary-button" onClick={handleTestSave}>📥 암호문 저장</button>
        <button className="secondary-button" onClick={handleVerifyDecryption}>🔍 복호화 검증</button>
      </div>
    </div>
  );
  
}

export default FaceEmbedding;