//package com.musicCommunity.service;
//
//
//import com.musicCommunity.domain.Reservation;
//import com.musicCommunity.domain.Seat;
//import com.musicCommunity.dto.ReservationRequestDto;
//import com.musicCommunity.exception.PaymentVerificationException;
//import com.musicCommunity.mapper.SeatMapper;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.math.BigDecimal;
//
//@Service
//@RequiredArgsConstructor
//public class ReservationFacade {
//
//    private final SeatMapper seatMapper;
//    private final PaymentService paymentService; // 결제 검증 담당
//    private final ReservationService reservationService; // 최종 예약 확정 담당
//
//    /**
//     * 좌석 예약을 시작하고 결제를 진행한 후, 최종 예약 확정(DB 커밋)까지 완료합니다.
//     * 이 메서드는 트랜잭션을 사용하지 않습니다. (결제는 외부 API 호출이므로 분리)
//     *
//     * @param requestDto 예약 요청 DTO
//     * @return 최종 예약된 Reservation 객체
//     */
//
//    public Reservation reserveAndPay(ReservationRequestDto requestDto) {
//        Long seatId = requestDto.getSeatId();
//
//        // 좌석의 존재여부 및 가격 확인
//        Seat seat = seatMapper.findByIdForUpdate(seatId).orElseThrow(() ->
//                new IllegalArgumentException("존재하지 않는 좌석 ID입니다: " + seatId));
//
//        BigDecimal actualPrice = seat.getPrice();
//
//        // 2. 결제 검증 (PaymentService 호출)
//        // PG사와의 통신 및 금액 교차 검증을 여기서 수행합니다.
//        try {
//            paymentService.verifyPayment(requestDto, actualPrice);
//        } catch (PaymentVerificationException e) {
//            // 결제 위변조, 금액 불일치 등 문제 발생 시
//            System.err.println("🚨 결제 검증 실패: " + e.getMessage());
//            throw e; // Controller에서 400 Bad Request 등으로 처리되도록 예외 전달
//        }
//
//        // 3. 최종 예약 확정 (ReservationService 호출)
//        // 결제 검증이 성공했으므로, 이제 DB 락을 걸고 최종 재고를 확인합니다.
//        Reservation finalReservation;
//        try {
//            finalReservation = reservationService.finalizeReservation(requestDto);
//            System.out.println("User " + requestDto.getUserId() + ": 최종 예약 확정 완료. Reservation ID: " + finalReservation.getId());
//        } catch (IllegalStateException e) {
//            // 좌석이 이미 예약된 경우(경합) 예외가 발생합니다.
//            // 🚨 중요: 결제는 성공했으나, 예약 확정 실패 -> 이 시점에 PaymentService를 통해 환불 API를 호출하는 로직이 추가되어야 합니다.
//            System.err.println("🚨 결제는 성공했으나, 최종 예약 확정 중 경합/실패 발생: " + e.getMessage());
//            // 예시: paymentService.cancelPayment(requestDto, "최종 예약 확정 실패");
//            throw new RuntimeException("최종 예약 확정 중 오류가 발생했습니다. (환불 처리 필요)");
//        }
//        return finalReservation;
//    }
//}
