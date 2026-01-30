package com.musicCommunity.controller;

import com.musicCommunity.dto.ReviewCommentDto;
import com.musicCommunity.service.ReviewCommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments") // 댓글은 독립적인 자원으로 관리
public class ReviewCommentController {

    private final ReviewCommentService commentService;

    /**
     * 1. 특정 리뷰의 댓글 목록 조회
     * GET /api/comments/review/{reviewId}
     */
    @GetMapping("/review/{reviewId}")
    public ResponseEntity<List<ReviewCommentDto>> getCommentsByReview(@PathVariable Long reviewId) {
        log.info("댓글 목록 조회 요청 - 리뷰 ID: {}", reviewId);
        List<ReviewCommentDto> comments = commentService.getCommentsByReviewId(reviewId);
        return ResponseEntity.ok(comments);
    }

    /**
     * 2. 댓글 작성 저장
     * POST /api/comments
     */
    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody ReviewCommentDto commentDto) {
        log.info("댓글 작성 요청: {}", commentDto);
        try {
            commentService.addComment(commentDto);
            return ResponseEntity.ok("댓글이 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            log.error("댓글 등록 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
        }
    }

    /**
     * 3. 댓글 삭제
     * DELETE /api/comments/{id}?userId=102
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id, @RequestParam Long userId) {
        log.info("댓글 삭제 요청 - 댓글 ID: {}, 요청 유저 ID: {}", id, userId);
        try {
            boolean isDeleted = commentService.deleteComment(id, userId);
            if (isDeleted) {
                return ResponseEntity.ok("댓글이 삭제되었습니다.");
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("삭제 권한이 없거나 이미 삭제된 댓글입니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 중 오류가 발생했습니다.");
        }
    }

    /**
     * 4. 댓글 수정
     * PUT /api/comments/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestBody ReviewCommentDto commentDto) {
        log.info("댓글 수정 요청 - ID: {}, 내용: {}", id, commentDto.getContent());
        try {
            commentDto.setId(id);
            boolean isUpdated = commentService.updateComment(commentDto);
            if (isUpdated) {
                return ResponseEntity.ok("댓글이 수정되었습니다.");
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("수정 권한이 없습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("수정 중 오류 발생");
        }
    }
}