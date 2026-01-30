package com.musicCommunity.mapper;

import com.musicCommunity.domain.Reservation;
import com.musicCommunity.dto.ReservationDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * RESERVATION 테이블에 접근하는 MyBatis Mapper 인터페이스입니다.
 * 모든 SQL 쿼리는 ReservationMapper.xml에 정의되어 있습니다.
 */
@Mapper
public interface ReservationMapper {

    /**
     * 새로운 예약 기록을 저장하고, 생성된 ID를 Reservation 객체에 채웁니다.
     * @param reservation 저장할 Reservation 객체
     * @return 삽입된 행의 수
     */
    int insertReservation(Reservation reservation);

    /**
     * 특정 ID의 예매 기록을 조회합니다.
     * @param reservationId 예매 ID
     * @return Reservation 객체
     */
    Reservation findById(@Param("reservationId") Long reservationId);


    List<ReservationDto> findByUserId(Long userId);

}
