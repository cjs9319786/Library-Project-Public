// ==========================================
// 전역 변수 및 설정
// ==========================================
let join_members = [];
let currentPage = 1;
const itemsPerPage = 15;
const pagesPerGroup = 5;
const API_BASE_URL = "http://127.0.0.1:8000/api"; 

// DOM 요소 (로드 후 할당)
let join_member_list = null;
let list_Page = null;

// ==========================================
// 1. 초기화 및 이벤트 리스너 등록
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // 요소 바인딩
    join_member_list = document.getElementById("join_member_List");
    list_Page = document.getElementById("list_Page");
    
    const join_btn = document.getElementById("join_member_btn");
    const searchForm = document.getElementById("searchForm");
    
    // 회원 등록 버튼 (HTML의 onclick="showModal('signUp')" 대신 여기서 처리 권장)
    // HTML에 onclick이 이미 있다면 함수를 전역으로 빼야 함. 아래 전역 함수 섹션 참조.

    // [전체 조회]
    if(join_btn) {
        join_btn.addEventListener("click", () => fetchMembers());
    }

    // [검색]
    if(searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const keyword = document.getElementById("search_Bar").value;
            fetchMembers(keyword);
        });
    }
    
    // [회원 등록 모달 폼 제출]
    const memberForm = document.getElementById("memberForm");
    if(memberForm) {
        memberForm.addEventListener("submit", handleMemberSubmit);
    }
});

// ==========================================
// 2. 회원 목록 조회 (R)
// ==========================================
async function fetchMembers(query = "") {
    // UI 초기화
    document.getElementById("join_member_check_wrap").style.display = "block";
    document.getElementById("list_Page").style.display = "block";
    document.getElementById("member_Manage_wrap").style.display = "none";
    
    let url = `${API_BASE_URL}/admin/members/`;
    if(query) url += `?q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) throw new Error(`서버 통신 오류 (${response.status})`);
        
        const result = await response.json();
        join_members = result.members || [];
        
        if(join_members.length === 0) alert("조회 결과가 없습니다.");
        
        display_Member_list(1);

    } catch (error) {
        console.error(error);
        alert("회원 목록을 불러오지 못했습니다.");
    }
}

// 리스트 렌더링
function display_Member_list(page) {
    if (!join_member_list) return;
    currentPage = page;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = join_members.slice(startIndex, endIndex);

    // 헤더
    join_member_list.innerHTML = `
        <div class="top">
            <div class="id">회원 ID</div>
            <div class="name">이름</div>
            <div class="email">이메일</div>
            <div class="hp">전화번호</div>
            <div class="signup_date">상태</div>
            <div class="birthdate">생년월일</div>
            <div class="panalty_count" style="flex: 2;">관리</div> 
        </div>
    `;

    currentItems.forEach((item) => {
        const divItem = document.createElement("div");
        divItem.classList.add("li-item");
        
        // views.py에서 'id' 또는 'member_id'로 줄 수 있으므로 방어 코드
        const pk = item.id || item.member_id; 

        divItem.innerHTML = `
          <div class="id">${item.login_id}</div>
          <div class="name">${item.first_name}</div>
          <div class="email">${item.email}</div>
          <div class="hp">${item.phone_number}</div>
          <div class="signup_date">${item.status}</div>
          <div class="birthdate">${item.birth_date}</div>
          
          <div class="modify" style="flex: 2; display:flex; gap:5px; justify-content: center;">
            <button class="btn" onclick="openModifyModal(${pk})" style="background:#555; color:white;">수정</button>
            <button class="btn" onclick="openRentModal(${pk}, '${item.first_name}')" style="background:#4CAF50; color:white;">대여</button>
            <button class="btn" onclick="openReturnModal(${pk}, '${item.first_name}')" style="background:#2196F3; color:white;">반납/기록</button>
          </div>
        `;
        join_member_list.appendChild(divItem);
    });
    createPaginationButtons();
}

// 페이지네이션
function createPaginationButtons() {
    if (!list_Page) return;
    const totalPages = Math.ceil(join_members.length / itemsPerPage);
    list_Page.innerHTML = ""; // 초기화

    if(totalPages === 0) return;

    // 이전 그룹
    const prevBtn = document.createElement("a");
    prevBtn.className = "bt prev";
    prevBtn.textContent = "<";
    prevBtn.onclick = () => { if(currentPage > 1) display_Member_list(currentPage - 1); };
    list_Page.appendChild(prevBtn);

    const startPage = Math.floor((currentPage - 1) / pagesPerGroup) * pagesPerGroup + 1;
    const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("a");
        pageBtn.className = `num_p ${i === currentPage ? 'on' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = (e) => { e.preventDefault(); display_Member_list(i); };
        list_Page.appendChild(pageBtn);
    }

    // 다음 그룹
    const nextBtn = document.createElement("a");
    nextBtn.className = "bt next";
    nextBtn.textContent = ">";
    nextBtn.onclick = () => { if(currentPage < totalPages) display_Member_list(currentPage + 1); };
    list_Page.appendChild(nextBtn);
}


// ==========================================
// 3. 회원 등록(C) 및 수정(U) 로직
// ==========================================

// 등록 모달 열기 (초기화)
function showModal(type) {
    if(type === 'signUp') {
        document.getElementById('signUpModal').style.display = 'block';
        document.getElementById('modal_title').innerText = "회원 등록";
        document.getElementById('memberForm').reset();
        document.getElementById('target_pk').value = ""; // PK 비움 (등록 모드)
        document.getElementById('modal_login_id').readOnly = false; // ID 입력 가능
        
        document.getElementById('submit_btn').innerText = "등록하기";
        document.getElementById('delete_act_btn').style.display = "none";
        document.getElementById('overdue_date_area').style.display = "none";
    }
}

// 수정 모달 열기 (데이터 채우기)
async function openModifyModal(pk) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/members/${pk}/`, {
            method: "GET",
            credentials: "include"
        });
        const data = await response.json();
        
        if(!response.ok) throw new Error(data.error);

        // 모달 띄우기 및 값 채우기
        document.getElementById('signUpModal').style.display = 'block';
        document.getElementById('modal_title').innerText = "회원 정보 수정";
        
        document.getElementById('target_pk').value = data.member_id; // PK 저장
        document.getElementById('modal_login_id').value = data.login_id;
        document.getElementById('modal_login_id').readOnly = true; // ID 수정 불가
        document.getElementById('modal_first_name').value = data.first_name;
        document.getElementById('modal_email').value = data.email;
        document.getElementById('modal_phone_number').value = data.phone_number;
        document.getElementById('modal_birth_date').value = data.birth_date;
        document.getElementById('modal_status').value = data.status;
        document.getElementById('modal_password').value = ""; // 비밀번호는 비워둠

        // 연체일 (있는 경우)
        const overdueArea = document.getElementById('overdue_date_area');
        if(data.overdue_end_date) {
            overdueArea.style.display = 'block';
            document.getElementById('modal_overdue_date').value = data.overdue_end_date;
        } else {
            overdueArea.style.display = 'none';
        }

        document.getElementById('submit_btn').innerText = "수정하기";
        document.getElementById('delete_act_btn').style.display = "inline-block"; // 탈퇴 버튼 보이기

    } catch (error) {
        alert("회원 정보를 불러오는데 실패했습니다.");
        console.error(error);
    }
}

// 폼 제출 처리 (등록/수정 분기)
async function handleMemberSubmit(e) {
    e.preventDefault();
    
    const pk = document.getElementById('target_pk').value;
    const isEditMode = !!pk; // PK가 있으면 수정 모드

    const formData = {
        login_id: document.getElementById('modal_login_id').value,
        first_name: document.getElementById('modal_first_name').value,
        email: document.getElementById('modal_email').value,
        phone_number: document.getElementById('modal_phone_number').value,
        birth_date: document.getElementById('modal_birth_date').value,
        status: document.getElementById('modal_status').value,
    };

    // 비밀번호는 입력했을 때만 전송 (수정 모드) or 등록시 필수
    const pw = document.getElementById('modal_password').value;
    if(pw) formData.password = pw;
    else if(!isEditMode) {
        alert("비밀번호를 입력해주세요.");
        return;
    }

    // 연체일 (수정 모드일 때만)
    if(isEditMode) {
        const overdue = document.getElementById('modal_overdue_date').value;
        if(overdue) formData.overdue_end_date = overdue;
    }

    // URL 및 메소드 설정
    const url = isEditMode 
        ? `${API_BASE_URL}/admin/members/update/${pk}/` 
        : `${API_BASE_URL}/admin/members/create/`;
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(formData)
        });
        const result = await response.json();

        if(response.ok) {
            alert(result.message);
            closeModal('signUpModal');
            fetchMembers(); // 목록 갱신
        } else {
            alert("오류: " + result.error);
        }
    } catch (error) {
        console.error(error);
        alert("처리 중 오류가 발생했습니다.");
    }
}

// ==========================================
// 4. 회원 탈퇴 (D)
// ==========================================
async function deleteMember() {
    const pk = document.getElementById('target_pk').value;
    if(!pk) return;

    if(!confirm("정말로 이 회원을 탈퇴(비활성화) 처리하시겠습니까?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/members/delete/${pk}/`, {
            method: "POST",
            credentials: "include"
        });
        const result = await response.json();
        
        if(response.ok) {
            alert(result.message);
            closeModal('signUpModal');
            fetchMembers();
        } else {
            alert("오류: " + result.error);
        }
    } catch (error) {
        alert("통신 오류 발생");
    }
}


// ==========================================
// 5. 대여 처리 (Admin Borrow)
// ==========================================
function openRentModal(memberId, memberName) {
    document.getElementById('rent_target_member_id').value = memberId;
    document.getElementById('rent_target_name').innerText = memberName;
    document.getElementById('rent_isbn_input').value = ''; 
    document.getElementById('rent_modal').style.display = 'block';
}

async function processRent() {
    const memberId = document.getElementById('rent_target_member_id').value;
    const isbn = document.getElementById('rent_isbn_input').value.trim();

    if(!isbn) { alert("ISBN을 입력하세요."); return; }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/borrow/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                member_id: memberId, // views.py 수정 전이면 PK가 그대로 member_id로 넘어감 (OK)
                isbns: [isbn]
            })
        });
        const result = await response.json();

        if(response.ok) {
            let msg = result.message;
            if(result.failed_isbns && result.failed_isbns.length > 0) {
                msg += `\n(실패한 ISBN: ${result.failed_isbns.join(', ')})`;
            }
            alert(msg);
            closeModal('rent_modal');
        } else {
            alert("대여 실패: " + result.error);
        }
    } catch (error) {
        alert("대여 통신 중 오류가 발생했습니다.");
    }
}


// ==========================================
// 6. 반납 및 이력 조회 (Admin Return & History)
// ==========================================
async function openReturnModal(memberId, memberName) {
    document.getElementById('history_member_name').innerText = memberName;
    const listArea = document.getElementById('borrow_history_list_wrap');
    listArea.innerHTML = "로딩 중...";
    document.getElementById('borrowModal').style.display = 'block';

    try {
        const response = await fetch(`${API_BASE_URL}/admin/members/${memberId}/borrows/`, {
            method: "GET",
            credentials: "include"
        });
        const result = await response.json();

        if(!response.ok) throw new Error(result.error);

        const borrows = result.borrows;
        if(!borrows || borrows.length === 0) {
            listArea.innerHTML = "<p style='text-align:center; padding:20px;'>대여 기록이 없습니다.</p>";
            return;
        }

        // 테이블 생성
        let html = `
            <table class="history-table" style="width:100%; border-collapse: collapse; text-align: center;">
                <thead style="background: #f4f4f4;">
                    <tr>
                        <th style="padding:10px; border:1px solid #ddd;">도서명 (ISBN)</th>
                        <th style="padding:10px; border:1px solid #ddd;">대여일</th>
                        <th style="padding:10px; border:1px solid #ddd;">반납예정일</th>
                        <th style="padding:10px; border:1px solid #ddd;">상태/관리</th>
                    </tr>
                </thead>
                <tbody>
        `;

        borrows.forEach(b => {
            const isReturned = !!b.return_date;
            const isOverdue = !isReturned && (new Date() > new Date(b.due_date));
            
            let statusBadge = "";
            let actionBtn = "";

            if(isReturned) {
                statusBadge = `<span style="color:gray;">반납완료<br>(${b.return_date})</span>`;
            } else {
                statusBadge = isOverdue 
                    ? `<span style="color:red; font-weight:bold;">연체중</span>` 
                    : `<span style="color:green;">대여중</span>`;
                
                // 반납 버튼 (borrow_id를 인자로 전달)
                actionBtn = `<button onclick="processReturn(${b.borrow_id})" 
                             style="background:#f44336; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">
                             반납처리</button>`;
            }

            html += `
                <tr>
                    <td style="padding:8px; border:1px solid #ddd;">${b.book__isbn__title}<br><small>${b.book__isbn__isbn}</small></td>
                    <td style="padding:8px; border:1px solid #ddd;">${b.borrow_date}</td>
                    <td style="padding:8px; border:1px solid #ddd;">${b.due_date}</td>
                    <td style="padding:8px; border:1px solid #ddd;">
                        ${statusBadge} ${actionBtn}
                    </td>
                </tr>
            `;
        });
        html += "</tbody></table>";
        listArea.innerHTML = html;

    } catch (error) {
        console.error(error);
        listArea.innerHTML = "데이터를 불러오지 못했습니다.";
    }
}

async function processReturn(borrowId) {
    if(!confirm("해당 도서를 반납 처리하시겠습니까?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/return/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ borrow_id: borrowId })
        });
        const result = await response.json();

        if(response.ok) {
            alert(result.message);
            closeModal('borrowModal'); // 닫고 다시 열거나, 현재창 새로고침 필요
            // 여기서는 심플하게 닫습니다. 필요시 openReturnModal을 다시 호출해도 됨.
        } else {
            alert("반납 실패: " + result.error);
        }
    } catch (error) {
        alert("반납 통신 중 오류가 발생했습니다.");
    }
}

// ==========================================
// 7. 공통 모달 닫기
// ==========================================
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}