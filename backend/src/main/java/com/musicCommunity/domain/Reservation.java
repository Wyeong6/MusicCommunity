package com.musicCommunity.domain;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 예매 기록 정보를 담는 POJO 모델입니다.
 * 데이터베이스의 'reservation' 테이블과 매핑됩니다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Reservation {
    private Long id; // 예약 고유 ID (PK)
    private Long userId; // 예매한 사용자 ID (FK)
    private Long eventId; // 예매된 공연 ID (FK)
    private Long seatId; // 예매된 좌석 ID (FK)
    private LocalDateTime reservationDate; // 예매 확정 시간
    private String status; // 예매 상태 (예: COMPLETE, CANCELLED)
    private BigDecimal totalPrice; // 최종 결제 금액 (좌석 가격과 동일)
}
