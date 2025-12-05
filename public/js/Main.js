let booksArr = []; // 검색 결과를 저장할 배열
let currentPage = 1;
const itemsPerPage = 10;
const pagesPerGroup = 5;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  const boardPage = document.getElementById("board_page");
  const board = document.getElementById("Result_list");

  // 1. 책 검색 함수
  async function search(search_value) {
    try {
      const searchParams = search_value.toString();
      // 엔드포인트: views.py의 search_books와 연결됨
      const endUrl = `http://127.0.0.1:8000/api/books/?q=${searchParams}`;
      
      const response = await fetch(endUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      // 결과가 없거나 비어있는 경우 처리
      if (!result.books || result.books.length === 0) {
        alert("검색 결과가 없습니다!");
        // 검색 결과가 없으면 리스트를 비웁니다
        booksArr = [];
        display_book_list(1);
        return;
      }

      /* 서버 데이터 매핑 수정
       views.py에서 보내주는 키값:
       isbn, title, author, publisher__publisher_name, category__category_name
       
       * 설명(info)은 서버에서 안 보내주므로 기본값 처리합니다.
       -> 이미지 url 들어간 데이터셋으로 구성한다면, 백엔드 수정 필요
      */
      booksArr = result.books.map((row) => ({
        isbn: row.isbn,
        title: row.title,
        author: row.author,
        publisher: row.publisher__publisher_name,
        category: row.category__category_name,
        amount: row.stock_count !== undefined ? row.stock_count : 0,
        rating: row.avg_rating ? parseFloat(row.avg_rating).toFixed(1) : "0.0",
        image_url: row.image_url
      }));

      console.log("Mapped Books:", booksArr);
      
      display_book_list(1);
      openList(); // 결과창 열기

    } catch (error) {
      console.error("Error fetching search results:", error);
      alert("서버 통신 중 오류가 발생했습니다.");
    }
  }

  // 검색 폼 제출 이벤트
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const searchInput = document.getElementById("booksearch_input");
    if (searchInput.value.trim() == "") {
      alert("검색어를 입력해주세요");
      return;
    }
    search(searchInput.value);
  });

  // 책 목록 표시 함수
  function display_book_list(page) {
    currentPage = page;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = booksArr.slice(startIndex, endIndex);

    // 헤더 다시 그리기
    board.innerHTML = `<div class="top">
      <div class="b_title">책 제목</div>
      <div class="b_writer">저자</div>
      <div class="b_publish">출판사</div>
      <div class="b_amount">수량</div>
    </div>`;

    if (currentItems.length === 0) {
        board.innerHTML += `<div class="li-item" style="justify-content:center; padding:20px;">검색 결과가 없습니다.</div>`;
        return;
    }

    currentItems.forEach((item) => {
      const divItem = document.createElement("div");
      divItem.classList.add("li-item");
      
      // 제목 클릭 시 display_Detail 함수에 ISBN(문자열)을 전달
      divItem.innerHTML = `
        <div class="b_num" id="b_num_${item.isbn}" style="display:none">${item.isbn}</div>
        <div class="b_title">
            <a onclick="display_Detail('${item.isbn}')" style="cursor: pointer; font-weight: bold; color: #333;">
                ${item.title}
            </a>
        </div>
        <div class="b_writer">${item.author}</div>
        <div class="b_publish">${item.publisher}</div>
        <div class="b_amount">${item.amount}</div>
        `;
      board.appendChild(divItem);
    });
    
    createPaginationButtons();
  }

  // 페이지네이션 함수
  function createPaginationButtons() {
    const totalPages = Math.ceil(booksArr.length / itemsPerPage);
    boardPage.querySelectorAll(".bt,.num_p").forEach((btn) => btn.remove());

    if (totalPages === 0) return;

    const createBtn = (cls, text, onClick) => {
        const btn = document.createElement("a");
        btn.href = "#";
        btn.className = cls;
        btn.textContent = text;
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            onClick();
        });
        return btn;
    };

    boardPage.prepend(createBtn("bt prev", "<", () => { if (currentPage > 1) display_book_list(currentPage - 1); }));
    boardPage.prepend(createBtn("bt first", "<<", () => display_book_list(1)));
    
    boardPage.append(createBtn("bt next", ">", () => { if (currentPage < totalPages) display_book_list(currentPage + 1); }));
    boardPage.append(createBtn("bt last", ">>", () => display_book_list(totalPages)));

    const startPage = Math.floor((currentPage - 1) / pagesPerGroup) * pagesPerGroup + 1;
    const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = createBtn("num_p", i, () => display_book_list(i));
      pageBtn.dataset.page = i;
      if (i === currentPage) pageBtn.classList.add("on");
      boardPage.insertBefore(pageBtn, boardPage.querySelector(".bt.next"));
    }
  }
});

// 페이지 이동 함수
function navigateToPage() {
  window.location.href = "Main.html";
}

// 상세 정보 보여주기 (서버 데이터 기반)
// [전역 변수 추가] 현재 보고 있는 책의 ISBN과 내 리뷰 ID 저장용
let currentIsbn = null;
let myReviewId = null;

// 상세 정보 보여주기 (수정됨: 최신 데이터 Fetch 적용)
async function display_Detail(isbn) {
  currentIsbn = isbn; // 현재 ISBN 저장
  myReviewId = null;  // 리뷰 ID 초기화

  // 1. 일단 기존 booksArr에서 기본 정보를 찾아 빠르게 보여줌 (화면 깜빡임 방지)
  const cachedBook = booksArr.find(book => String(book.isbn) === String(isbn));
  if (cachedBook) {
      document.getElementById("p_title").textContent = cachedBook.title;
      // ... 기타 기본 정보들 ...
  }
  
  const modal = document.getElementById("modal_overlay");
  modal.style.display = "flex";

  try {
      // 2. [핵심] 서버에서 최신 도서 정보(평점 포함)를 다시 가져옴
      const response = await fetch(`http://127.0.0.1:8000/api/books/${isbn}/`);
      if (!response.ok) throw new Error("도서 정보 로드 실패");
      
      const bookData = await response.json();

      // 3. 받아온 최신 데이터로 화면 업데이트
      document.getElementById("p_title").textContent = bookData.title;
      document.getElementById("p_writer").textContent = bookData.author;
      document.getElementById("p_publish").textContent = bookData.publisher_name;
      document.getElementById("p_info").textContent = bookData.info || "책 소개가 없습니다.";
      document.getElementById("p_num").textContent = bookData.isbn;
      
      // 수량은 API에 없으면 cachedBook에서 가져오거나, 
      // views.py book_detail에 stock_count 추가 필요 (여기선 일단 cachedBook 사용)
      if (cachedBook) {
          document.getElementById("p_amount").textContent = cachedBook.amount;
      }

      // [중요] 평점(별) 업데이트 로직
      const ratingVal = parseFloat(bookData.rating); // 서버에서 받은 최신 평점
      const fullStars = Math.floor(ratingVal);
      const emptyStars = 5 - fullStars;
      const starStr = "⭐".repeat(fullStars) + "☆".repeat(emptyStars);
      
      document.getElementById("p_stars").textContent = starStr;
      document.getElementById("p_rating_value").textContent = `(${ratingVal.toFixed(1)})`;

      // 이미지 업데이트
      const imageElement = document.getElementById("Detail_image");
      if (imageElement) {
          if (bookData.image_url && bookData.image_url.trim() !== "") {
              imageElement.innerHTML = `
                <img src="${bookData.image_url}"
                     alt="${bookData.title}" 
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 5px;">
              `;
          } else {
              imageElement.innerHTML = `
                <div style="width:100%; height:100%; background:#eee; display:flex; align-items:center; justify-content:center; color:#888;">
                    이미지 없음
                </div>`;
          }
      }

  } catch (error) {
      console.error(error);
      alert("최신 도서 정보를 불러오는데 실패했습니다.");
  }

  // 리뷰 관련 UI 초기화 및 데이터 로드
  closeReviewForm();                                            
  document.getElementById("my_review_actions").innerHTML = "";  
  await loadMyReviewStatus(isbn);                               
  await loadAllReviews(isbn);                                   
}

// 내 대여/리뷰 상태 확인 및 버튼 표시
async function loadMyReviewStatus(isbn) {
    const actionDiv = document.getElementById("my_review_actions");

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/books/${isbn}/status/`, {
            method: "GET",
            headers: { 
                "Content-Type": "application/json" 
            },
            credentials: "include" // 세션 쿠키를 서버로 전송 (로그인 인식됨)
        });
        const data = await response.json();

        // 서버가 "인증되지 않음"이라고 응답하거나, JS단에서 토큰이 없는 경우
        if (!data.is_authenticated) {
            actionDiv.innerHTML = "<p style='color:gray; font-size:14px;'>로그인 후 리뷰를 작성할 수 있습니다.</p>";
            return;
        }

        if (data.my_review) {
            // 이미 리뷰를 쓴 경우 -> 수정/삭제 버튼 노출
            myReviewId = data.my_review.review_id; 
            actionDiv.innerHTML = `
                <span style="color:blue; font-weight:bold;">내가 쓴 리뷰가 있습니다.</span>
                <button onclick="openReviewForm('edit', '${data.my_review.rating}', '${data.my_review.content}')">수정</button>
                <button onclick="deleteReview()">삭제</button>
            `;
        } else if (data.has_borrowed) {
            // 리뷰는 없지만 책을 빌린 적이 있는 경우 -> 등록 버튼 노출
            actionDiv.innerHTML = `
                <button onclick="openReviewForm('create')" style="background-color:green; color:white; padding:5px 10px; border-radius:5px;">리뷰 등록하기</button>
            `;
        } else {
            // 빌린 적도 없는 경우
            actionDiv.innerHTML = "<p style='color:gray; font-size:14px;'>이 도서를 대여한 이력이 있어야 리뷰를 작성할 수 있습니다.</p>";
        }

    } catch (error) {
        console.error("상태 확인 실패:", error);
    }
}
// 리뷰 폼 열기/닫기/제출
function openReviewForm(mode, rating=5, content="") {
    const form = document.getElementById("review_form_container");
    form.style.display = "block";
    
    // 입력창 초기화
    document.getElementById("review_rating").value = rating;
    document.getElementById("review_content").value = content;
    
    // 모드(등록/수정)를 데이터 속성에 저장
    form.dataset.mode = mode;
}

function closeReviewForm() {
    document.getElementById("review_form_container").style.display = "none";
}

// 리뷰 등록하기
async function submitReview() {
    const form = document.getElementById("review_form_container");
    const mode = form.dataset.mode; 
    
    const rating = document.getElementById("review_rating").value;
    const content = document.getElementById("review_content").value;

    let url = "";
    let bodyData = {};

    if (mode === 'create') {
        url = "http://127.0.0.1:8000/api/reviews/create/";
        bodyData = { isbn: currentIsbn, rating: rating, content: content };
    } else {
        url = `http://127.0.0.1:8000/api/reviews/update/${myReviewId}/`;
        bodyData = { rating: rating, content: content };
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Authorization 헤더 제거 (쿠키 인증 사용)
            },
            credentials: "include", // 쿠키 전송
            body: JSON.stringify(bodyData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            // 화면 갱신
            display_Detail(currentIsbn);
        } else {
            alert("실패: " + (result.error || "알 수 없는 오류"));
        }
    } catch (error) {
        console.error("리뷰 저장 오류:", error);
    }
}

// 리뷰 삭제하기
// Django API에서 리뷰 삭제는 주어지지 않아 작성하지 않았습니다.

// 전체 리뷰 목록 가져오기
async function loadAllReviews(isbn) {
    const listDiv = document.getElementById("reviews_list");
    listDiv.innerHTML = "로딩 중...";

    try {
        // views.py의 read_reviews 엔드포인트 호출
        const response = await fetch(`http://127.0.0.1:8000/api/books/${isbn}/reviews/`);
        const data = await response.json();

        if (!data.reviews || data.reviews.length === 0) {
            listDiv.innerHTML = "<p>등록된 리뷰가 없습니다.</p>";
            return;
        }

        let html = "";
        data.reviews.forEach(review => {
            const stars = "⭐".repeat(review.rating);
            html += `
                <div style="border-bottom:1px solid #eee; padding: 10px 0;">
                    <div style="font-size:12px; color:gray;">
                        <span>${review.member__login_id}</span> | <span>${review.created_at.substring(0,10)}</span>
                    </div>
                    <div style="color:#f39c12;">${stars}</div>
                    <div>${review.content}</div>
                </div>
            `;
        });
        listDiv.innerHTML = html;

    } catch (error) {
        listDiv.innerHTML = "리뷰를 불러올 수 없습니다.";
        console.error(error);
    }
}

// 모달 닫기 기능
function closeDetail() {
  const modal = document.getElementById("modal_overlay");
  if (modal) {
    modal.style.display = "none";
  }
}


// 리스트 열고 닫기 UI 함수
function openList() {
  document.getElementById("search_Result").style.display = "block";
}

function closeList() {
  document.getElementById("search_Result").style.display = "none";
  // 리스트 닫을 때 상세창도 같이 닫으려면 아래 주석 해제
  // document.getElementById("Result_Detail").style.display = "none";
}