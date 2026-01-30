package com.musicCommunity.domain;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate; // SQL DATE 타입에 대응

/**
 * Event 도메인/엔티티 클래스
 * DB의 'event' 테이블과 1:1 매핑됩니다.
 * Lombok을 사용하여 보일러플레이트 코드를 줄였습니다.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    private Long id;
    private String title;
    private String venue;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer runtimeMinutes;
    private String ageRestriction;
    private String posterUrl;
    private Integer totalSeats;
    private String status;
    private String description;

}