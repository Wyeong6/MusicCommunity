package com.musicCommunity.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 프론트엔드에 인증 상태를 응답하기 위한 DTO
 * userId, nickname(userName), role만 포함하여 보안을 강화합니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusResponse {
    private Long userId;
    private String nickname; // 프론트엔드의 userName으로 사용됩니다.
    private String role;     // 사용자 역할 (예: "USER", "ADMIN")
}