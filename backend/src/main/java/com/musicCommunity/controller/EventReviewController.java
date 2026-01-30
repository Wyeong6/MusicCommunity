package com.musicCommunity.controller;

import com.musicCommunity.dto.EventReviewDto;
import com.musicCommunity.service.EventReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class EventReviewController {

    private final EventReviewService reviewService;

    /**
     * 1. 후기 작성 저장
     * POST /api/reviews
     */
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody EventReviewDto reviewDto) {
        log.info("후기 작성 요청: {}", reviewDto);
        try {
            reviewService.saveReview(reviewDto);
            return ResponseEntity.ok("후기가 성공적으로 등록되었습니다.");
        } catch (IllegalArgumentException e) {
            // 예매 내역이 없거나 잘못된 접근일 경우 400 에러와 메시지 반환
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
        }
    }

    /**
     * 2. 후기 전체 목록 조회
     * GET /api/reviews
     */
    @GetMapping
    public ResponseEntity<List<EventReviewDto>> getAllReviews() {
        List<EventReviewDto> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }

    /**
     * 3. 후기 상세 조회 (조회수 증가 포함)
     * GET /api/reviews/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getReviewDetail(@PathVariable Long id) {
        try {
            EventReviewDto review = reviewService.getReviewById(id);
            return ResponseEntity.ok(review);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * 4. 작성 권한 미리 확인 (프론트엔드 UI 제어용)
     * GET /api/reviews/check?userId=1&eventId=5
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkPermission(
            @RequestParam Long userId,
            @RequestParam Long eventId) {
        boolean canWrite = reviewService.canUserWriteReview(userId, eventId);
        return ResponseEntity.ok(canWrite);
    }

    /**
     * 5. 후기 삭제
     * DELETE /api/reviews/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok("후기가 삭제되었습니다.");
    }

    /**
     * 6. 후기 수정
     * PUT /api/reviews/{id}
     */

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody EventReviewDto reviewDto) {
        try {
            reviewDto.setId(id); // URL의 ID를 DTO에 세팅
            reviewService.updateReview(reviewDto);
            return ResponseEntity.ok("후기가 성공적으로 수정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("수정 중 오류가 발생했습니다.");
        }
    }
}