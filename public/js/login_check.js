document.addEventListener("DOMContentLoaded", function () {
  logincheck("main");
});
async function logincheck(event) {
  const menuManager = document.getElementById("Menu-bar_Manager");
  const menuMember = document.getElementById("Menu-bar_Member");
  const loginBefore = document.getElementById("login_before");
  const loginAfter = document.getElementById("login_after");
  const loginCheckUrl = 'http://127.0.0.1:8000/api/login-check/';
  const actionDiv = document.getElementById("my_review_actions");
  try {
  const response = await fetch(loginCheckUrl, {
    method: 'GET',
    credentials: 'include', // 쿠키 포함
  })
  const data = await response.json();
    if(event ==="review"){
      return data.is_authenticated;
    }
    if (data.is_authenticated) {
      if(loginBefore) loginBefore.style.display = "none";
      if(loginAfter) loginAfter.style.display = "block";

      if(menuMember) menuMember.style.display = "flex"; 
      if(menuManager) menuManager.style.display = "none"; 
    }else{
      // 메뉴 숨김
      if(menuManager) menuManager.style.display = "none";
      if(menuMember) menuMember.style.display = "none";
      
      // 로그인 버튼 보이기
      if(loginBefore) loginBefore.style.display = "block";
      if(loginAfter) loginAfter.style.display = "none";
    
    return;
    } 
  }catch(error) {
    console.error('로그인 체크 오류:', error);
  }  
}

async function logout(){
  try{ 
  const logoutUrl = 'http://127.0.0.1:8000/api/logout/';
  const response = await fetch(logoutUrl, {
    method: 'POST',
    credentials: 'include', // 쿠키 포함
  })
  if (!response.ok) {
      throw new Error('로그아웃 실패');
    }
    alert("로그아웃 되었습니다.");
    return response.json();
    
  } catch(error) {
    console.error('로그아웃 오류:', error);
  } finally {
    // 페이지 새로고침 또는 메인 페이지로 이동
    window.location.href = "Main.html";
  }
}