from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractUser

class Category(models.Model):
    category_id = models.IntegerField(primary_key=True, help_text="분류번호 (PK, 수동 입력)")
    category_name = models.CharField(
        max_length=50, 
        unique=True, 
        null=False, 
        help_text="분류명 (UNIQUE, NOT NULL)"
    )

    class Meta:
        db_table = 'category'

    def __str__(self):
        return self.category_name

class Publisher(models.Model):
    publisher_id = models.AutoField(primary_key=True, help_text="출판사번호 (PK)")
    publisher_name = models.CharField(
        max_length=255, 
        unique=True, 
        null=False, 
        help_text="출판사명 (UNIQUE, NOT NULL)"
    )
    phone_number = models.CharField(
        max_length=20, 
        null=True, 
        blank=True, 
        help_text="출판사 연락처"
    )

    class Meta:
        db_table = 'publisher'

    def __str__(self):
        return self.publisher_name

class BookInfo(models.Model):
    isbn = models.CharField(
        max_length=50, 
        primary_key=True, 
        help_text="국제 표준 도서 번호 (PK, NOT NULL)"
    )
    title = models.CharField(
        max_length=255, 
        null=False, 
        help_text="도서명 (NOT NULL)"
    )
    author = models.CharField(
        max_length=50, 
        null=True, 
        blank=True, 
        help_text="저자"
    )
    
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, # 카테고리가 삭제되어도 책 정보는 남김
        null=True, 
        blank=True,
        db_column='category_id',
        help_text="도서분류번호 (FK)"
    )

    publisher = models.ForeignKey(
        Publisher, 
        on_delete=models.SET_NULL, # 출판사가 삭제되어도 책 정보는 남김
        null=True, 
        blank=True,
        db_column='publisher_id',
        help_text="출판사번호 (FK)"
    )

    class Meta:
        db_table = 'bookinfo'

    def __str__(self):
        return self.title

class Member(AbstractUser):
    login_id = models.CharField(
        max_length=50, 
        unique=True, 
        null=False, 
        help_text="로그인 아이디 (UNIQUE, NOT NULL)"
    )
    
    USERNAME_FIELD = 'login_id'

    first_name = models.CharField(max_length=150, null=False, blank=False, help_text="이름 (NOT NULL)")
    
    birth_date = models.DateField(null=False, help_text="생년월일 (NOT NULL)")
    phone_number = models.CharField(
        max_length=20, 
        unique=True, 
        null=False, 
        help_text="휴대폰번호 (UNIQUE, NOT NULL)"
    )
    status = models.CharField(
        max_length=10, 
        null=False, 
        default='정상', 
        help_text="회원상태 (NOT NULL, DEFAULT '정상')"
    )
    overdue_end_date = models.DateField(
        null=True, 
        blank=True, 
        help_text="연체 종료일"
    )
    
    REQUIRED_FIELDS = ['first_name', 'email', 'birth_date', 'phone_number']

    class Meta:
        db_table = 'member'
    def __str__(self):
        return f"{self.first_name} ({self.login_id})"

class Book(models.Model):
    book_manage_id = models.AutoField(primary_key=True, help_text="도서관리번호 (PK, NOT NULL)")
        
    isbn = models.ForeignKey(
        BookInfo, 
        on_delete=models.CASCADE, # 도서 정보가 삭제되면 실물 책도 함께 삭제
        null=False,
        db_column='isbn',
        help_text="도서번호 (FK, NOT NULL)"
    )
    status = models.CharField(
        max_length=10, 
        null=False, 
        default="대여가능",
        help_text="도서상태 (대여가능, 대여중 등, NOT NULL)"
    )

    class Meta:
        db_table = 'book'

    def __str__(self):
        return self.book_manage_id

class Borrow(models.Model):
    borrow_id = models.AutoField(primary_key=True, help_text="대여번호 (PK)")
    
    member = models.ForeignKey(
        Member, 
        on_delete=models.PROTECT, # 대여 기록이 있는 회원은 삭제 방지
        null=False,
        db_column='member_id',
        help_text="회원번호 (FK, NOT NULL)"
    )

    book = models.ForeignKey(
        Book, 
        on_delete=models.PROTECT, # 대여 기록이 있는 도서는 삭제 방지
        null=False,
        db_column='book_manage_id',
        help_text="도서관리번호 (FK, NOT NULL)"
    )
    
    borrow_date = models.DateField(null=False, help_text="대여일 (NOT NULL)")
    due_date = models.DateField(null=False, help_text="반납예정일 (NOT NULL)")
    return_date = models.DateField(
        null=True, 
        blank=True, 
        help_text="실제반납일 (NULL이면 대여중)"
    )
    is_extended = models.BooleanField(
        null=False, 
        default=False, 
        help_text="연장 여부 (NOT NULL, DEFAULT false)"
    )

    class Meta:
        db_table = 'borrow'

    def __str__(self):
        return f"대여번호 {self.borrow_id}"

class Review(models.Model):
    review_id = models.AutoField(primary_key=True, help_text="리뷰번호 (PK)")
    
    member = models.ForeignKey(
        Member, 
        on_delete=models.CASCADE, # 회원이 탈퇴하면 리뷰도 함께 삭제
        null=False,
        db_column='member_id',
        help_text="회원번호 (FK, NOT NULL)"
    )

    isbn = models.ForeignKey(
        BookInfo, 
        on_delete=models.CASCADE, # 도서 정보가 삭제되면 리뷰도 함께 삭제
        null=False,
        db_column='isbn',
        help_text="도서번호 (FK, NOT NULL)"
    )
    
    # TINYINT(1~5) -> SmallIntegerField + Validators로 구현
    rating = models.SmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=False,
        help_text="평점 (1~5, NOT NULL)"
    )

    content = models.TextField(null=True, blank=True, help_text="리뷰 내용")
    
    # DATETIME, DEFAULT CURRENT_TIMESTAMP -> auto_now_add=True로 구현
    created_at = models.DateTimeField(
        auto_now_add=True, # 생성 시 자동으로 현재 시간 저장
        null=False,
        help_text="작성일시 (NOT NULL, DEFAULT CURRENT_TIMESTAMP)"
    )

    class Meta:
        db_table = 'review'

    def __str__(self):
        return f"리뷰 {self.review_id} (평점: {self.rating})"