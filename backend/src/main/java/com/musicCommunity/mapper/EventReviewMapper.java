package com.musicCommunity.mapper;


import com.musicCommunity.dto.EventReviewDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface EventReviewMapper {

    // 1. 후기 저장
    void save(EventReviewDto reviewDto);

    // 2. 전체 후기 목록 조회 (닉네임, 공연제목 포함)
    List<EventReviewDto> findAll();

    // 3. 특정 후기 상세 조회
    Optional<EventReviewDto> findById(Long id);

    // 4. 조회수 증가
    void updateViewCount(Long id);

    // 5. [핵심] 작성 권한 체크: 해당 사용자가 해당 공연을 'COMPLETE' 상태로 예매했는지 확인
    // 결과가 0보다 크면 권한 있음
    int countCompletedReservation(@Param("userId") Long userId, @Param("eventId") Long eventId);

    // 6. 후기 수정
    void update(EventReviewDto reviewDto);

    // 7. 후기 삭제
    void delete(Long id);
}