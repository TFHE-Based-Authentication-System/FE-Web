import * as faceapi from 'face-api.js';
import { encryptEmbedding } from "./encryptor";
import { useEffect, useRef, useState } from 'react';

function FaceEmbedding({ onEmbeddingReady }) {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const downloadEmbeddingWithName = (data, filename) => {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  

  useEffect(() => {
    async function loadModels() {
      await Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68'),
        faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector'),
      ]);
      setModelsLoaded(true);
    }
  
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    }
  
    loadModels();
    startCamera();
  }, []);

  const handleCapture = async () => {
    if (!modelsLoaded) {
      alert('아직 모델이 로드되지 않았습니다.');
      return;
    }
  
    const video = videoRef.current;
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    
      if (detection) {
        const embedding = Array.from(detection.descriptor); 
        console.log('✅ 얼굴 임베딩 벡터:', embedding);
        downloadEmbeddingWithName(embedding, "embedding_plain.json");     // 원본
      
        const ciphertext = encryptEmbedding(embedding); // 🔐 자동 암호화
        console.log("🔐 암호화된 결과:", ciphertext);
        
        downloadEmbeddingWithName(ciphertext, "embedding_encrypted.json"); // 암호문


      
        onEmbeddingReady(ciphertext); // ← 이걸로 전달 변경도 고려 가능
        alert('✅ 얼굴 임베딩 및 암호화 완료');
    } else {
      alert('❗ 얼굴을 찾을 수 없습니다.');
    }
  };
  

  return (
    <div style={{ textAlign: 'center' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="320"
        height="240"
        style={{ border: '1px solid black' }}
      />
      <br />
      <button onClick={handleCapture}>얼굴 캡처 & 임베딩 뽑기</button>
    </div>
  );
}

export default FaceEmbedding;
