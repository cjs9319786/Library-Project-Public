let bookArr = [];
let currentPage = 1;
const itemsPerPage = 10;
const pagesPerGroup = 5;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  const boardPage = document.getElementById("board_page");
  const board = document.getElementById("board");
  const reg_btn = document.getElementById("regist-book");
  const fix_btn = document.getElementById("fix-book");
  const del_btn = document.getElementById("delete-book");

  // 1. 페이지 로드 시 카테고리 목록 불러오기 함수 호출
  fetchCategories();

  // 2. 도서 검색 (GET 요청 사용)
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const searchInput = document.getElementById("search_bar").value;

    if (searchInput.trim() === "") {
      alert("검색어를 입력해주세요");
      return;
    }

    try {
      // views.py의 search_books는 GET 요청에 쿼리스트링(?q=...)을 받습니다.
      const response = await fetch(`http://127.0.0.1:8000/api/books/?q=${encodeURIComponent(searchInput)}`);
      const result = await response.json();

      // 결과가 없거나 비어있는 경우
      if (!result.books || result.books.length === 0) {
        alert("검색 결과가 없습니다!");
        booksArr = [];
        display_book_list(1);
        return;
      }

      booksArr = result.books; // 전역 변수에 저장
      display_book_list(1);    // 리스트 출력
      
    } catch (error) {
      console.error("Error fetching search results:", error);
      alert("검색 중 오류가 발생했습니다.");
    }
  });

  // 3. 도서 리스트 출력 (수정 버튼 추가)
  window.display_book_list = function(page) {
      const board = document.getElementById("board");
      const itemsPerPage = 10;
      const startIndex = (page - 1) * itemsPerPage;
      const endItems = booksArr.slice(startIndex, startIndex + itemsPerPage);

      // 리스트 영역에 고정 높이와 스크롤바 적용
      // 높이(500px)는 화면 크기에 맞춰 조절 가능합니다.
      board.style.height = "70%"; 
      board.style.overflowY = "auto";  // 세로 스크롤 활성화
      board.style.overflowX = "hidden"; // 가로 스크롤 숨김
      board.style.borderBottom = "1px solid #ccc"; // 하단 경계선 추가

      // 헤더에 position: sticky 적용 (스크롤 내려도 상단에 고정됨)
      board.innerHTML = `
        <div class="top" style="position: sticky; top: 0; z-index: 1; display: flex; align-items: center; text-align: center; font-weight: bold; padding: 10px 0; border-bottom: 2px solid #333; background-color: #f5f5f5;">
            <div class="num" style="width: 15%;">ISBN</div>
            <div class="title" style="width: 35%;">제목</div>
            <div class="writer" style="width: 15%;">저자</div>
            <div class="publish" style="width: 15%;">출판사</div>
            <div class="date" style="width: 10%;">재고</div>
            <div class="count" style="width: 10%;">관리</div>
        </div>
      `;

      if (endItems.length === 0) {
          board.innerHTML += `<div style="text-align:center; padding:20px;">검색 결과가 없습니다.</div>`;
          return;
      }

      endItems.forEach((item) => {
        const divItem = document.createElement("div");
        divItem.classList.add("li-item");
        
        // 행 스타일: 세로 간격(padding)을 적당히 유지
        divItem.style.display = "flex";
        divItem.style.alignItems = "center";
        divItem.style.padding = "8px 0"; 
        divItem.style.borderBottom = "1px solid #eee";
        divItem.style.textAlign = "center";
        divItem.style.fontSize = "14px"; 
        divItem.style.backgroundColor = "#fff"; // 배경색 지정 (투명하면 겹쳐 보일 수 있음)

        // 긴 텍스트 자르기 스타일 (...)
        const textStyle = "overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 5px;";

        divItem.innerHTML = `
          <div class="num" style="width: 15%; ${textStyle}" title="${item.isbn}">${item.isbn}</div>
          <div class="title" style="width: 35%; text-align:left; ${textStyle}" title="${item.title}">${item.title}</div>
          <div class="writer" style="width: 15%; ${textStyle}" title="${item.author}">${item.author}</div>
          <div class="publish" style="width: 15%; ${textStyle}" title="${item.publisher__publisher_name}">${item.publisher__publisher_name}</div>
          <div class="date" style="width: 10%;">${item.stock_count}권</div>
          <div class="count" style="width: 10%;">
              <button onclick="openEditModal('${item.isbn}')" class="del_button" style="background-color:#4CAF50; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px; font-size:12px;">
                  수정
              </button>
          </div>
        `;
        board.appendChild(divItem);
      });
      
      // 페이지네이션 함수 호출
      createPaginationButtons(); 
  };



  //페이지 생성버튼
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
  // 도서 등록
  reg_btn.addEventListener("click", async function () {
      // 1. HTML 변경에 맞춰 새로운 ID 값들을 가져옴
      const title = document.getElementById("book_title").value;
      const isbn = document.getElementById("book_isbn").value;          // [추가됨]
      const categoryId = document.getElementById("book_category").value; // [추가됨]
      const publisher = document.getElementById("book_publish").value;
      const author = document.getElementById("book_writer").value;
      const count = document.getElementById("book_amount").value;
      const imageUrl = document.getElementById("book_image").value;      // [추가됨]

      // 2. 필수값 체크 로직 변경 (ISBN, 카테고리 포함)
      if (!title || !isbn || !categoryId || !publisher) {
          alert("필수 항목(제목, ISBN, 카테고리ID, 출판사)을 모두 입력해주세요!");
          return;
      }

      // 3. 백엔드(views.py)와 키 이름 맞춤
      const book_obj = {
          isbn: isbn,
          title: title,
          category_id: parseInt(categoryId), // 숫자로 변환
          publisher_name: publisher,
          author: author,
          copy_count: count ? parseInt(count) : 1,
          image_url: imageUrl
      };

      try {
          // 4. 실제 API 주소 및 인증 옵션 추가
          const response = await fetch("http://127.0.0.1:8000/api/admin/books/create/", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              credentials: "include", // [중요] 관리자 세션 쿠키 전송
              body: JSON.stringify(book_obj),
          });

          const result = await response.json();

          if (response.ok) {
              alert("등록 성공: " + result.message);
              location.reload();
          } else {
              alert("등록 실패: " + result.error);
          }
      } catch (error) {
          console.error("Error:", error);
          alert("서버 오류가 발생했습니다.");
      }
  });

  // 전역 함수로 할당 (HTML onclick="ModalVisible(...)"에서 쓰기 위해)
  window.ModalVisible = function(state, isInit) {
      const modal = document.getElementById("book-add-modal-wrap");

      if (isInit) {
          // 입력 필드 초기화
          document.getElementById("book_title").value = "";
          document.getElementById("book_isbn").value = "";
          document.getElementById("book_category").value = "";
          document.getElementById("book_writer").value = "";
          document.getElementById("book_publish").value = "";
          document.getElementById("book_amount").value = "";
          document.getElementById("book_image").value = "";

          // 상태 초기화 (수정 모드에서 잠겼던 것들 풀기)
          document.getElementById("book_isbn").readOnly = false;
          document.getElementById("book_amount").disabled = false;
          document.getElementById("book_amount").readOnly = false;
          document.getElementById("book_num").textContent = "-";

          // 실물 도서 목록(개별 관리) 영역 숨기기
          const listArea = document.getElementById("copy_list_area");
          if(listArea) {
              listArea.style.display = "none"; // 영역 자체를 숨김
          }
          // 혹시 모르니 테이블 내용도 비움
          const tbody = document.getElementById("copy_list_tbody");
          if(tbody) tbody.innerHTML = "";

          // 버튼 상태: 등록 버튼만 보이기
          document.getElementById("regist-book").style.display = "block";
          document.getElementById("fix-book").style.display = "none";
          document.getElementById("delete-book").style.display = "none";
      }
      
      // 모달 보이기/숨기기
      if (modal) {
          modal.style.display = state ? "block" : "none";
      }
  };

  //도서 수정
  fix_btn.addEventListener("click", async function () {
    const b_num = document.getElementById("book_num").textContent;
    const b_title = document.getElementById("book_title").value;
    const b_writer = document.getElementById("book_writer").value;
    const b_publish = document.getElementById("book_publish").value;
    const b_info = document.getElementById("subject").value;
    const b_amount = document.getElementById("book_amount").value;

    const book_obj = {
      b_num: b_num,
      b_title: b_title,
      b_writer: b_writer,
      b_publish: b_publish,
      b_info: b_info,
      b_amount: b_amount,
    };
    console.log(book_obj);
    try {
      const response = await fetch("엔드포인트", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(book_obj),
      });
      const result = await response.text();
      alert(result);
      location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  });
  //도서 삭제
  del_btn.addEventListener("click", async function () {
    const b_num = document.getElementById("book_num").textContent;
    try {
      const response = await fetch("엔드포인트", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ b_num: b_num }),
      });
      const result = await response.text();
      alert(result);
      location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  });
});


// 1. 모달 제어 함수 (HTML에서 onclick으로 호출하므로 window 객체에 등록)
window.ModalVisible = function(state, isInit) {
    const modal = document.getElementById("book-add-modal-wrap");

    if (isInit) {
        // [기본 필드 초기화] - 도서 정보 등록
        document.getElementById("book_title").value = "";
        document.getElementById("book_isbn").value = "";
        document.getElementById("book_category").value = "";
        document.getElementById("book_writer").value = "";
        document.getElementById("book_publish").value = "";
        document.getElementById("book_amount").value = "";
        document.getElementById("book_image").value = "";

        // ISBN, 입고수량 입력창 활성화 (수정 모드에서 비활성화 됐을 수 있으므로)
        document.getElementById("book_isbn").readOnly = false;
        document.getElementById("book_amount").disabled = false;
        document.getElementById("book_amount").readOnly = false;

        // 실물 도서 리스트 영역 숨기기 및 내용 비우기
        const listArea = document.getElementById("copy_list_area");
        if(listArea) listArea.style.display = "none"; // 영역 숨김

        const tbody = document.getElementById("copy_list_tbody");
        if(tbody) tbody.innerHTML = ""; // 테이블 내용 삭제 (중요)

        // 버튼 상태 초기화 (등록 버튼만 보이게)
        document.getElementById("regist-book").style.display = "block";
        document.getElementById("fix-book").style.display = "none";
        document.getElementById("delete-book").style.display = "none";
        document.getElementById("book_num").textContent = "-";
        
    }
    // 모달 보이기/숨기기
    modal.style.display = state ? "block" : "none";
};


// 카테고리 목록 가져오기 함수 정의
async function fetchCategories() {
    try {
        // views.py의 admin_categories API 호출
        // (주의: urls.py에 설정된 실제 URL을 확인해주세요. 예: /api/admin/categories/)
        const response = await fetch("http://127.0.0.1:8000/api/admin/categories/", {
            method: "GET",
            headers: { 
                "Content-Type": "application/json" 
            },
            credentials: "include" // 관리자 권한 확인을 위해 필수
        });

        if (response.ok) {
            const result = await response.json();
            const selectBox = document.getElementById("book_category");

            // 기존 옵션 초기화 (첫 번째 '선택' 옵션만 남기고 삭제)
            selectBox.innerHTML = '<option value="" disabled selected hidden>카테고리 선택 (필수)</option>';

            // 받아온 데이터로 옵션 생성
            // result.categories는 [{category_id: 1, category_name: '소설'}, ...] 형태임
            result.categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.category_id; // 실제 값은 ID (숫자)
                option.textContent = category.category_name; // 화면엔 이름 표시
                selectBox.appendChild(option);
            });
        } else {
            console.error("카테고리 불러오기 실패");
        }
    } catch (error) {
        console.error("통신 오류:", error);
    }
}

// 도서 정보 수정 -> 모달 열기 및 실물 도서 목록 조회 함수
window.openEditModal = async function(isbn) {
    // 1. 모달 열기 (수정 모드)
    ModalVisible(true, false); 
    
    // 버튼 제어
    document.getElementById("regist-book").style.display = "none";
    document.getElementById("fix-book").style.display = "block";
    document.getElementById("delete-book").style.display = "block";
    
    // 실물 도서 리스트 영역 보이기
    const listArea = document.getElementById("copy_list_area");
    if(listArea) listArea.style.display = "block";

    try {
        // 2. 책 상세 정보 가져오기
        const resInfo = await fetch(`http://127.0.0.1:8000/api/books/${isbn}/`);
        if(resInfo.ok) {
            const bookInfo = await resInfo.json();
            document.getElementById("book_title").value = bookInfo.title;
            document.getElementById("book_isbn").value = bookInfo.isbn;
            document.getElementById("book_isbn").readOnly = true; // 수정 불가
            document.getElementById("book_writer").value = bookInfo.author;
            document.getElementById("book_publish").value = bookInfo.publisher_name;
            document.getElementById("book_image").value = bookInfo.image_url;
            
            // 카테고리 선택 (option 텍스트로 찾아서 선택)
            const select = document.getElementById("book_category");
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].text === bookInfo.category_name) {
                    select.selectedIndex = i;
                    break;
                }
            }
        }

        // 3. [핵심] 실물 책 목록 가져오기 API 호출
        const resCopies = await fetch(`http://127.0.0.1:8000/api/admin/books/${isbn}/copies/`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });
        
        const tbody = document.getElementById("copy_list_tbody");
        if(tbody) tbody.innerHTML = ""; // 초기화

        if(resCopies.ok) {
            const data = await resCopies.json();
            if (data.copies.length === 0) {
                tbody.innerHTML = "<tr><td colspan='3'>등록된 실물 도서가 없습니다.</td></tr>";
            } else {
                data.copies.forEach(copy => {
                    const tr = document.createElement("tr");
                    tr.style.borderBottom = "1px solid #eee";
                    tr.innerHTML = `
                        <td style="padding: 8px;">${copy.book_manage_id}</td>
                        <td style="padding: 8px;">${copy.status_display}</td>
                        <td style="padding: 8px;">
                            <button style="font-size:12px; cursor:pointer;" onclick="alert('준비중: ${copy.book_manage_id}')">관리</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }
    } catch(err) {
        console.error("데이터 로딩 실패:", err);
    }
};

// 개별 도서 추가 입고 함수
window.addBookCopies = async function() {
    const isbn = document.getElementById("book_isbn").value;
    const amountInput = document.getElementById("add_copy_amount");
    const amount = amountInput.value;

    if (!amount || amount < 1) {
        alert("1권 이상 입력해주세요.");
        return;
    }

    if (!confirm(`${amount}권을 추가 입고하시겠습니까?`)) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/admin/books/${isbn}/add-copies/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ amount: amount })
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            amountInput.value = 1; // 입력창 초기화
            
            // 목록 갱신 (현재 열려있는 모달의 내용을 다시 불러옴)
            openEditModal(isbn); 
        } else {
            alert("입고 실패: " + result.error);
        }

    } catch (error) {
        console.error("입고 오류:", error);
        alert("서버 통신 중 오류가 발생했습니다.");
    }
};

// 개별 도서 상태 변경 함수
window.updateCopyStatus = async function(bookManageId) {
    // 1) 사용자에게 변경할 상태 입력받기
    const inputStatus = prompt(
        "변경할 상태를 입력하세요.\n(예: 대여가능, 대여중, 분실, 폐기, 0, 1, 2)", 
        ""
    );

    // 취소 버튼 누르면 종료
    if (inputStatus === null) return;
    if (inputStatus.trim() === "") {
        alert("상태값을 입력해주세요.");
        return;
    }

    try {
        // views.py의 admin_update_book_copy 호출
        const response = await fetch(`http://127.0.0.1:8000/api/admin/book-copy/update/${bookManageId}/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status: inputStatus })
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            
            // 목록 갱신을 위해 현재 모달의 ISBN을 다시 로드
            const currentIsbn = document.getElementById("book_isbn").value;
            openEditModal(currentIsbn);
        } else {
            alert("변경 실패: " + (result.error || "알 수 없는 오류"));
        }

    } catch (error) {
        console.error("상태 변경 오류:", error);
        alert("서버 통신 중 오류가 발생했습니다.");
    }
};

// openEditModal 함수에서 '관리' 버튼에 위 함수 연결
window.openEditModal = async function(isbn) {
    // ... (기존 모달 열기 및 도서 상세정보 로드 코드는 동일) ...
    ModalVisible(true, false);
    document.getElementById("regist-book").style.display = "none";
    document.getElementById("fix-book").style.display = "block";
    document.getElementById("delete-book").style.display = "block";
    
    const listArea = document.getElementById("copy_list_area");
    if(listArea) listArea.style.display = "block";

    // 도서 정보 불러오기
    try {
        const resInfo = await fetch(`http://127.0.0.1:8000/api/books/${isbn}/`);
        if(resInfo.ok) {
            const bookInfo = await resInfo.json();
            // ... (기존 값 채우는 로직 동일) ...
            document.getElementById("book_title").value = bookInfo.title;
            document.getElementById("book_isbn").value = bookInfo.isbn; // 여기서 세팅된 값이 addBookCopies에서 쓰임
            document.getElementById("book_isbn").readOnly = true;
            document.getElementById("book_writer").value = bookInfo.author;
            document.getElementById("book_publish").value = bookInfo.publisher_name;
            document.getElementById("book_image").value = bookInfo.image_url;
            document.getElementById("book_amount").value = ""; // 전체 수량은 여기서 의미가 모호하므로 비우거나, views에서 count 보내주면 표시
            document.getElementById("book_amount").disabled = true;

            const select = document.getElementById("book_category");
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].text === bookInfo.category_name) {
                    select.selectedIndex = i;
                    break;
                }
            }
        }
        
        // 실물 책 목록 불러오기
        const resCopies = await fetch(`http://127.0.0.1:8000/api/admin/books/${isbn}/copies/`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });
        
        const tbody = document.getElementById("copy_list_tbody");
        if(tbody) tbody.innerHTML = "";

        if(resCopies.ok) {
            const data = await resCopies.json();
            if (data.copies.length === 0) {
                tbody.innerHTML = "<tr><td colspan='3'>등록된 실물 도서가 없습니다.</td></tr>";
            } else {
                data.copies.forEach(copy => {
                    const tr = document.createElement("tr");
                    tr.style.borderBottom = "1px solid #eee";
                    tr.innerHTML = `
                        <td style="padding: 8px;">${copy.book_manage_id}</td>
                        <td style="padding: 8px;">${copy.status_display}</td>
                        <td style="padding: 8px;">
                            <button style="font-size:12px; cursor:pointer;" 
                                onclick="updateCopyStatus(${copy.book_manage_id})">
                                관리
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }
    } catch(err) {
        console.error("데이터 로딩 실패:", err);
    }
};