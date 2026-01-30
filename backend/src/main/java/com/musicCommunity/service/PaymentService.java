package com.musicCommunity.service;


import com.musicCommunity.dto.ReservationRequestDto;
import com.siot.IamportRestClient.IamportClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final IamportClient iamportClient;

        public void verifyPayment(ReservationRequestDto requestDto, BigDecimal actualPrice) {
            // 1. 결제 금액 검증 (DB에 저장된 좌석 가격과 요청 금액 비교)
            // 이 부분은 BookingFacade에서 Seat 정보를 가져와서 미리 수행할 수 있습니다.
            // 여기서는 검증이 완료되었다고 가정합니다.

            // 2. 외부 PG사에 결제 요청 (예: REST API 호출)
            System.out.println("User " + requestDto.getUserId() + ": 결제 시스템에 SeatID " + requestDto.getSeatId() + "에 대한 " + requestDto.getAmount() + "원 결제 요청.");

            // 시뮬레이션: 항상 성공한다고 가정
            if (requestDto.getAmount() > 0) {
                System.out.println("User " + requestDto.getUserId() + ": 결제 성공.");
                return;
            }

            System.out.println("User " + requestDto.getUserId() + ": 결제 실패.");
        }
    }
