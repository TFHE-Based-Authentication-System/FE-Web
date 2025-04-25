import "./SignupForm.css";

function SignupForm() {
  return (
    <div className="signup-container">
      <h1 className="signup-title">
        회원가입 <span className="sparkles">✨</span>
      </h1>
      <p className="signup-subtext">
        AI 얼굴 인증 서비스를 이용하려면 회원가입하세요
      </p>
      <form className="signup-form">
        <input type="email" placeholder="아이디(이메일)를 입력하세요" />
        <input type="text" placeholder="닉네임을 입력하세요" />
        <input type="password" placeholder="비밀번호를 입력하세요" />
        <input type="password" placeholder="비밀번호 확인" />
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
}

export default SignupForm;
