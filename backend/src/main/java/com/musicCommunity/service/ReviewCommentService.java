package com.musicCommunity.service;

import com.musicCommunity.dto.ReviewCommentDto;
import com.musicCommunity.mapper.ReviewCommentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;;

@Service
@RequiredArgsConstructor
public class ReviewCommentService {
    private final ReviewCommentMapper reviewCommentMapper;

    // 댓글 목록 조회
    public List<ReviewCommentDto> getCommentsByReviewId(Long reviewId) {
        return reviewCommentMapper.selectCommentsByReviewId(reviewId);
    }

    // 댓글 등록
    @Transactional
    public void addComment(ReviewCommentDto commentDto) {
        reviewCommentMapper.insertComment(commentDto);
    }

    // 댓글 삭제 (작성자 검증 로직 포함)
    @Transactional
    public boolean deleteComment(Long commentId, Long userId) {
        ReviewCommentDto existingComment = reviewCommentMapper.selectCommentById(commentId);

        // 댓글이 존재하고, 요청한 유저가 작성자인 경우만 삭제
        if (existingComment != null && existingComment.getUserId().equals(userId)) {
            return reviewCommentMapper.deleteComment(commentId) > 0;
        }
        return false;
    }
    //댓글 수정
    @Transactional
    public boolean updateComment(ReviewCommentDto commentDto) {
        // 쿼리 자체에서 id와 userId를 체크하므로 결과값이 1이면 성공입니다.
        return reviewCommentMapper.updateComment(commentDto) > 0;
    }
}
