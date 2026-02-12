package com.musicCommunity.service;

import com.musicCommunity.domain.Reservation;
import com.musicCommunity.domain.Seat;
import com.musicCommunity.dto.ReservationRequestDto;
import com.musicCommunity.mapper.ReservationMapper;
import com.musicCommunity.mapper.SeatMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class ReservationServiceExecutor {

    private final ReservationMapper reservationMapper;
    private final SeatMapper seatMapper;

    @Transactional // 여기서 실제 DB 커밋을 담당
    public Reservation proceed(ReservationRequestDto requestDto) {
        Long seatId = requestDto.getSeatId();

        // 1. 일반 조회 (Redis 락이 이미 입구를 막았으므로 for update가 필요 없습니다)
        Seat seat = seatMapper.selectSeatById(seatId);

        if (seat == null) {
            throw new IllegalArgumentException("존재하지 않는 좌석입니다.");
        }

        // 2. 예약 가능 여부 확인
        if (seat.getIsReserved()) {
            throw new IllegalStateException("이미 예약된 좌석입니다.");
        }

        // 3. 예약 정보 저장
        Reservation reservation = Reservation.builder()
                .userId(requestDto.getUserId())
                .eventId(seat.getEventId())
                .seatId(seatId)
                .reservationDate(LocalDateTime.now())
                .status("COMPLETE")
                .totalPrice(seat.getPrice())
                .build();

        reservationMapper.insertReservation(reservation);

        // 4. 좌석 상태 업데이트
        Seat newSeat = seat.reserve(reservation.getId());
        seatMapper.updateSeat(newSeat);

        return reservation;
    }
}