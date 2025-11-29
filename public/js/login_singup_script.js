document.addEventListener("DOMContentLoaded", function () {
  const checkIdButton = document.getElementById("check_id");
  const checkIdPass = document.getElementById("check_id_pass");
  const checkIdNonPass = document.getElementById("check_id_nonpass");
  const checkEmailButton = document.getElementById("check_email");
  const checkEmailPass = document.getElementById("check_email_pass");
  const checkEmailNonPass = document.getElementById("check_email_nonpass");
  var member_id = document.getElementById("member_id");
  var change_id = document.getElementById("change_id"); 
  let isIdChecked = false;
  let isEmailChecked = false;
  //회원가입허용 ID 사전준비

  // 이부분은 제가 수정하겠습니다.
  function setupIdCheck() {
    //ID중복체크
    checkIdButton.addEventListener("click", async function () {
      const id = document.getElementById("member_id").value;

      const response = await fetch("엔드포인트", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: id }),
      });

      const result = await response.json();

      if (result.status == "error") {
        checkIdPass.style.display = "none";
        checkIdNonPass.style.display = "block";
        isIdChecked = false;
      } else {
        checkIdPass.style.display = "block";
        checkIdNonPass.style.display = "none";
        isIdChecked = true;
        member_id.readOnly = true;
        change_id.style.display = "block";
        check_id.style.display = "none";
      }
    });
    //ID 중복체크 여부 검사기
    document.getElementById("signupForm").addEventListener("submit", function (event) {
      if (!isIdChecked) {
        event.preventDefault();
        alert("ID 중복 확인을 해주세요.");
      }
    });
  }
  //회원가입허용 Email 사전준비
  function setupEmailCheck() {
    //Email 중복체크
    checkEmailButton.addEventListener("click", async function () {
      const email = document.getElementById("email").value;

      const response = await fetch("엔드포인트", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      const result = await response.json();
      console.log(result.status);

      if (result.status == "error") {
        checkEmailPass.style.display = "none";
        checkEmailNonPass.style.display = "block";
        isEmailChecked = false;
      } else {
        checkEmailPass.style.display = "block";
        checkEmailNonPass.style.display = "none";
        isEmailChecked = true;
      }
    });
    //Email 검사기
    document.getElementById("signupForm").addEventListener("submit", function (event) {
      if (!isEmailChecked) {
        event.preventDefault();
        alert("이메일 중복 확인을 해주세요.");
      }
    });
  }
  //로그인폼 id/pw값 서버로 보냄
  document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    console.log(formData);
    const data = {
      id: formData.get("id"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.token) {
        localStorage.setItem("authToken", result.token);
        window.location.href = "Main.html";
      } else {
        alert("아이디 혹은 비밀번호가 잘못되었습니다. 다시 입력해주세요");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  });

  setupIdCheck();
  setupEmailCheck();
});
