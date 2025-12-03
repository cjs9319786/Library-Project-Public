let join_members = [];
let currentPage = 1;
const itemsPerPage = 15;
const pagesPerGroup = 5;

document.addEventListener("DOMContentLoaded", async () => {
  const join_btn = document.getElementById("join_member_btn"); //전체회원조회버튼
  const join_member_list = document.getElementById("join_member_List"); //회원 목록 추가할 리스트
  const form = document.getElementById("searchForm");
  const admin_btn = document.getElementById("modify_admin_btn");

  const list_Page = document.getElementById("list_Page");
  const delete_btn = document.getElementById("delete_btn");
  //전체회원정보 불러오기
  join_btn.addEventListener("click", async function () {
    try {
      const response = await fetch("엔드포인트", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      //전체회원정보를 join_members에 담기 *TODO*
      join_members = result.map((row) => ({

      }));
      console.log(join_members);
      display_Member_list(1);
    } catch (error) {
      console.error("서버통신오류", error);
    }
  });
  //회원검색
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (document.querySelector("#search_Bar").value == "") {
      alert("검색어를 입력해주세요");
      return;
    }
    const searchInput = document.getElementById("search_Bar").value;
    try {
      const response = await fetch("/search/search_Member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: searchInput }),
      });
      const result = await response.json();

      if (result.isFalse == 1) {
        alert("검색 결과가 없습니다!");
        return;
      }
      //검색된 회원정보를 join_members에 담기 *TODO*
      join_members = result.map((row) => ({

      }));
      display_Member_list(1);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  });

  //회원 리스트 생성
  function display_Member_list(page) {
    currentPage = page;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = join_members.slice(startIndex, endIndex);
    // /* 기존 리스트 초기화 *TODO*
    join_member_list.innerHTML = `<div class="top">
`;

    currentItems.forEach((item) => {
      const divItem = document.createElement("div");
      divItem.classList.add("li-item");
      // *TODO*
      divItem.innerHTML = `

          <div class="modify"><input type="button" class="btn" id="modify_btn_${item.num}" value="수정" onclick="change_Modify(${item.num})"></div>
          `;
      join_member_list.appendChild(divItem);
    });
    createPaginationButtons();
  }
  //관리자로 수정 *TODO*
  admin_btn.addEventListener("click", async function () {
    const member_id = document.getElementById("p_id").textContent;

    try {
      await fetch("엔드포인트", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: member_id }),
      });
      alert("변경성공");
      location.reload();
    } catch (error) {
      console.error("서버통신오류", error);
    }
  });
  //회원 삭제 *TODO*
  delete_btn.addEventListener("click", async function () {
    const id = document.getElementById("p_id").textContent;
    try {
      await fetch("엔드포인트", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: id }),
      });
      alert("삭제성공");
      location.reload();
    } catch (error) {
      console.error("서버통신오류", error);
    }
  });
});
 //페이지네이션 생성
  function createPaginationButtons() {
    const totalPages = Math.ceil(join_members.length / itemsPerPage);

    list_Page.querySelectorAll(".bt,.num_p").forEach((btn) => btn.remove());

    const firstPageBtn = document.createElement("a");
    firstPageBtn.href = "#";
    firstPageBtn.className = "bt first";
    firstPageBtn.textContent = "<<";
    firstPageBtn.addEventListener("click", () => display_Member_list(1));

    const prevPageBtn = document.createElement("a");
    prevPageBtn.href = "#";
    prevPageBtn.className = "bt prev";
    prevPageBtn.textContent = "<";
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) display_Member_list(currentPage - 1);
    });

    const nextPageBtn = document.createElement("a");
    nextPageBtn.href = "#";
    nextPageBtn.className = "bt next";
    nextPageBtn.textContent = ">";
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) display_Member_list(currentPage + 1);
    });

    const lastPageBtn = document.createElement("a");
    lastPageBtn.href = "#";
    lastPageBtn.className = "bt last";
    lastPageBtn.textContent = ">>";
    lastPageBtn.addEventListener("click", () => display_Member_list(totalPages));

    const startPage = Math.floor((currentPage - 1) / pagesPerGroup) * pagesPerGroup + 1;
    const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

    // 페이지 버튼 생성
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("a");
      pageBtn.href = "#";
      pageBtn.className = "num_p";
      pageBtn.textContent = i;
      pageBtn.dataset.page = i;
      pageBtn.addEventListener("click", (e) => {
        e.preventDefault();
        display_Member_list(i);
      });
      if (i === currentPage) {
        pageBtn.classList.add("on");
      }
      list_Page.appendChild(pageBtn);
    }
    // 이전 페이지, 다음 페이지, 첫 페이지, 마지막 페이지 버튼을 추가합니다.
    list_Page.prepend(firstPageBtn, prevPageBtn);
    list_Page.append(nextPageBtn, lastPageBtn);
  }
