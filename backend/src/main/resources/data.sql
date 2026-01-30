-- --------------------------------------------------------
-- 동시성 테스트 및 일반 UI 테스트를 위한 초기 데이터 설정
-- --------------------------------------------------------

-- 1. 데이터 정리 (외래 키 제약 조건 역순)
DELETE FROM reservation;
DELETE FROM seat;
DELETE FROM event;
DELETE FROM users;

-- AUTO_INCREMENT 초기화
ALTER TABLE users AUTO_INCREMENT = 3;
ALTER TABLE event AUTO_INCREMENT = 4;
ALTER TABLE seat AUTO_INCREMENT = 30;
ALTER TABLE reservation AUTO_INCREMENT = 5;

-- ========================================================
-- 1. USERS (BCrypt 암호화 버전)
-- ========================================================
-- 비밀번호 'password'의 해시: $2a$10$7R8siitvH.u3M0Gpx.pIuO9tG/7pXkY/pE0fG7t8E.n7kIe7v7e7i
-- 비밀번호 '1234'의 해시: $2a$10$E2UPv7arXmbnVRy7VRe86ezS.X4Z7Z.f.8.jY8E.n7kIe7v7e7i

INSERT INTO users (id, user_login_id, password, nickname, role) VALUES
(1, 'user1', '$2a$10$Tdu2SbwfU/nf5rmsKvfKteLhJVr2YLQGaolEcyhL1IHsPIIs2NSeq', '김개발', 'USER'),
(2, 'user2', '$2a$10$Tdu2SbwfU/nf5rmsKvfKteLhJVr2YLQGaolEcyhL1IHsPIIs2NSeq', '박테스터', 'USER'),
(100, 'concurrent_tester_A', '$2a$10$Tdu2SbwfU/nf5rmsKvfKteLhJVr2YLQGaolEcyhL1IHsPIIs2NSeq', '경쟁자A', 'USER'),
(101, 'concurrent_tester_B', '$2a$10$Tdu2SbwfU/nf5rmsKvfKteLhJVr2YLQGaolEcyhL1IHsPIIs2NSeq', '경쟁자B', 'USER'),
(102, 'wawa1381', '$2a$10$Tdu2SbwfU/nf5rmsKvfKteLhJVr2YLQGaolEcyhL1IHsPIIs2NSeq', '우영', 'USER');


-- ========================================================
-- 2. EVENT
-- ========================================================
INSERT INTO event (id, title, venue, start_date, end_date, runtime_minutes, age_restriction, poster_url, total_seats, status, description) VALUES
(1, '아이유 콘서트 : THE GOLDEN HOUR', '올림픽주경기장', '2025-10-10', '2025-10-11', 180, '12세 이상',
 'https://placehold.co/600x400/000000/FFFFFF?text=IU+Concert', 15, 'ACTIVE', '아이유의 대표 콘서트입니다.'),
(2, '뮤지컬 레 미제라블', '블루스퀘어 신한카드홀', '2025-11-01', '2025-11-30', 150, '8세 이상',
 'https://placehold.co/600x400/4B5563/FFFFFF?text=Les+Miserables', 10, 'ACTIVE', '빅토르 위고의 걸작 뮤지컬.'),
(3, 'K-Pop 댄스 워크샵 - 기본기 마스터', '강남 댄스 스튜디오', '2026-01-20', '2026-01-20', 90, '전체 연령',
 'https://placehold.co/600x400/FFD700/000000?text=K-POP+Workshop', 8, 'ACTIVE', 'K-Pop 댄스 기본기를 배웁니다.'),
(200, '프리미엄 락 페스티벌', '올림픽홀', '2025-12-10', '2025-12-10', 120, '19세 이상',
 'http://test.url/rockfest_poster.jpg', 10, 'ACTIVE', '동시성 테스트를 위한 락 페스티벌.');

-- ========================================================
-- 3. SEAT  (🔥 reservation_id 없이 먼저 생성)
-- ========================================================

-- EVENT 1
INSERT INTO seat (id, event_id, seat_code, price, is_reserved) VALUES
(30, 1, 'VIP-A03', 1000.00, TRUE),
(31, 1, 'VIP-A01', 1000.00, FALSE),
(32, 1, 'VIP-A02', 1000.00, FALSE),
(33, 1, 'VIP-B01', 1000.00, FALSE),
(34, 1, 'VIP-B02', 1000.00, FALSE),
(35, 1, 'R-C01', 1000.00, FALSE),
(36, 1, 'R-C02', 1000.00, FALSE),
(37, 1, 'R-D01', 1000.00, FALSE),
(38, 1, 'R-D02', 1000.00, FALSE),
(39, 1, 'R-D03', 1000.00, FALSE),
(40, 1, 'S-E01', 1000.00, FALSE),
(41, 1, 'S-E02', 1000.00, FALSE),
(42, 1, 'S-F01', 1000.00, FALSE),
(43, 1, 'S-F02', 1000.00, FALSE),
(44, 1, 'S-G01', 1000.00, FALSE);

-- EVENT 2
INSERT INTO seat (id, event_id, seat_code, price, is_reserved) VALUES
(45, 2, '1층-B-03', 80000.00, TRUE),
(46, 2, '1층-A-01', 1000.00, FALSE),
(47, 2, '1층-A-02', 1000.00, FALSE),
(48, 2, '1층-A-03', 1000.00, FALSE),
(49, 2, '1층-B-01', 1000.00, FALSE),
(50, 2, '1층-B-02', 1000.00, FALSE),
(51, 2, '2층-C-01', 1000.00, FALSE),
(52, 2, '2층-C-02', 1000.00, FALSE),
(53, 2, '2층-C-03', 1000.00, FALSE),
(54, 2, '2층-D-01', 1000.00, FALSE);

-- EVENT 3
INSERT INTO seat (event_id, seat_code, price, is_reserved) VALUES
(3, 'G-01', 1000.00, FALSE),
(3, 'G-02', 1000.00, FALSE),
(3, 'G-03', 1000.00, FALSE),
(3, 'G-04', 1000.00, FALSE),
(3, 'G-05', 1000.00, FALSE),
(3, 'G-06', 1000.00, FALSE),
(3, 'G-07', 1000.00, FALSE),
(3, 'G-08', 1000.00, FALSE);

-- EVENT 200 (동시성 테스트)
INSERT INTO seat (id, event_id, seat_code, price, is_reserved) VALUES
(300, 200, 'VIP-A01', 1000.00, FALSE),
(301, 200, 'R-B05', 1000.00, FALSE),
(302, 200, 'S-C10', 1000.00, FALSE);

-- ========================================================
-- 4. RESERVATION (seat 존재 후에 생성)
-- ========================================================
INSERT INTO reservation (id, user_id, event_id, seat_id, reservation_date, status, total_price) VALUES
(1, 1, 1, 30, NOW(), 'COMPLETE', 1000.00),
(2, 2, 2, 45, NOW(), 'COMPLETE', 80000.00);

-- ========================================================
-- 5. SEAT → RESERVATION 연결
-- ========================================================
UPDATE seat SET reservation_id = 1 WHERE id = 30;
UPDATE seat SET reservation_id = 2 WHERE id = 45;

-- 5번부터 시작하는 추가 예매 내역
INSERT INTO reservation (id, user_id, event_id, seat_id, reservation_date, status, total_price) VALUES
(5, 102, 1, 31, NOW(), 'COMPLETE', 1000.00),  -- 우영: 아이유 콘서트 (VIP-A01)
(6, 102, 3, 55, NOW(), 'COMPLETE', 1000.00),  -- 우영: K-Pop 워크샵 (G-01)
(7, 1, 2, 46, NOW(), 'COMPLETE', 1000.00),   -- 김개발: 레 미제라블 (1층-A-01)
(8, 2, 1, 32, NOW(), 'COMPLETE', 1000.00),   -- 박테스터: 아이유 콘서트 (VIP-A02)
(9, 100, 200, 300, NOW(), 'COMPLETE', 1000.00); -- 경쟁자A: 락 페스티벌 (VIP-A01)

-- 예매된 좌석 상태 업데이트
UPDATE seat SET is_reserved = TRUE, reservation_id = 5 WHERE id = 31;
UPDATE seat SET is_reserved = TRUE, reservation_id = 6 WHERE id = 55;
UPDATE seat SET is_reserved = TRUE, reservation_id = 7 WHERE id = 46;
UPDATE seat SET is_reserved = TRUE, reservation_id = 8 WHERE id = 32;
UPDATE seat SET is_reserved = TRUE, reservation_id = 9 WHERE id = 300;