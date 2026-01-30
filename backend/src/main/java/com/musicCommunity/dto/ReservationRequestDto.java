package com.musicCommunity.dto;


import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor // JSON 바인딩을 위해 기본 생성자 필요
@AllArgsConstructor // Builder나 전체 생성 시 필요
public class ReservationRequestDto {

    @NotNull(message = "사용자 ID는 필수입니다.")
    private Long userId;

    @NotNull(message = "이벤트 ID는 필수입니다.")
    private Long eventId;

    @NotNull(message = "좌석 ID는 필수입니다.")
    private Long seatId;

    // ⚠️ [추가] PortOne 결제 성공 후 받은 결제 정보
    private String paymentId; // PortOne(아임포트) 결제 고유 ID
    private Integer amount;   // 프론트엔드에서 결제한 금액

    public ReservationRequestDto(Long userId, Long eventId, Long seatId) {
        this.userId = userId;
        this.eventId = eventId;
        this.seatId = seatId;
    }


    // (옵션) 추가적으로 필요한 경우, 수량(quantity) 필드 등을 추가할 수 있습니다.
    // 현재는 좌석 하나당 하나의 예약을 가정하므로 두 필드만 사용합니다.
}
