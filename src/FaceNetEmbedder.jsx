// import * as faceapi from 'face-api.js';
// import { encryptEmbedding, decryptEmbedding } from "./encryptor";


// import { useEffect, useRef, useState } from 'react';

// function FaceEmbedding({ onEmbeddingReady }) {
//   const videoRef = useRef(null);
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const downloadEmbeddingWithName = (data, filename) => {
//     const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     a.click();
//     URL.revokeObjectURL(url);
//   };
  
  

//   useEffect(() => {
//     async function loadModels() {
//       await Promise.all([
//         faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition'),
//         faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68'),
//         faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector'),
//       ]);
//       setModelsLoaded(true);
//     }
  
//     async function startCamera() {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       videoRef.current.srcObject = stream;
//     }
  
//     loadModels();
//     startCamera();
//   }, []);
  
//   function isValidVector(vec) {
//     return Array.isArray(vec) &&
//            vec.length === 256 &&
//            vec.every(x => typeof x === "number" && isFinite(x));
//   }
  
  
//   const handleCapture = async () => {
//     if (!modelsLoaded) {
//       alert('아직 모델이 로드되지 않았습니다.');
//       return;
//     }
  
//     const video = videoRef.current;
//     const detection = await faceapi
//       .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
//       .withFaceLandmarks()
//       .withFaceDescriptor();
  
//     if (detection) {
//       const embedding = Array.from(detection.descriptor);
//       console.log('✅ 얼굴 임베딩 벡터:', embedding);
//       // downloadEmbeddingWithName(embedding, "embedding_plain.json");
  
//       // 암호화
//       const ciphertext = encryptEmbedding(embedding);
//       console.log("🔐 암호화된 결과:", ciphertext);
  
//       // 복호화
//       const { c1, c2, s, originalIFFT } = ciphertext.full;
//       const decrypted = decryptEmbedding(c1, c2, s);
//       console.log("🔓 복호화된 벡터 (앞 10개):", decrypted.slice(0, 10));
//       console.log("🎯 원래 IFFT 벡터 (앞 10개):", originalIFFT.slice(0, 10).map(z => z.re));
      
//       // // ⬇️ 복호화 결과 저장
//       // downloadEmbeddingWithName(decrypted, "decrypted.json");

//       // // ⬇️ 원래 IFFT 결과 저장 (re값만)
//       // const reOnly = originalIFFT.map(z => z.re);
//       // downloadEmbeddingWithName(reOnly, "ifft_original.json");

//       // 오차(MSE) 계산
//       const mse = originalIFFT.reduce((sum, z, i) => {
//         const diff = z.re - decrypted[i];
//         return sum + diff * diff;
//       }, 0) / decrypted.length;
//       console.log(`📉 MSE (Mean Squared Error): ${mse.toExponential(4)}`);
  
//       // 🔽 서버 전송은 일단 비활성화
      
//       const email = localStorage.getItem("email");
      
      
  
      
      

     

//       // ✅ 유효성 체크
//       if (!isValidVector(c1) || !isValidVector(c2)) {
//         console.error("❌ 유효하지 않은 벡터:", { c1, c2 });
//         return;
//       }

//       const userId = localStorage.getItem("userId");
//       if (!userId || isNaN(userId)) {
//         alert("유저 정보가 없습니다.");
//         return;
//       }

      
//       fetch("https://faceauthserver.shop/api/features", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userId: Number(userId),
//           vector: { c1, c2 },
//         }),
//       })
//         .then(async (res) => {
//           const contentType = res.headers.get("content-type");
//           if (contentType && contentType.includes("application/json")) {
//             const data = await res.json();
//             console.log("✔️ 저장 성공 (JSON):", data);
//           } else {
//             const text = await res.text();
//             console.log("✔️ 저장 성공 (TEXT):", text);
//           }
//         })
//         .catch((err) => {
//           console.error("❌ 저장 실패:", err);
//         });
      

      
  
//       // 파일로 저장 (선택)
//       // downloadEmbeddingWithName(ciphertext, "embedding_encrypted.json");
      
  
//       alert('✅ 얼굴 임베딩 및 암호화/복호화 완료');
//     } else {
//       alert('❗ 얼굴을 찾을 수 없습니다.');
//     }
//   };
//   const handleVerify = async () => {
//     if (!modelsLoaded) {
//       alert('아직 모델이 로드되지 않았습니다.');
//       return;
//     }
  
//     const video = videoRef.current;
//     const detection = await faceapi
//       .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
//       .withFaceLandmarks()
//       .withFaceDescriptor();
  
//     if (detection) {
//       const embedding = Array.from(detection.descriptor);
//       const ciphertext = encryptEmbedding(embedding);
//       const { c1, c2 } = ciphertext.full;
  
//       const email = localStorage.getItem("email");
//       if (!email) {
//         alert("이메일 정보가 없습니다.");
//         return;
//       }
  
//       // ✅ 서버로 암호문(c1, c2)과 이메일을 전송해서 얼굴 인증 요청
//       fetch("https://faceauthserver.shop/api/verify", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email: email,
//           vector: { c1, c2 },
//         }),
//       })
//         .then(res => res.json())
//         .then(data => {
//           console.log("🔍 인증 결과:", data);
//           if (data.match) {
//             alert("✅ 얼굴 인증 성공!");
//           } else {
//             alert("❌ 얼굴 인증 실패");
//           }
//         })
//         .catch(err => {
//           console.error("❌ 인증 요청 실패:", err);
//           alert("❌ 서버 오류");
//         });
//     } else {
//       alert('❗ 얼굴을 찾을 수 없습니다.');
//     }
//   };
  
  
//   // const handleCapture = async () => {
//   //   if (!modelsLoaded) {
//   //     alert('아직 모델이 로드되지 않았습니다.');
//   //     return;
//   //   }
  
//   //   const video = videoRef.current;
//   //   const detection = await faceapi
//   //     .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
//   //     .withFaceLandmarks()
//   //     .withFaceDescriptor();
    
//   //     if (detection) {
//   //       const embedding = Array.from(detection.descriptor); 
//   //       console.log('✅ 얼굴 임베딩 벡터:', embedding);
//   //       downloadEmbeddingWithName(embedding, "embedding_plain.json");     // 원본
      
//   //       const ciphertext = encryptEmbedding(embedding); // 🔐 자동 암호화
//   //       console.log("🔐 암호화된 결과:", ciphertext);

//   //       // ✅ 로그인된 사용자 이메일 가져오기
//   //       const email = localStorage.getItem("email");
//   //       const userId = localStorage.getItem("userId");

//   //       fetch(`https://faceauthserver.shop/api/features/${userId}`, {
//   //         method: "POST",
//   //         headers: { "Content-Type": "application/json" },
//   //         body: JSON.stringify({
//   //           userId: userId,
//   //           vector: {
//   //             c1: ciphertext.c1,  // 또는 full.c1
//   //             // c2: ciphertext.c2   // 또는 full.c2
//   //           }
//   //         })
//   //       })
        
//   //         .then(res => res.json())
//   //         .then(data => console.log("✔️ 저장 성공:", data))
//   //         .catch(err => console.error("❌ 저장 실패:", err));
        

        
//   //       downloadEmbeddingWithName(ciphertext, "embedding_encrypted.json"); // 암호문


      
//   //       onEmbeddingReady(ciphertext); // ← 이걸로 전달 변경도 고려 가능
//   //       alert('✅ 얼굴 임베딩 및 암호화 완료');
//   //   } else {
//   //     alert('❗ 얼굴을 찾을 수 없습니다.');
//   //   }
//   // };
  

//   return (
//     <div style={{ textAlign: 'center' }}>
//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         playsInline
//         width="320"
//         height="240"
//         style={{ border: '1px solid black' }}
//       />
//       <br />
//       <button onClick={handleCapture}>얼굴 캡처 & 임베딩 뽑기</button>
//       <button onClick={handleVerify}>얼굴 인증</button>
//     </div>
//   );
// }

// export default FaceEmbedding;

import * as faceapi from 'face-api.js';
import { encryptEmbedding, decryptEmbedding } from "./encryptor";
import { useEffect, useRef, useState } from 'react';

function FaceEmbedding({ onEmbeddingReady }) {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
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

  function isValidVector(vec) {
    return Array.isArray(vec) &&
           vec.length === 256 &&
           vec.every(x => typeof x === "number" && isFinite(x));
  }

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
      const ciphertext = encryptEmbedding(embedding);
      const { c1, c2, s, originalIFFT } = ciphertext.full;
      const decrypted = decryptEmbedding(c1, c2, s);

      const mse = originalIFFT.reduce((sum, z, i) => {
        const diff = z.re - decrypted[i];
        return sum + diff * diff;
      }, 0) / decrypted.length;
      console.log(`📉 MSE (Mean Squared Error): ${mse.toExponential(4)}`);

      const email = localStorage.getItem("email");
      const userId = localStorage.getItem("userId");

      if (!isValidVector(c1) || !isValidVector(c2)) {
        alert("벡터가 유효하지 않습니다.");
        return;
      }

      fetch("https://faceauthserver.shop/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          vector: { c1, c2 },
        }),
      })
        .then(res => res.text())
        .then(data => console.log("✔️ 저장 완료:", data))
        .catch(err => console.error("❌ 저장 실패:", err));

      alert('✅ 얼굴 등록 및 암호화 완료');
    } else {
      alert('❗ 얼굴을 찾을 수 없습니다.');
    }
  };

  // ✅ 추가: 암호문을 JSON으로 저장 (비교 테스트용)
  const handleTestSave = async () => {
    if (!modelsLoaded) {
      alert('모델 로드 중입니다.');
      return;
    }

    const video = videoRef.current;
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert("❗ 얼굴을 찾을 수 없습니다.");
      return;
    }

    const embedding = Array.from(detection.descriptor);
    const ciphertext = encryptEmbedding(embedding);
    const { c1, c2 } = ciphertext.full;

    if (!isValidVector(c1) || !isValidVector(c2)) {
      alert("암호문 형식이 유효하지 않습니다.");
      return;
    }

    const json = { c1, c2 };
    downloadJSON(json, "encrypted_test_vector.json");
    alert("✅ 테스트용 암호문 저장 완료 (JSON)");
  };

  const handleVerify = async () => {
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
      const ciphertext = encryptEmbedding(embedding);
      const { c1, c2 } = ciphertext.full;

      const email = localStorage.getItem("email");
      if (!email) {
        alert("이메일 정보가 없습니다.");
        return;
      }

      fetch("https://faceauthserver.shop/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          vector: { c1, c2 },
        }),
      })
        .then(res => res.json())
        .then(data => {
          console.log("🔍 인증 결과:", data);
          if (data.match) {
            alert("✅ 얼굴 인증 성공!");
          } else {
            alert("❌ 얼굴 인증 실패");
          }
        })
        .catch(err => {
          console.error("❌ 인증 요청 실패:", err);
          alert("❌ 서버 오류");
        });
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
      <button onClick={handleCapture}>얼굴 등록</button>
      <button onClick={handleVerify}>얼굴 인증</button>
      <button onClick={handleTestSave}>📥 비교용 암호문 저장</button>
    </div>
  );
}

export default FaceEmbedding;
