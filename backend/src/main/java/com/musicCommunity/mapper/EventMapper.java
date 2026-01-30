package com.musicCommunity.mapper; // 💡 새로운 패키지 위치

import com.musicCommunity.domain.Event;
import com.musicCommunity.dto.EventDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Event 관련 데이터베이스 작업을 처리하는 MyBatis Mapper 인터페이스입니다.
 * findAllEvents 메서드는 EventMapper.xml에 정의된 SQL을 실행합니다.
 */
@Mapper
public interface EventMapper {

    /**
     * 모든 Event 목록을 데이터베이스에서 조회합니다.
     * @return EventDto 리스트
     */
    List<EventDto> findAllEvents();

    void insertEvent(Event event);

    int updateEventStatus(@Param("id") Long id, @Param("status") String status);
}
