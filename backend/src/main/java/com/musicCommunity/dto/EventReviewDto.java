package com.musicCommunity.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class EventReviewDto {
    // 1. 기본 테이블 컬럼 매핑
    private Long id;            // 후기 고유 번호
    private Long userId;        // 작성자 고유 번호 (users.id)
    private Long eventId;       // 공연 고유 번호 (event.id)
    private String userLoginId; // 작성자 아이디
    private String title;       // 후기 제목
    private String content;     // 후기 내용
    private int rating;         // 별점 (1~5점)
    private int viewCount;      // 조회수
    private LocalDateTime createdAt; // 작성 시간
    private LocalDateTime updatedAt; // 수정 시간

    // 2. 화면 표시를 위한 추가 데이터 (Join 활용 필드)
    // 작성자의 아이디(103번)만 보여주면 사용자가 누구인지 모르니 닉네임이 필요합니다.
    private String nickname;

    // 후기 목록에서 이 후기가 '어떤 공연'에 대한 것인지 제목을 보여주기 위함입니다.
    private String eventTitle;
}
