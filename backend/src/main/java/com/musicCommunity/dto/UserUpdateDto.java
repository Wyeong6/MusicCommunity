package com.musicCommunity.dto;


import lombok.Data;

@Data
public class UserUpdateDto {
    private Long id;
    private String nickname;
    private String currentPassword; // 기존 비번 확인용
    private String newPassword;     // 새로 바꿀 비번 (없으면 변경 안 함)
}