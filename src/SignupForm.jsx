import { useState } from "react";
import "./SignupForm.css";
import axios from "axios";

function SignupForm({ showLogin, showMain }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }

    try {
      const response = await axios.post("https://faceauthserver.shop/api/user/signup", {
        email,
        password,
        name
      });

      if (response.data.includes("회원가입이 완료되었습니다")) {
        alert("✅ 회원가입 완료! 로그인 해주세요.");
        showLogin(); // 로그인 화면으로 전환
      } else {
        alert("❗ 회원가입 실패: " + response.data);
      }
    } catch (err) {
      console.error(err);
      alert("❗ 서버 오류 발생");
    }
  };

  return (
    <div className="signup-container">
      <button onClick={showMain} className="back-button">
        ← 홈으로
      </button>
      <h1 className="signup-title">회원가입 ✨</h1>
      <p className="signup-subtext">AI 얼굴 인증 서비스를 이용하려면 회원가입하세요</p>
      <form className="signup-form" onSubmit={handleSignup}>
        <input type="email" placeholder="아이디(이메일)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="text" placeholder="닉네임" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="비밀번호 확인" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />

        <button type="submit" className="primary-button">회원가입</button>
        <button type="button" onClick={showLogin} className="secondary-button">
          로그인으로 돌아가기
        </button>
      </form>
    </div>
  );
}

export default SignupForm;
