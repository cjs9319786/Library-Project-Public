let join_members = [];
document.addEventListener("DOMContentLoaded", () => {
  const loan_info = document.getElementById("loan_info");
  
  // ***수정*** 회원 정보 불러오기
  async function load_member_info() {
    // 토큰 확인 (로그인 여부 체크용)
    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("로그인 정보가 없습니다. 로그인 페이지로 이동합니다.");
        window.location.href = "Login.html";
        return;
    } 

    try {
      console.log("회원 정보 요청 시작...");
      const response = await fetch("http://127.0.0.1:8000/api/me/", {
        method: "GET",
        credentials: "include", // 세션 쿠키 전송
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
      });
      
      // [디버깅] 서버 응답 상태 확인
      if (!response.ok) {
          const errText = await response.text();
          throw new Error(`서버 응답 오류 (Status: ${response.status})\n내용: ${errText}`);
      }

      const data = await response.json();
      console.log("받아온 회원 데이터:", data); // F12 콘솔에서 확인 가능

      // [디버깅] 데이터가 비어있는지 확인
      if (!data.login_id) {
          alert("서버에서 회원 정보를 받아왔으나, 데이터가 비어있습니다. (콘솔 확인 필요)");
      }

      /* 데이터 채워넣기 
         (undefined가 들어오면 화면에 '정보없음'이라고 뜨도록 처리)
      */
      setText("p_id", data.login_id);
      setText("p_name", data.first_name);
      setText("p_email", data.email);
      setText("p_hp", data.phone_number);
      setText("p_birth_date", data.birth_date);

      // 고정값 혹은 없는 값 처리
      setText("p_num", "-"); 
      
      // 관리자 여부 표시 (HTML에 p_admin 태그가 있어서 추가함)
      if(data.is_staff || data.is_superuser) {
        setText("p_admin", "관리자");
      } else {
        setText("p_admin", "일반회원");
      }

      // 상태 표시
      let statusText = data.status || "상태미상"; 
      if (data.overdue_end_date) {
          statusText += ` (~${data.overdue_end_date} 정지)`;
      }
      setText("p_panalty_count", statusText);

    } catch (error) {
      console.error("회원 정보 로딩 에러:", error);
      alert("회원 정보를 불러오지 못했습니다.\n원인: " + error.message);
    }
  }


  // ***수정*** 대여/반납 목록 불러오기
  async function load_loan_info() {
    const strong = document.getElementById("strong_none");
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/me/borrows/", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        console.error("대여 기록 조회 실패:", response.status);
        // 대여 기록 조회 실패는 알림까지 띄우진 않고 콘솔에만 기록
        return;
      }
      
      const result = await response.json();
      const borrows = result.borrows;

      if (!borrows || borrows.length === 0) {
        if(strong) strong.style.display = "block";
        return;
      } else {
        if(strong) strong.style.display = "none";
      }

      loan_info.innerHTML = ""; 

      borrows.forEach((item) => {
        const divItem = document.createElement("div");
        divItem.classList.add("li-item");
        
        let stateStr = "대여중";
        let stateColor = "green";
        
        if (item.return_date) {
            stateStr = `반납완료 (${item.return_date})`;
            stateColor = "gray";
        } else {
            const today = new Date().toISOString().split('T')[0];
            if (item.due_date < today) {
                stateStr = "연체중";
                stateColor = "red";
            }
        }
        const extendStr = item.is_extended ? "<span style='font-size:12px; color:blue;'>(연장)</span>" : "";

        // 스타일 적용
        divItem.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 15px 10px; border-bottom: 1px solid #ddd; font-size: 14px;";

        divItem.innerHTML = `
            <div style="flex: 2; font-weight: bold; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                ${item.book__isbn__title || "제목 없음"}
            </div>
            <div style="flex: 1; text-align: center;">${item.borrow_date}</div>
            <div style="flex: 1.2; text-align: center;">~ ${item.due_date} ${extendStr}</div>
            <div style="flex: 1; color: ${stateColor}; font-weight: bold; text-align: right;">${stateStr}</div>
        `;
        loan_info.appendChild(divItem);
      });

    } catch (error) {
      console.error("대여 기록 로딩 에러:", error);
    }
  }

  // 텍스트 설정 함수: load_member_info에서 반복 호출
function setText(id, text) {
      const el = document.getElementById(id);
      if (el) { // 값이 없으면 '정보없음' 표시
          el.textContent = (
            text === null || text === undefined || text === "") ? "-" : text;
      }
  }

  // 페이지 로드 시 실행
  load_member_info();
  load_loan_info();
});
