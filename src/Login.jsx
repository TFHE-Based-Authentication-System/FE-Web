import React, { useState } from "react";
import "./SignupForm.css"; // 스타일 재활용
import axios from "axios";

function Login({ onLoginSuccess, showSignUp, showMain }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://faceauthserver.shop/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),  // 🔹 혹시 모를 공백 제거
          password: password
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(data.name);
      } else {
        console.error("❗ 서버 응답 에러:", data);
        alert("로그인 실패: " + (data.message || "서버 응답 오류"));
      }
    } catch (err) {
      console.error("❗ 네트워크 에러:", err);
      alert("서버 오류 발생");
    }
  };
  
  
  
  
  

  return (
    <div className="signup-container">
      <button onClick={showMain} className="back-button">← 홈으로</button>
      <h1 className="signup-title">로그인 🔐</h1>
      <p className="signup-subtext">AI 얼굴 인증 서비스를 이용하려면 로그인하세요</p>
      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="primary-button">로그인</button>
        <button type="button" onClick={showSignUp} className="secondary-button">회원가입하기</button>
      </form>
    </div>
  );
}

export default Login;