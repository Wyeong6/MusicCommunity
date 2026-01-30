package com.musicCommunity.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentResponseDto {
    // PortOne JSON의 'id'와 일치시키기 위해 그대로 둡니다.
    private String id;

    private String status;
    private String transactionId;
    private String merchantId;
    private String storeId;

    // 내부 클래스를 참조합니다.
    private Amount amount;
    private Customer customer;
    private Method method;

    // ==========================================================
    // ⭐ 해결책: public static으로 변경하여 외부 패키지에서 접근 가능하게 합니다.
    // ==========================================================

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Amount { // public static으로 변경
        private int total;
        private int taxFree;
        private int vat;
        private int supply;
        private int discount;
        private int paid;
        private int cancelled;
        private int cancelledTaxFree;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Customer { // public static으로 변경
        private String id;
        private String name;
        private String email;
        private String phoneNumber;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Method { // public static으로 변경
        private String type;
    }
}