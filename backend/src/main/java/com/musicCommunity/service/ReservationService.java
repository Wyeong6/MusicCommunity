package com.musicCommunity.service;

import com.musicCommunity.domain.Reservation;
import com.musicCommunity.domain.Seat;
import com.musicCommunity.dto.ReservationDto;
import com.musicCommunity.dto.ReservationRequestDto;
import com.musicCommunity.dto.ReservationResponseDto;
import com.musicCommunity.mapper.ReservationMapper;
import com.musicCommunity.mapper.SeatMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 좌석 예약 관련 비즈니스 로직을 처리하는 서비스입니다.
 * 좌석 예약 시 동시성 문제를 방지하기 위해 비관적 락(PESSIMISTIC LOCK)을 사용합니다.
 */
@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationMapper reservationMapper;
    private final SeatMapper seatMapper;

    /**
     * 좌석을 예약하고 예약 정보를 저장합니다.
     * 이 메서드는 트랜잭션으로 보호되며, 동시성 문제를 해결하기 위해 비관적 락을 사용합니다.
     *
     * @param requestDto 예약 요청 DTO (userId, seatId 등 포함)
     * @return 성공 시 생성된 Reservation 객체
     */
    @Transactional // 트랜잭션 경계 설정 (전체 작업의 원자성 보장)
    public Reservation reserveSeat(ReservationRequestDto requestDto) {
        Long seatId = requestDto.getSeatId();

        // 1. 비관적 락을 걸고 좌석 정보 조회 (select ... for update)
        // 이 시점에 다른 트랜잭션은 해당 좌석을 수정할 수 없습니다.
        Optional<Seat> seatOptional = seatMapper.findByIdForUpdate(seatId);

        if (seatOptional.isEmpty()) {
            throw new IllegalArgumentException("존재하지 않는 좌석 ID입니다: " + seatId);
        }

//        // 🚨 동시성 테스트를 위한 지연 (필수: 이 코드가 락이 풀리지 않게 잡아둡니다.)
//        try {
//            System.out.println("User " + requestDto.getUserId() + ": 트랜잭션 시작. 30초 대기 시작...");
//            Thread.sleep(30000);
//        } catch (InterruptedException e) {
//            Thread.currentThread().interrupt();
//        }
//        System.out.println("User " + requestDto.getUserId() + ": 대기 종료. DB 작업 재개.");

        Seat seat = seatOptional.get();

        // 2. 예약 가능 여부 확인 (재고 확인)
        if (seat.getIsReserved()) {
            // 이미 예약된 좌석이라면 예외 발생
            System.out.println("User " + requestDto.getUserId() + ": 좌석 ID " + seatId + "는 이미 예약된 상태입니다. 트랜잭션 롤백.");
            throw new IllegalStateException("이미 예약된 좌석입니다.");
        }

        // 3. 예약 객체 생성 (Reservation Domain)
        Reservation reservation = Reservation.builder()
                .userId(requestDto.getUserId())
                .eventId(seat.getEventId())
                .seatId(seatId)
                // 현재 시간으로 예약 확정 시간 설정
                .reservationDate(LocalDateTime.now())
                // 상태는 'COMPLETE'로 가정
                .status("COMPLETE")
                .totalPrice(seat.getPrice())
                .build();

        // 4. 예약 정보 DB 저장 (Mapper)
        // 이 시점에 reservation 객체에 DB에서 생성된 ID(PK)가 채워집니다.
        int result = reservationMapper.insertReservation(reservation);
        if (result == 0) {
            // 삽입 실패 시 런타임 예외를 발생시켜 롤백 유도
            throw new RuntimeException("예약 정보 저장에 실패했습니다.");
        }

        // 5. 좌석 상태 업데이트
        Seat reservedSeat = seat.reserve(reservation.getId()); // 좌석 상태 변경 및 예약 ID 연결
        int updatedRows = seatMapper.updateSeat(reservedSeat);

        if (updatedRows == 0) {
            // 이 로직은 락 때문에 실행될 가능성이 낮으나, 안전을 위해 확인합니다.
            System.err.println("User " + requestDto.getUserId() + ": 🚨 좌석 ID " + seatId + " 업데이트 실패! (Updated Rows: 0)");
            throw new RuntimeException("좌석 상태 업데이트에 실패했습니다. (이미 예약되었을 가능성)");
        }

        // 모든 작업 성공 시 트랜잭션 커밋
        return reservation;
    }

    /**
     * 특정 예약 ID로 예약 정보를 조회합니다.
     * @param reservationId 예약 ID
     * @return 조회된 Reservation 객체
     */
    @Transactional(readOnly = true)
    public Reservation getReservation(Long reservationId) {
        return reservationMapper.findById(reservationId);
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getReservationsByUserId(Long userId) {
        // 1. 매퍼 호출 (반환 타입이 List<ReservationDto>이므로 바로 리턴 가능)
        return reservationMapper.findByUserId(userId);
    }
}
