document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("authToken");
  console.log("토큰존재 확인");
  // 토큰의 존재로 로그인 여부 확인
  if (!token) {
    document.getElementById("Menu-bar_Manager").style.display = "none";
    document.getElementById("Menu-bar_Member").style.display = "none";
    console.log("토큰존재 없음");
    return;
  }
  console.log("토큰존재 있음");
  console.log(token);
  try {
    const response = await fetch("/login/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("네트워크 이상.");
    }

    const data = await response.json();

    console.log(data);
    if (!data.valid) {
      localStorage.removeItem("authToken");
      window.location.href = "login.html";
    } else {
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      if (data.admin == 1) {
        document.getElementById("Menu-bar_Manager").style.display = "block";
        document.getElementById("Menu-bar_Member").style.display = "none";
      } else {
        document.getElementById("Menu-bar_Manager").style.display = "none";
        document.getElementById("Menu-bar_Member").style.display = "block";
      }
      document.getElementById("login_before").style.display = "none";
      document.getElementById("login_after").style.display = "block";
    }
  } catch (error) {
    console.error("Error:", error);
    window.location.href = "Login.html";
  }
});
