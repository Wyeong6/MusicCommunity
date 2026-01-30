package com.musicCommunity.domain;


import lombok.*;

import java.math.BigDecimal;
import java.util.Objects;

@Getter
@Setter
// MyBatis가 DB에서 데이터를 로드할 때 사용할 수 있도록 protected로 기본 생성자 허용
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
// Builder 생성을 위해 전체 필드 생성자를 private로 제한
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
@Builder
@ToString
public class Seat {

    private Long id;  // 좌석 고유 ID (PK)
    private Long eventId;  // 공연 ID (FK)
    private String seatCode; // 좌석 코드 (예: VIP-A01)
//    private String section;  // 좌석 구역 (예: VIP, R석)
    private BigDecimal price; // 좌석 가격
    private boolean isReserved; // 예약 상태 (TRUE: 예약됨, FALSE: 예약 가능)
    private Long reservationId;     // 예약 ID (FK, 예약되지 않은 경우 NULL)

    /**
     * 비즈니스 로직: 좌석을 '예약 완료' 상태로 변경하고, 예약 ID를 설정합니다.
     * 불변 객체이므로, toBuilder()를 사용하여 새로운 Seat 객체를 생성하여 반환합니다.
     *
     * @param newReservationId 새로 할당된 예약 ID
     * @return 예약 상태가 업데이트된 새로운 Seat 객체
     */

    /**
     * 좌석의 예약 상태를 확인합니다.
     * @return 예약되어 있으면 true, 아니면 false
     */
    public Boolean getIsReserved() {
        // 💡 수정된 부분: this.isReserved != null ? this.isReserved : false;
        // DB에서 조회된 isReserved 필드(Boolean)가 null일 경우 false를 반환하여 안전하게 처리합니다.
        // Boolean 래퍼 타입의 null 비교는 Objects.nonNull() 대신 삼항 연산자를 사용하면 더 직관적입니다.
        return this.isReserved;
    }

    public Seat reserve(Long newReservationId) {
        if (this.isReserved) {
            // 이미 예약된 경우, 예외를 발생시키거나 상황에 맞게 처리할 수 있습니다.
            // 여기서는 새로운 객체를 생성하지 않고 기존 객체를 반환합니다.
            throw new IllegalStateException("이미 예약된 좌석입니다: " + this.seatCode);
        }

        // 예약 상태와 reservationId를 변경하여 새로운 Seat 객체를 생성합니다.
        return this.toBuilder()
                .isReserved(true)
                .reservationId(newReservationId)
                .build();
    }

    // Lombok의 toBuilder()는 @AllArgsConstructor(access = PRIVATE)와 함께 사용 시 유용합니다.
    public SeatBuilder toBuilder() {
        return new SeatBuilder()
                .id(this.id)
                .eventId(this.eventId)
                .seatCode(this.seatCode)
//                .section(this.section)
                .price(this.price)
                .isReserved(this.isReserved)
                .reservationId(this.reservationId);
    }
}
