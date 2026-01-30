package com.musicCommunity.dto;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewCommentDto {
    private Long id;
    private Long reviewId;
    private Long userId;
    private String nickname; // Users 테이블과 JOIN해서 가져올 필드
    private String userLoginId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
