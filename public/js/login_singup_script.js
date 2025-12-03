document.addEventListener("DOMContentLoaded", function () {
  // DOM 요소 가져오기
  const checkIdButton = document.getElementById("check_id");
  const checkIdPass = document.getElementById("check_id_pass");
  const checkIdNonPass = document.getElementById("check_id_nonpass");
  const checkEmailButton = document.getElementById("check_email"); 
  const checkEmailPass = document.getElementById("check_email_pass");
  const checkEmailNonPass = document.getElementById("check_email_nonpass");
  const member_id_input = document.getElementById("member_id");
  const change_id_btn = document.getElementById("change_id");
  
  // 상태 변수
  let isIdChecked = false;
  // 이메일 체크 버튼이 없으면 true로 두어 가입 막히지 않게 함 (있다면 false로 시작)
  let isEmailChecked = checkEmailButton ? false : true; 

  // 1. ID 중복 체크 설정
  function setupIdCheck() {
    checkIdButton.addEventListener("click", async function () {
      const idValue = member_id_input.value.trim();
      if(!idValue) {
        alert("아이디를 입력해주세요.");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/check-id/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_id: idValue }),
        });
        
        const result = await response.json();

        if (result.status === "error") {
          // 중복됨
          checkIdPass.style.display = "none";
          checkIdNonPass.style.display = "block";
          isIdChecked = false;
        } else {
          // 사용 가능
          checkIdPass.style.display = "block";
          checkIdNonPass.style.display = "none";
          isIdChecked = true;
          
          // 아이디 수정 불가 처리
          member_id_input.readOnly = true;
          change_id_btn.style.display = "block"; // "ID 바꾸기" 버튼 표시
          checkIdButton.style.display = "none";  // "중복확인" 버튼 숨김
        }
      } catch (error) {
        console.error(error);
        alert("서버 통신 오류");
      }
    });

    // ID 바꾸기 버튼 클릭 시 초기화
    change_id_btn.addEventListener("click", function() {
      member_id_input.readOnly = false;
      member_id_input.value = "";
      change_id_btn.style.display = "none";
      checkIdButton.style.display = "block";
      checkIdPass.style.display = "none";
      checkIdNonPass.style.display = "none";
      isIdChecked = false;
    });
  }

  // 2. 회원가입 폼 제출 (JSON 전송)
  document.getElementById("signupForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // 기본 폼 제출 막기

    // 유효성 검사
    if (!isIdChecked) {
      alert("ID 중복 확인을 해주세요.");
      return;
    }
    
    // 데이터 매핑 (HTML id -> DB 필드명)
    // views.py의 signup 함수가 기대하는 키: login_id, password, first_name, email, birth_date, phone_number
    const formData = {
      login_id: document.getElementById("member_id").value,
      password: document.getElementById("password").value,
      first_name: document.getElementById("name").value,
      birth_date: document.getElementById("birthdate").value,
      phone_number: document.getElementById("hp").value,
      email: document.getElementById("email").value
    };
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert("회원가입 성공! 로그인해주세요.");
        window.location.reload(); // 혹은 로그인 화면으로 전환 함수 호출
      } else {
        alert(result.error || "회원가입 실패");
      }
    } catch (error) {
      console.error(error);
      alert("회원가입 요청 중 오류 발생");
    }
  });


  // 3. 로그인 폼 제출
  document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const formData = new FormData(this);
    const data = {
      login_id: formData.get("id"), // HTML name="id"
      password: formData.get("password"),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Main.js 호환용 토큰 처리 (세션 방식이지만 로컬스토리지에 플래그 저장)
        localStorage.setItem("authToken", "session_active");
        localStorage.setItem("loginId", result.user.login_id);
        
        alert(result.message);
        window.location.href = "Main.html";
      } else {
        alert(result.error || "로그인 실패");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  });

  // 초기화 함수 실행
  setupIdCheck();
  // setupEmailCheck(); // 이메일 버튼이 HTML에 있다면 주석 해제
});