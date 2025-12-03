document.addEventListener("DOMContentLoaded", function () {
  // 1. 로컬 스토리지에서 저장된 토큰(플래그) 가져오기
  const token = localStorage.getItem("authToken");
  
  // HTML 요소 가져오기 (오류 방지를 위해 변수에 담음)
  const menuManager = document.getElementById("Menu-bar_Manager");
  const menuMember = document.getElementById("Menu-bar_Member");
  const loginBefore = document.getElementById("login_before");
  const loginAfter = document.getElementById("login_after");

  // 2. 토큰이 없을 때 (비로그인 상태)
  if (!token) {
    console.log("비로그인 상태");
    
    // 메뉴 숨김
    if(menuManager) menuManager.style.display = "none";
    if(menuMember) menuMember.style.display = "none";
    
    // 로그인 버튼 보이기
    if(loginBefore) loginBefore.style.display = "block";
    if(loginAfter) loginAfter.style.display = "none";
    
    return;
  }

  // 3. 토큰이 있을 때 (로그인 상태)
  console.log("로그인 상태 확인됨");
  
  // 로그인 버튼 숨기고 로그아웃 버튼 보이기
  if(loginBefore) loginBefore.style.display = "none";
  if(loginAfter) loginAfter.style.display = "block";

  // 메뉴 보이기 (우선 일반 회원 메뉴를 기본으로 보여줍니다)
  // 관리자 여부는 현재 로컬 스토리지에 저장하지 않았으므로 기본적으로 회원 메뉴를 띄웁니다.
  if(menuMember) menuMember.style.display = "flex"; 
  if(menuManager) menuManager.style.display = "none"; 

  // 만약 관리자 메뉴를 띄워야 한다면, 로그인 시 localStorage에 'role'을 저장하고
  // 여기서 if (localStorage.getItem('role') === 'admin') 조건을 추가해야 합니다.
});