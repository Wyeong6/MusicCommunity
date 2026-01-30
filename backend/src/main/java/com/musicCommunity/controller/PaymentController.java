package com.musicCommunity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.musicCommunity.domain.Seat;
import com.musicCommunity.dto.PaymentRequestDto;
import com.musicCommunity.dto.PaymentResponseDto;
import com.musicCommunity.service.EventService;
import com.siot.IamportRestClient.IamportClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.InputStream;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {

    private final EventService eventService;

    @Value("${imp.secretKey}")
    private String PORTONE_API_SECRET;

    @PostMapping("/complete")
    public ResponseEntity<?> completePayment(@RequestBody PaymentRequestDto requestDto) {

        try {
            String paymentId = requestDto.getPaymentId();
            Long seatId = requestDto.getSeatId();

            System.out.println("completePayment 진입 확인, 진입성공");

            // 포트원에서 결제 단건 조회
            PaymentResponseDto payment = getPayment(paymentId);

            System.out.println("getPayment 통과 확인, 통과성공");

            // DB에서 좌석 가격 가져오기
            Seat seat = eventService.getSeat(seatId);
            BigDecimal seatPrice = seat.getPrice();

            // 포트원에서 받은 결제 금액
            BigDecimal paidAmount = BigDecimal.valueOf(payment.getAmount().getTotal());

            System.out.println("[BACK] 프론트에서 받은 amount = " + requestDto.getAmount());
            System.out.println("[BACK] PortOne에서 받은 amount = " + payment.getAmount().getTotal());
            System.out.println("[BACK] DB seatPrice = " + seatPrice);

            // 금액 교차 검증
            if (seatPrice.compareTo(paidAmount) != 0) {
                throw new IllegalStateException("결제 금액이 일치하지 않습니다. 위변조 가능성이 있음");
            }

            // 결제 상태 처리
            if ("PAID".equals(payment.getStatus())) {
                return ResponseEntity.ok("결제 완료");
            }
            return ResponseEntity.ok("결제 상태: " + payment.getStatus());


        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }

    }

    private PaymentResponseDto getPayment(String paymentId) throws Exception {

        System.out.println("getPayment 진입확인");
        System.out.println("요청 paymentId = " + paymentId);
        System.out.println("🟦 PORTONE_API_SECRET = '" + PORTONE_API_SECRET + "'");
        System.out.println("🟦 Secret length = " + PORTONE_API_SECRET.length());

        URL url = new URL("https://api.portone.io/payments/" + paymentId);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setRequestMethod("GET");
        conn.setRequestProperty("Authorization", "PortOne " + PORTONE_API_SECRET);
        conn.setRequestProperty("Content-Type", "application/json");

        System.out.println("HTTP 응답 코드 = " + conn.getResponseCode());
        System.out.println("HTTP 응답 메시지 = " + conn.getResponseMessage());

//        InputStream is = conn.getInputStream();
//        String rawJson = new String(is.readAllBytes(), StandardCharsets.UTF_8);
//        System.out.println("PortOne RAW JSON = " + rawJson);

        if (conn.getResponseCode() != 200) {
            System.out.println("conn.getResponseCode() != 200 걸림");
            throw new IllegalStateException("PortOne 결제 조회 실패");
        }

        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(conn.getInputStream(), PaymentResponseDto.class);

    }

}
