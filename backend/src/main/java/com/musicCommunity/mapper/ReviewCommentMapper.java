package com.musicCommunity.mapper;

import com.musicCommunity.dto.ReviewCommentDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ReviewCommentMapper {

    // 특정 리뷰의 모든 댓글 조회 (닉네임 조인)
    List<ReviewCommentDto> selectCommentsByReviewId(Long reviewId);

    // 댓글 등록
    int insertComment(ReviewCommentDto comment);

    // 댓글 삭제
    int deleteComment(Long id);

    // 댓글 상세 조회 (삭제 시 본인 확인용)
    ReviewCommentDto selectCommentById(Long id);

    // 댓글 수정
    int updateComment(ReviewCommentDto comment);
}
