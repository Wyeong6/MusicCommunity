package com.musicCommunity.dto;


import lombok.*;


@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class PaymentRequestDto {
    private String eventId;
    private Long seatId;
    private String paymentId;
    private Integer amount;
}
