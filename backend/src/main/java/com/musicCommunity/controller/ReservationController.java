    package com.musicCommunity.controller;


    import com.musicCommunity.domain.Reservation;
    import com.musicCommunity.dto.ReservationDto;
    import com.musicCommunity.dto.ReservationRequestDto;
    import com.musicCommunity.dto.ReservationResponseDto;
    import com.musicCommunity.service.ReservationService;
    import com.musicCommunity.service.UserService;
    import com.siot.IamportRestClient.IamportClient;
    import jakarta.servlet.http.HttpServletRequest;
    import lombok.RequiredArgsConstructor;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/api/reservations")
    @RequiredArgsConstructor
    public class ReservationController {

        private final ReservationService reservationService;
        private final UserService userService;

        // 예약 요청을 위한 DTO , POSTMAN 테스트
        public record ReservationRequest(Long userId, Long seatId, Long eventId) {}

        /**
         * [POST] 좌석 예약 생성 엔드포인트
         * * JWT 필터를 통해 인증된 사용자 ID를 추출하여 예약을 처리합니다.
         * ReservationService의 @Transactional + 비관적 락 로직을 호출합니다.
         *
         * @param requestDto 예약 요청 정보 (seatId, eventId 포함)
         * @param request HttpServletRequest (필터가 저장한 사용자 ID를 가져오기 위해 사용)
         * @return 생성된 예약 정보 또는 오류 메시지
         */
        @PostMapping
        public ResponseEntity<?> reserveSeat(
                @RequestBody ReservationRequestDto requestDto,
                HttpServletRequest request // JWT 필터에서 사용자 정보를 가져오기 위함
        ) {
            // 1. JWT 필터에서 인증된 사용자 ID (String 타입)를 추출합니다.
            String authenticatedUserStr = (String) request.getAttribute("authenticatedUser");

            // 필터가 이 경로를 통과시켰다면 authenticatedUserStr은 null이 아니어야 하지만,
            // 혹시 모를 상황과 타입 체크를 위해 확인합니다.
            if (authenticatedUserStr == null) {
                // 이 코드는 필터에서 이미 처리되어야 하지만, 방어적인 코드로 유지
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증된 사용자 정보를 찾을 수 없습니다.");
            }

            Long userId;

            try {
                // JWT Subject(사용자 ID)가 Long 타입이라고 가정하고 변환
                userId = Long.parseLong(authenticatedUserStr);
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("인증 토큰의 사용자 ID 형식이 잘못되었습니다.");
            }


            try {
                // 3. 인증된 userId를 DTO에 포함시켜 Service로 전달
                //    (가정: ReservationRequestDto의 생성자가 (Long userId, Long eventId, Long seatId) 순서)
                ReservationRequestDto requestWithUserId =
                        new ReservationRequestDto(userId, requestDto.getEventId(), requestDto.getSeatId());

                // 4. Service의 락킹 예약 로직 호출
                Reservation reservation = reservationService.reserveSeat(requestWithUserId);

                // 5. 성공 응답 반환
                ReservationResponseDto response = ReservationResponseDto.from(reservation, "좌석 예약 성공! (인증 ID: " + userId + ")");
                return ResponseEntity.status(HttpStatus.CREATED).body(response);

            } catch (IllegalArgumentException e) {
                // 404 Not Found: 존재하지 않는 좌석/이벤트
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            } catch (IllegalStateException e) {
                // 409 Conflict: 이미 예약된 좌석 (동시성 처리 결과)
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            } catch (RuntimeException e) {
                // 500 Internal Server Error: 기타 서버 오류
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("예약 처리 중 서버 오류가 발생했습니다.");
            }
        }



        /**
         * [GET] 특정 예약 정보 조회 엔드포인트
         *
         * @param reservationId 조회할 예약 ID
         * @return 예약 정보
         */
        @GetMapping("/{reservationId}")
        public ResponseEntity<Reservation> getReservation(
                @PathVariable Long reservationId,
                HttpServletRequest request // 👈 인증 정보 확인을 위해 필요
        ) {
            String authenticatedUserStr = (String) request.getAttribute("authenticatedUser");

            // 🚨 인증 정보 없으면 401 반환
            if (authenticatedUserStr == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Long authenticatedUserId = Long.parseLong(authenticatedUserStr); // 인증된 사용자 ID

            Reservation reservation = reservationService.getReservation(reservationId);

            if (reservation == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // 🔒 보안 강화: 조회된 예약의 소유자가 현재 인증된 사용자인지 확인하는 로직이 추가되어야 합니다.

            return ResponseEntity.ok(reservation);
        }



        @GetMapping("/user/{userId}")
        public ResponseEntity<List<ReservationDto>> getMyReservations(
                @PathVariable Long userId,
                HttpServletRequest request
        ) {
            // 1. 보안 체크: 로그인한 본인인지 확인
            String authUser = (String) request.getAttribute("authenticatedUser");
            if (authUser == null || !authUser.equals(String.valueOf(userId))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // 2. UserService의 기존 기능 호출 (이미 List<ReservationDto>를 반환함)
            List<ReservationDto> reservations = userService.getReservationsByUserId(userId);

            return ResponseEntity.ok(reservations);
        }
    }

