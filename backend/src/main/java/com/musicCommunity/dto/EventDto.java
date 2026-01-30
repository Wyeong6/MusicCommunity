package com.musicCommunity.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;

/**
 * Event 테이블의 데이터를 담는 DTO (Data Transfer Object).
 * DB 조회/수정(Immutable Update)에 용이하도록 @Builder 패턴을 적용하며,
 * 생성자 접근 제한을 통해 Builder 사용을 강제하여 데이터 안정성을 확보합니다.
 */
@Getter
@Builder // Builder 패턴 적용
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public class EventDto {

    private Long id;
    private String title;
    private String venue;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer runtimeMinutes;
    private String ageRestriction;
    private String posterUrl;
    private Integer totalSeats;
    private String description;
    private String status;

    @Builder.Default
    private Integer availableSeats = 0;

    public EventDtoBuilder toBuilder() {
        return new EventDtoBuilder()
                .id(this.id)
                .title(this.title)
                .venue(this.venue)
                .startDate(this.startDate)
                .endDate(this.endDate)
                .runtimeMinutes(this.runtimeMinutes)
                .ageRestriction(this.ageRestriction)
                .posterUrl(this.posterUrl)
                .totalSeats(this.totalSeats)
                .description(this.description) // 추가
                .status(this.status)           // 추가
                .availableSeats(this.availableSeats);
    }

}
