package com.musicCommunity.dto;


import com.musicCommunity.domain.Reservation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponseDto {
    private Long reservationId;
    private Long userId;
    private Long eventId;
    private Long seatId;
    private LocalDateTime reservationDate;
    private String status;
    private String message; // 사용자에게 보여줄 성공 메시지

    /**
     * Reservation 객체와 메시지를 이용하여 Response DTO를 생성합니다.
     */
    public static ReservationResponseDto from(Reservation reservation, String message) {
        return ReservationResponseDto.builder()
                .reservationId(reservation.getId())
                .userId(reservation.getUserId())
                .eventId(reservation.getEventId())
                .seatId(reservation.getSeatId())
                .reservationDate(reservation.getReservationDate())
                .status(reservation.getStatus())
                .message(message)
                .build();
    }
}
