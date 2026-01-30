package com.musicCommunity.mapper;

import com.musicCommunity.domain.Seat;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

/**
 * SEAT 테이블에 접근하는 MyBatis Mapper 인터페이스입니다.
 * 이 인터페이스의 메서드는 SeatMapper.xml 파일에 정의된 SQL과 연결됩니다.
 */
@Mapper
public interface SeatMapper {

    // 아임포트
    Seat selectSeatById(@Param("seatId") Long seatId);

    /**
     * 특정 이벤트 ID에 해당하는 예약 가능한 모든 좌석 목록을 조회합니다.
     * @param eventId 공연 ID
     * @return 예약 가능한 Seat 객체 리스트
     */
    List<Seat> findAvailableSeatsByEventId(@Param("eventId") Long eventId);

    /**
     * 특정 좌석 ID를 조회하며, 비관적 락(PESSIMISTIC LOCK)을 설정합니다.
     * @param seatId 좌석 ID
     * @return 락이 걸린 Seat 객체 (Optional로 반환)
     */
    Optional<Seat> findByIdForUpdate(@Param("seatId") Long seatId);

    /**
     * 좌석의 예약 상태(is_reserved)와 예약 ID(reservation_id)를 업데이트합니다.
     * @param seat 업데이트할 Seat 객체
     * @return 업데이트된 행의 수
     */
    int updateSeat(Seat seat);

    /**
     * 특정 이벤트의 모든 좌석을 조회합니다. (예약 상태와 무관하게 모든 좌석 정보)
     * @param eventId 공연 ID
     * @return 모든 Seat 객체 리스트
     */
    List<Seat> findSeatsByEventId(@Param("eventId") Long eventId);

    void insertSeat(Seat seat);

}
