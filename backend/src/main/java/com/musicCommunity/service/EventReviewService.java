package com.musicCommunity.service;


import com.musicCommunity.dto.EventReviewDto;
import com.musicCommunity.mapper.EventReviewMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventReviewService {

    private final EventReviewMapper reviewMapper;

    /**
     * 1. 후기 저장 (권한 체크 포함)
     */
    @Transactional
    public void saveReview(EventReviewDto reviewDto) {
        // [핵심] 예매 내역 확인 (status = 'COMPLETE'인 예약이 있는지)
        int reservationCount = reviewMapper.countCompletedReservation(reviewDto.getUserId(), reviewDto.getEventId());

        if (reservationCount <= 0) {
            // 예매 내역이 없으면 예외 발생 (컨트롤러에서 에러 메시지로 변환됨)
            throw new IllegalArgumentException("해당 공연을 관람한 기록이 없어 후기를 작성할 수 없습니다.");
        }

        reviewMapper.save(reviewDto);
    }

    /**
     * 2. 전체 후기 목록 조회
     */
    @Transactional(readOnly = true)
    public List<EventReviewDto> getAllReviews() {
        return reviewMapper.findAll();
    }

    /**
     * 3. 상세 후기 조회 (조회수 증가 포함)
     */
    @Transactional
    public EventReviewDto getReviewById(Long id) {
        // 조회수 1 증가
        reviewMapper.updateViewCount(id);

        // 상세 데이터 가져오기
        return reviewMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 후기입니다."));
    }

    /**
     * 4. 후기 수정
     */
    @Transactional
    public void updateReview(EventReviewDto reviewDto) {
        // 팁: 여기서도 본인이 쓴 글인지 체크하는 로직을 추가하면 더 안전합니다.
        reviewMapper.update(reviewDto);
    }

    /**
     * 5. 후기 삭제
     */
    @Transactional
    public void deleteReview(Long id) {
        reviewMapper.delete(id);
    }

    /**
     * 6. [프론트엔드용] 작성 권한 미리 확인
     * 프론트엔드에서 버튼을 보여줄지 말지 결정할 때 사용
     */
    @Transactional(readOnly = true)
    public boolean canUserWriteReview(Long userId, Long eventId) {
        return reviewMapper.countCompletedReservation(userId, eventId) > 0;
    }
}
