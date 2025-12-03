let currentPage = 1; //현재 페이지 번호 변수
const itemsPerPage = 8; // 한 페이지에 표시할 아이템 수
const pagesPerGroup = 5; // 한 그룹에 표시할 페이지 수
let books = []; // 검색 결과를 저장할 배열
let returns = []; // 반납 검색 결과를 저장할 배열

//페이지의 Dom요소가 로드된 후 실행됨.
document.addEventListener("DOMContentLoaded", () => {
  const boardPage = document.getElementById("board_page"); // 페이지 네비게이션 요소
  const board = document.getElementById("result_book_div"); // 도서 검색 결과를 표시할 요소
  const user_search_btn = document.getElementById("user_search_btn"); // 회원 검색 버튼
  const book_search_btn = document.getElementById("book_search_btn"); // 도서 검색 버튼
  const return_search_btn = document.getElementById("return_search_btn"); // 반납 검색 버튼
  const loan_btn = document.getElementById("loan_btn"); // 대출 버튼
  const p_id = document.getElementById("p_id"); //회원id
  const p_name = document.getElementById("p_name"); //회원이름
  const p_gender = document.getElementById("p_gender"); //회원 성별
  const p_email = document.getElementById("p_email"); //회원 email
  const p_hp = document.getElementById("p_hp"); //회원 전화번호
  const p_penalty_count = document.getElementById("p_penalty_count"); //회원 위반횟수
  const p_loan_check = document.getElementById("p_loan_check"); //회원 대출가능표시 요소
  const result_return_div = document.getElementById("result_return_div"); //반납검색 결과표시요소

  /**
    회원 검색 버튼 클릭 이벤트.
    입력된 회원 ID를 가져와 서버로 보낸뒤 서버에서 해당 ID의 회원 정보를 응답하면 요소를 표시.
   */
  user_search_btn.addEventListener("click", async function () {
    const search_value = document.getElementById("user_search_input").value;
    if (search_value == "") {
      alert("검색어를 입력해주세요");
      return;
    }

    try {
      const response = await fetch("/search/search_Member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: search_value }),
      });
      const result = await response.json();
      if (result.isFalse == 1) {
        alert("정확한 ID값을 입력하세요");
        return;
      }
      if (result[0].admin_a == 1) {
        alert("관리자 id입니다. 관리자는 대출기능을 이용할 수 없습니다.");
        return;
      }
      if (result[0].loan_count >= 3 || result[0].penalty_count > 3) {
        p_loan_check.textContent = "No";
        p_loan_check.style.color = "Red";
      } else {
        p_loan_check.textContent = "Yes";
        p_loan_check.style.color = "blue";
      }
      p_id.textContent = result[0].member_id;
      p_name.textContent = result[0].name;
      p_gender.textContent = result[0].gender;
      p_email.textContent = result[0].email;
      p_hp.textContent = result[0].hp;
      p_penalty_count.textContent = result[0].penalty_count;
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  });

  /**
    도서 검색 버튼 클릭 이벤트 입력받은 도서제목값을 서버에 보내서
    응답받은 도서 데이터를 BOOKS배열에 저장, 공지사항 생성 메서드로 인자를 넘겨서 호출.
   */
  book_search_btn.addEventListener("click", async function () {
    const searchInput = document.getElementById("book_search_input").value;
    if (searchInput === "") {
      alert("검색어를 입력해주세요");
      return;
    }
    try {
      const response = await fetch("/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ b_title: searchInput }),
      });
      const result = await response.json();

      if (books.isFalse == 1) {
        alert("검색 결과가 없습니다!");
        return;
      }

      books = result.map((row) => ({
        b_num: row.b_num,
        b_title: row.b_title,
        b_amount: row.b_amount,
      }));

      display_book_list(1);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  });
  /**
    도서 목록을 표시하는 함수
    배열내의 아이템갯수를 계산하여 설정된 값만큼 잘라서 표시하며,
    innerhtml을 통해 div내에 직접 아이템을 생성.
   * @param {현재 페이지}} page
   */
  function display_book_list(page) {
    currentPage = page;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = books.slice(startIndex, endIndex);

    board.innerHTML = `<div class="top">
          <div class="b_num">책 번호</div>
          <div class="b_title">책 제목</div>
          <div class="b_amount">책 수량</div>
        </div>`;
    currentItems.forEach((item) => {
      const divItem = document.createElement("div");
      divItem.classList.add("li-item");
      divItem.innerHTML = `
            <div class="b_num" id="b_num_${item.b_num}">${item.b_num}</div>
            <div class="b_title" id="b_title_${item.b_num}"><a onclick="display_div(${item.b_num})" style="cursor: pointer">${item.b_title}</a></div>
            <div class="b_amount" id="b_amount_${item.b_num}">${item.b_amount}</div>
          `;
      board.appendChild(divItem);
    });
    // 페이지네이션 버튼 생성
    createPaginationButtons();
  }


  // 책 대여 기능
  loan_btn.addEventListener("click", async function () {
    const b_amount = document.getElementById("b_amount").textContent;
    const p_loan_check = document.getElementById("p_loan_check").textContent;
    const book_number = document.getElementById("b_num").textContent;
    const book_title = document.getElementById("b_title").textContent;
    console.log(book_number);
    if (p_loan_check == "") {
      alert("대출자(회원)을 검색해주세요.");
      return;
    }
    if (b_amount == 0) {
      alert("해당 책의 재고 부족으로 대출 불가.");
      return;
    }
    if (p_loan_check == "No") {
      alert("연체횟수가 많아 대출이 제한됩니다.");
      return;
    }
    const data = {
      member_id: p_id.textContent,
      b_num: book_number,
      b_title: book_title,
    };

    try {
      const response = await fetch("/loan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const result = await response.json();
        console.log(result.isFalse);
        if (result.isFalse == 1) {
          alert("중복 대출입니다.");
          return;
        } else {
          alert(`${result.member_id}님의 대출 기록이 정상적으로 추가되었습니다.
            ${result.s_date}부터~ ${result.e_dateFormatted}까지 입니다.`);
          window.location.href = "CheckBook.html";
        }
      } else {
        alert("대출 기록 추가중 오류 발생");
        return;
      }
    } catch (error) {
      console.error("Error during loan process:", error);
    }
  });
  //책반납 버튼 이벤트리스너 메서드
  return_search_btn.addEventListener("click", async function () {
    const searchInput = document.getElementById("return_search_input").value;
    if (searchInput == "") {
      alert("회원 ID를 입력해주세요");
      return;
    }

    try {
      const response = await fetch("/loan/search_return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: searchInput }),
      });
      const result = await response.json();
      if (result.isFalse == 2) {
        alert("정확한 ID값을 입력하세요");
        return;
      } else if (result.isFalse == 1) {
        alert("반납할 책이 없습니다.");
        return;
      }

      console.log(result);
      returns = result.map((row) => ({
        member_id: row.member_id,
        b_num: row.b_num,
        b_title: row.b_title,
        s_date: row.s_date,
        e_date: row.e_date,
        b_extension: row.b_extension,
      }));
      //도서목록,공지사항목록 등 표시하는 방법과 같은 방법
      result_return_div.innerHTML = `<div class="top">
          <div class="b_num">책 번호</div>
          <div class="b_title">책 제목</div>
          <div class="s_date">대여일</div>
          <div class="e_date">반납일</div>
          <div class="del_btn"> 반납버튼</div>
        </div>`;

      returns.forEach((item) => {
        const divItem = document.createElement("div");
        divItem.classList.add("li-item");
        divItem.innerHTML = `
          <div class="b_num" id="b_num_${item.b_num}">${item.b_num}</div>
          <div class="member_id" id="id_${item.b_num}" style="display:none">${item.member_id}</div>
          <div class="b_title" id="b_title_${item.b_num}">${item.b_title}</div>
          <div class="s_date" id="s_date_${item.b_num}">${item.s_date}</div>
          <div class="e_date" id="e_date_${item.b_num}">${item.e_date}</div>
          <div class="del_btn" id="del_btn_${item.b_num}"><input type="button" class="del_button" onclick="return_book(${item.b_num})" value="반납"></div>
        `;
        result_return_div.appendChild(divItem);
      });
    } catch (error) {
      console.error("서버오류:", error);
    }
  });
});

function navigateToPage() {
  window.location.href = "Main.html";
}
  //페이지네이션 버튼생성코드
  function createPaginationButtons() {
    const totalPages = Math.ceil(books.length / itemsPerPage);
    console.log(totalPages);
    boardPage.querySelectorAll(".bt,.num_p").forEach((btn) => btn.remove());

    const firstPageBtn = document.createElement("a");
    firstPageBtn.href = "#";
    firstPageBtn.className = "bt first";
    firstPageBtn.textContent = "<<";
    firstPageBtn.addEventListener("click", () => display_book_list(1));

    const prevPageBtn = document.createElement("a");
    prevPageBtn.href = "#";
    prevPageBtn.className = "bt prev";
    prevPageBtn.textContent = "<";
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) display_book_list(currentPage - 1);
    });

    const nextPageBtn = document.createElement("a");
    nextPageBtn.href = "#";
    nextPageBtn.className = "bt next";
    nextPageBtn.textContent = ">";
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) display_book_list(currentPage + 1);
    });

    const lastPageBtn = document.createElement("a");
    lastPageBtn.href = "#";
    lastPageBtn.className = "bt last";
    lastPageBtn.textContent = ">>";
    lastPageBtn.addEventListener("click", () => display_book_list(totalPages));

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
        display_book_list(i);
      });
      if (i === currentPage) {
        pageBtn.classList.add("on");
      }
      boardPage.appendChild(pageBtn);
    }
    // 이전 페이지, 다음 페이지, 첫 페이지, 마지막 페이지 버튼을 추가합니다.
    boardPage.prepend(firstPageBtn, prevPageBtn);
    boardPage.append(nextPageBtn, lastPageBtn);
  }
