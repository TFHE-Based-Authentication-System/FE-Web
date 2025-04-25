import "./SignupForm.css";

function SignupForm({ showLogin, showMain }) {
  return (
    <div className="signup-container">
      {/* ← 홈으로 버튼 */}
      <button onClick={showMain} className="back-button">
        ← 홈으로
      </button>

      <h1 className="signup-title">회원가입 ✨</h1>
      <p className="signup-subtext">AI 얼굴 인증 서비스를 이용하려면 회원가입하세요</p>

      <form className="signup-form">
        <input type="email" placeholder="아이디(이메일)를 입력하세요" />
        <input type="text" placeholder="닉네임을 입력하세요" />
        <input type="password" placeholder="비밀번호를 입력하세요" />
        <input type="password" placeholder="비밀번호 확인" />

        <button type="submit" className="primary-button">회원가입</button>
        <button type="button" onClick={showLogin} className="secondary-button">
          로그인으로 돌아가기
        </button>
      </form>
    </div>
  );
}

export default SignupForm;
