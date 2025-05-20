// App.jsx (Landing Section)
import React, { useState } from "react";
import Login from "./Login";
import SignupForm from "./SignupForm";
import FaceNetEmbedder from "./FaceNetEmbedder";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nickname, setNickname] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isRegistering, setIsRegistering] = useState(true);

  const handleLoginSuccess = (name) => {
    setNickname(name);
    setIsLoggedIn(true);
    setShowLogin(false);
    setShowSignUp(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setNickname("");
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        showLogin ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            showSignUp={() => {
              setShowSignUp(true);
              setShowLogin(false);
            }}
            showMain={() => setShowLogin(false)}
          />
        ) : showSignUp ? (
          <SignupForm
            showLogin={() => {
              setShowLogin(true);
              setShowSignUp(false);
            }}
            showMain={() => setShowSignUp(false)}
          />
        ) : (
          <div className="landing-container">
            <h1 className="landing-title">FaceAuth <span role="img">🔍</span></h1>
            <p className="landing-subtitle">AI 얼굴 인증 서비스를 시작해보세요</p>
            <div className="landing-buttons">
              <button className="main-button" onClick={() => setShowLogin(true)}>로그인</button>
              <button className="main-button-outline" onClick={() => setShowSignUp(true)}>회원가입</button>
            </div>
          </div>
        )
      ) : (
        <div className="main-container">
          <h1>환영합니다, {nickname}님 👋</h1>
          <p>이제 얼굴 등록 또는 인증을 시작할 수 있어요.</p>
          <div className="button-group">
            <button className="main-button" onClick={() => {
              setIsRegistering(true);
              setShowCamera(true);
            }}>
              얼굴 등록
            </button>
            <button className="main-button-outline" onClick={() => {
              setIsRegistering(false);
              setShowCamera(true);
            }}>
              얼굴 인증
            </button>
            <button onClick={handleLogout} className="main-button-outline">로그아웃</button>
          </div>
          {showCamera && (
            <FaceNetEmbedder
              onEmbeddingReady={() => {}}
              isRegistering={isRegistering}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;