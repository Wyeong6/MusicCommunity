package com.musicCommunity.service;


import com.musicCommunity.domain.Event;
import com.musicCommunity.domain.Seat;
import com.musicCommunity.dto.EventDto;
import com.musicCommunity.mapper.EventMapper;
import com.musicCommunity.mapper.SeatMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    // EventMapper (com.musiccommunity.mapper)를 주입받아 사용합니다.
    private final EventMapper eventMapper;
    private final SeatMapper seatMapper;

    public Seat getSeat(Long seatId) {
        Seat seat = seatMapper.selectSeatById(seatId);
        if (seat == null) {
            throw new IllegalArgumentException("좌석을 찾을 수 없습니다 : " + seatId);
        }
        return seat;
    }

    /**
     * DB에 저장된 모든 Event 목록을 조회합니다.
     * @return EventDto 리스트
     */
    // value: 캐시 이름, key: 캐시 내에서 식별자
    @Cacheable(value = "events", key = "'all_list'")
    public List<EventDto> findAllEvents() {
        return eventMapper.findAllEvents();
    }

    /**
     * 특정 이벤트 ID에 해당하는 좌석 목록을 조회합니다.
     * @param eventId 조회할 이벤트 ID
     * @return 해당 이벤트의 좌석 목록 (List<Seat>)
     */
    public List<Seat> findSeatsByEventId(Long eventId) {
        // SeatMapper를 사용하여 해당 이벤트의 모든 좌석 정보를 가져옵니다.
        return seatMapper.findSeatsByEventId(eventId);
    }

    @CacheEvict(value = "events", key = "'all_list'")
    @Transactional
    public EventDto createEvent(EventDto eventDto) {

        //DTO -> Entity 변환
        Event event = Event.builder()
                .title(eventDto.getTitle())
                .venue(eventDto.getVenue())
                .startDate(eventDto.getStartDate())
                .endDate(eventDto.getEndDate())
                .runtimeMinutes(eventDto.getRuntimeMinutes())
                .ageRestriction(eventDto.getAgeRestriction())
                .posterUrl(eventDto.getPosterUrl())
                .totalSeats(eventDto.getTotalSeats())
                .description(eventDto.getDescription())
                .status("ACTIVE") // 초기 상태는 'ACTIVE'로 설정
                .build();

        // Mapper를 통해 DB에 저장
        eventMapper.insertEvent(event);

        EventDto savedEventDto = EventDto.builder()
                .id(event.getId()) // 자동 생성된 ID를 사용
                .title(event.getTitle())
                .venue(event.getVenue())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .runtimeMinutes(event.getRuntimeMinutes())
                .ageRestriction(event.getAgeRestriction())
                .posterUrl(event.getPosterUrl())
                .totalSeats(event.getTotalSeats())
                .description(event.getDescription())
                .status(event.getStatus())
                // availableSeats는 별도 로직이 필요하여 일단 totalSeats와 동일하게 설정
                .availableSeats(event.getTotalSeats())
                .build();

        createSeatsForNewEvent(event.getId(), event.getTotalSeats());

        return savedEventDto;
    }
    /**
     * 보조 함수: 새 이벤트에 대한 좌석 데이터를 생성하고 DB에 저장합니다.
     */
    private void createSeatsForNewEvent(Long eventId, int totalSeats) {
        // 가격 정책: 현재 EventDto에 가격 정보가 없으므로 임시로 기본값 설정
        // 추후 EventDto에 price 필드를 추가하여 받아오는 것을 권장합니다.
        BigDecimal defaultPrice = new BigDecimal("1000.00");

        for (int i = 1; i <= totalSeats; i++) {
            // 좌석 번호 생성 (예: "A-1", "A-2" ... "A-10")
            // section이 없어졌으므로 단순하게 번호를 부여합니다.
            String generatedSeatCode = "A-" + i;

            Seat seat = Seat.builder()
                    .eventId(eventId)
                    .seatCode(generatedSeatCode) // Seat 엔티티의 필드명 사용
                    .price(defaultPrice)
                    .isReserved(false) // 초기 상태는 예약 안 됨
                    .reservationId(null)
                    .build();

            // 4. SeatMapper를 통해 DB에 저장 (이 부분이 누락되었었습니다)
            seatMapper.insertSeat(seat);
        }

        System.out.println("이벤트 ID " + eventId + "에 대해 " + totalSeats + "개의 좌석이 생성되었습니다.");
    }

    @CacheEvict(value = "events", key = "'all_list'") // 상태가 바뀌었으니(ACTIVE->CANCELED) 캐시 삭제
    @Transactional
    public boolean updateEventStatus(Long eventId, String status) {
        // 1. 매퍼를 호출하여 해당 ID의 status를 'CANCELED'로 변경
        // 영향받은 행의 수가 1 이상이면 true 반환
        return eventMapper.updateEventStatus(eventId, status) > 0;
    }
}
