let currentPage = 1;
const itemsPerPage = 10;
const pagesPerGroup = 5;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  const boardPage = document.getElementById("board_page");
  const board = document.getElementById("Result_list");
  /*아래함수는 책검색 담당부분 구조는 
    1.검색어파라미터를> searchParams로 사용할수있게 변환 
    2.endUrl에 엔드포인트 설정후에
    3.const responese =await fetch 통해서 json형태 응답값받음 구조 
    >> 주석부분은 참고용으로 제가 변경전, 변경후는 비주석처리*/
  async function search(search_value) {
    try {
      const searchParams = search_value.toString( );
      console.log("Searching for:", searchParams);
      const endUrl = `http://127.0.0.1:8000/api/books/?q=${searchParams}`;
      const response = await fetch(endUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.isFalse == 1) {
        alert("검색 결과가 없습니다!");
        return;
      }
      /* 이전꺼
      books = result.map((row) => ({
        b_num: row.b_num,
        b_writer: row.b_writer,
        b_info: row.b_info,
        b_title: row.b_title,
        b_publish: row.b_publish,
        b_amount: row.b_amount,
        b_image: row.b_image,
      }));
        이후꺼>*/ booksArr = result.books.map((row) => ({
        isbn: row.isbn,
        category: row.category__category_name,
        author: row.author,
        publisher: row.publisher__publisher_name,
        title: row.title,
      }));
      console.log("Search results:", booksArr);
      
      display_book_list(1);
      openList();

    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const search_value = document.getElementById("booksearch_input").value;
    if (document.querySelector("#booksearch_input").value == "") {
      alert("검색어를 입력해주세요");
      return;
    }
    search(search_value);
  });
// 책 목록 표시 함수   *TODO*
  function display_book_list(page) {
    currentPage = page;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = booksArr.slice(startIndex, endIndex);

    board.innerHTML = `<div class="top">
      <div class="b_title">책 제목</div>
      <div class="b_writer">저자</div>
      <div class="b_publish">출판사</div>
      <div class="b_amount">수량</div>
    </div>`;
    currentItems.forEach((item) => {
      const divItem = document.createElement("div");
      divItem.classList.add("li-item");
      /*이전꺼 
      divItem.innerHTML = `
        <div class="b_num" id="b_num_${item.b_num}" style="display:none">${item.b_num}</div>
        <div class="b_title" id="b_title_${item.b_num}"><a onclick="display_Detail(${item.b_num})" style="cursor: pointer">${item.b_title}</a></div>
        <div class="b_writer" id="b_writer_${item.b_num}">${item.b_writer}</div>
        <div class="b_publish" id="b_publish_${item.b_num}">${item.b_publish}</div>
        <div class="b_amount" id="b_amount_${item.b_num}">${item.b_amount}</div>
        <div class="b_image" id="b_image_${item.b_num}" style="display: none">${item.b_image}</div>
        <div class="b_info" id="b_info_${item.b_num}" style="display: none">${item.b_info}</div>
        `;
      이후꺼>*/divItem.innerHTML = `
        <div class="b_num" id="b_num_${item.isbn}" style="display:none">${item.isbn}</div>
        <div class="b_title" id="b_title_${item.isbn}"><a onclick="display_Detail(${item.title})" style="cursor: pointer">${item.title}</a></div>
        <div class="b_writer" id="b_writer_${item.isbn}">${item.author}</div>
        <div class="b_publish" id="b_publish_${item.isbn}">${item.publisher}</div>
        `;
      board.appendChild(divItem);
    });
    // 페이지네이션 버튼 생성
    createPaginationButtons();
  }
 /* 페이지네이션 관련 함수*/
  function createPaginationButtons() {
    const totalPages = Math.ceil(booksArr.length / itemsPerPage);
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
});
// Main.html로 이동
function navigateToPage() {
  window.location.href = "Main.html";
}
//세부항목보여주기인데 수정예정. *TODO*
function display_Detail(num) {
  document.getElementById("Result_Detail").style.display = "block";
  document.getElementById("p_title").textContent = document.getElementById(`b_title_${num}`).textContent;
  document.getElementById("p_writer").textContent = document.getElementById(`b_writer_${num}`).textContent;
  document.getElementById("p_publish").textContent = document.getElementById(`b_publish_${num}`).textContent;
  document.getElementById("p_info").textContent = document.getElementById(`b_info_${num}`).textContent;
  document.getElementById("p_amount").textContent = document.getElementById(`b_amount_${num}`).textContent;
  document.getElementById("p_num").textContent = num;
  const image_Url = document.getElementById(`b_image_${num}`).textContent;
  const imageElement = document.getElementById("Detail_image");
  imageElement.innerHTML = `<img src="${image_Url}" alt="이미지 설명" class="b_image">`;
}

function openList() {
  document.getElementById("search_Result").style.display = "block";
}
function closeList() {
  document.getElementById("search_Result").style.display = "none";
}
