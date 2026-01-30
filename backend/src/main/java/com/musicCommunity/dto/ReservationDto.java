package com.musicCommunity.dto;


import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ReservationDto {

    // 1. 예약 자체의 정보 (Reservation Table 기준)
    private Long id; // 예약 ID (PK)
    private LocalDateTime reservationDate; // 예매 확정 시간
    private String status; // 예매 상태 (예: 'COMPLETE', 'CANCELLED')
    private BigDecimal totalPrice; // 총 결제 금액 (소수점 처리를 위해 BigDecimal)

    // 2. 외래 키 대신 사용자에게 보여줄 상세 정보 (JOIN 필요)

    // 예매된 공연 정보 (Event Table에서 JOIN)
    private Long eventId;
    private String eventName; // 공연/이벤트 이름 (필수)
    private LocalDateTime eventDate; // 공연 일시 (예: Event Table에 있을 경우)

    // 예매된 좌석 정보 (Seat Table에서 JOIN)
    private Long seatId;
    private String seatInfo; // 좌석 정보 (예: '1층 A구역 5열 10번')

    // 이 DTO는 마이페이지 목록에서 보여줄 핵심 정보만을 담고 있습니다.
}
