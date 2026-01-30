package com.musicCommunity.exception;

/**
 * 결제 검증(PG사와의 통신 및 금액 교차 검증) 과정에서 발생하는 예외를 정의합니다.
 */
public class PaymentVerificationException extends RuntimeException {
    public PaymentVerificationException(String message) {
        super(message);
    }
}