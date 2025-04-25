// FaceNetEmbedder.jsx
import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

function FaceNetEmbedder({ onEmbeddingReady, isRegistering }) {
  const videoRef = useRef(null);
  const [blazeModel, setBlazeModel] = useState(null);
  const [faceNetModel, setFaceNetModel] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      const blaze = await blazeface.load();
      setBlazeModel(blaze);
      const facenet = await tf.loadGraphModel("/facenet/model.json");
      setFaceNetModel(facenet);
    };

    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    };

    loadModels();
    startCamera();
  }, []);

  const handleCapture = async () => {
    if (!blazeModel || !faceNetModel) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageTensor = tf.browser.fromPixels(canvas);
    const predictions = await blazeModel.estimateFaces(imageTensor, false);

    if (predictions.length > 0) {
      const face = predictions[0];
      const [x, y, w, h] = [
        face.topLeft[0],
        face.topLeft[1],
        face.bottomRight[0] - face.topLeft[0],
        face.bottomRight[1] - face.topLeft[1],
      ];

      const cropped = tf.image.cropAndResize(
        imageTensor.expandDims(0),
        [[y / canvas.height, x / canvas.width, (y + h) / canvas.height, (x + w) / canvas.width]],
        [0], [160, 160]
      );

      const preprocessed = cropped.div(255);
      const embedding = await faceNetModel.predict(preprocessed).data();

      onEmbeddingReady(Array.from(embedding));
      alert("✅ 얼굴 임베딩 추출 완료!");
    } else {
      alert("❗️얼굴을 찾을 수 없습니다.");
    }
    imageTensor.dispose();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="320"
        height="240"
        style={{ borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
      ></video>
      <br />
      <button onClick={handleCapture} style={{ marginTop: "10px", padding: "10px 20px" }}>
        얼굴 캡처 및 임베딩 추출
      </button>
    </div>
  );
}

export default FaceNetEmbedder;
