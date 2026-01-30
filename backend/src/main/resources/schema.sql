-- ----------------------------------------
-- 테이블 초기화 (테스트 환경에서 사용)
-- 서버 재시작 시 기존 테이블과 데이터를 모두 삭제하고 다시 만듭니다.
-- ----------------------------------------
DROP TABLE IF EXISTS review_comments;
DROP TABLE IF EXISTS event_reviews;
DROP TABLE IF EXISTS reservation;
DROP TABLE IF EXISTS seat;
DROP TABLE IF EXISTS event;
DROP TABLE IF EXISTS users;

-- 사용자(User) 테이블 생성 (인증을 위해 존재해야 함)
-- 'role' 컬럼 추가: 'user' 또는 'admin' 역할을 저장하며 기본값은 'user'입니다.
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_login_id VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' -- 관리자 권한 필드 추가
);

-- 1. EVENT 테이블 생성 (공연 정보)
-- 공연 자체의 메타 정보를 담습니다.
CREATE TABLE event (
    -- ID를 기본 키(PRIMARY KEY) 및 자동 증가(AUTO_INCREMENT)로 설정
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NOT NULL, -- 공연 장소
    start_date DATE,
    end_date DATE,
    runtime_minutes INT,
    age_restriction VARCHAR(255),
    poster_url VARCHAR(255),
    total_seats INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    description TEXT,
    PRIMARY KEY (id)
);

-- 2. SEAT 테이블 생성 (좌석 정보)
-- 개별 좌석의 위치 정보 및 예약 가능 상태를 담습니다.
CREATE TABLE seat (
    id BIGINT NOT NULL AUTO_INCREMENT,
    event_id BIGINT NOT NULL, -- EVENT 테이블의 ID를 참조 (외래 키)
    seat_code VARCHAR(10) NOT NULL, -- 좌석 코드
--    section VARCHAR(50), -- 좌석 구역 정보 (예: R석, 스탠딩)
    price DECIMAL(10, 2) NOT NULL, -- 좌석 가격
    is_reserved BOOLEAN NOT NULL DEFAULT FALSE, -- 예약 상태 (TRUE: 예약됨, FALSE: 예약 가능)
    reservation_id BIGINT, -- 예약된 경우, RESERVATION ID를 참조 (NULL 허용)
    PRIMARY KEY (id),
    -- 외래 키 정의: event_id가 event 테이블의 id를 참조합니다.
    FOREIGN KEY (event_id) REFERENCES event(id)
);

-- 3. RESERVATION 테이블 생성 (예매 기록)
-- 예매가 확정된 기록과 사용자 정보를 담습니다.
CREATE TABLE reservation (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL, -- 예매한 사용자 ID 참조
    event_id BIGINT NOT NULL, -- 예매된 공연 ID 참조
    seat_id BIGINT NOT NULL, -- 예매된 좌석 ID 참조
    reservation_date TIMESTAMP NOT NULL, -- 예매 확정 시간
    status VARCHAR(50) NOT NULL, -- 예매 상태 (예: 'COMPLETE', 'CANCELLED')
    total_price DECIMAL(10, 2) NOT NULL,
    -- ON DELETE CASCADE 옵션 제거하여 데이터 보존
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES event(id),
    FOREIGN KEY (seat_id) REFERENCES seat(id)
);

-- 4. POSTS 테이블 생성 (커뮤니티 게시판) -- ✨ 새로 추가된 부분
-- 사용자가 작성하는 커뮤니티 게시글 정보를 담습니다.
CREATE TABLE event_reviews (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,                    -- 작성자 (users.id)
    event_id BIGINT NOT NULL,                   -- 후기를 남길 공연 (event.id)
    title VARCHAR(255) NOT NULL,                -- 후기 제목
    content TEXT NOT NULL,                      -- 후기 내용
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), -- 별점 (1~5점)
    view_count INT DEFAULT 0,                   -- 조회수
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 관계 설정
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES event(id)
);

-- 5. REVIEW_COMMENTS 테이블 생성 (리뷰 댓글)
-- 특정 후기(event_reviews)에 대한 사용자들의 댓글을 저장합니다.
CREATE TABLE review_comments (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL,                  -- 대상 후기 ID (event_reviews.id)
    user_id BIGINT NOT NULL,                    -- 작성자 ID (users.id)
    content TEXT NOT NULL,                      -- 댓글 내용
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 관계 설정
    -- 후기가 삭제되면 해당 후기의 댓글들도 함께 삭제되도록 ON DELETE CASCADE 설정
    FOREIGN KEY (review_id) REFERENCES event_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);