let join_members = [];
document.addEventListener("DOMContentLoaded", () => {
  const loan_info = document.getElementById("loan_info");
  //현재회원정보 가져오기  *TODO*
  async function load_data() {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("엔드포인트", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      console.log(response)
      return data;
    } catch (error) {
      console.error("Error:", error);
      window.location.href = "Notice.html";
    }
  }
  //회원정보 서버에서 검색후 보여주기 *TODO*
  async function load_member_info() {
    const data = await load_data();
    console.log(data.id);
    const searchInput = data.id;
    try {
      const response = await fetch("엔드포인트", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: searchInput }),
      });
      const result = await response.json();

      if (result.isFalse == 1) {
        alert("검색 결과가 없습니다!");
        return;
      }
         //*TODO*
      join_members = result.map((row) => ({
      }));
      change_Modify();
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  }
  //회원 대출기록 검색후 보여주기 *TODO*
  async function load_loan_info() {
    const strong = document.getElementById("strong_none");
    const data = await load_data();
    const searchInput = data.id;
    try {
      //엔드포인트 설정 후 응답받은 데이터를 새로 선언한  객체에 저장후에 사용.
      const response = await fetch("사용할 엔드포인트", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: searchInput }),
      });
      const result = await response.json();

      if (result.isFalse == 1) {
        alert("반납할 책이 없습니다.");
        return;
      }
      strong.style.display = "none";
      //*TODO*
      returns = result.map((row) => ({

      })); 
    
      //*TODO*
      loan_info.innerHTML = ``;

      returns.forEach((item) => {
        if (item.b_extension == 1) {
          item.b_extension = "Y";
        } else {
          item.b_extension = "N";
        }
        const divItem = document.createElement("div");
        divItem.classList.add("li-item");
        // *TODO*
        divItem.innerHTML = `  
        `;
        loan_info.appendChild(divItem);
      });
    } catch (error) {
      console.error("서버오류:", error);
    }
  }
  //화면변경 *TODO*
  function change_Modify() {
    console.log(join_members[0]);
    document.getElementById("p_num").textContent = join_members[0].num;
    document.getElementById("p_id").textContent = join_members[0].member_id;
    document.getElementById("p_name").textContent = join_members[0].name;
    document.getElementById("p_gender").textContent = join_members[0].gender;
    document.getElementById("p_email").textContent = join_members[0].email;
    document.getElementById("p_hp").textContent = join_members[0].hp;
    document.getElementById("p_signup_date").textContent = join_members[0].signup_date;
    document.getElementById("p_birth_date").textContent = join_members[0].birthdate;
    document.getElementById("p_panalty_count").textContent = join_members[0].penalty_count;
  }
  load_member_info();
  load_loan_info();
});
