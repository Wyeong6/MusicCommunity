package com.musicCommunity.controller;


import com.musicCommunity.domain.Seat;
import com.musicCommunity.dto.EventDto;
import com.musicCommunity.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;


    /**
     * GET /api/events
     * 모든 공연 목록을 조회하고 반환합니다.
     * @return 공연 목록 (List<EventDto>)
     */
    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents() {
        // Service 계층을 호출하여 Event 목록을 가져옵니다.
        List<EventDto> events = eventService.findAllEvents();

        // HTTP 200 OK 응답과 함께 이벤트 목록을 JSON 형태로 반환합니다.
        return ResponseEntity.ok(events);
    }
    /**
     * GET /api/events/{eventId}/seats
     * 특정 이벤트의 좌석 목록을 조회하고 반환합니다.
     * @param eventId 좌석을 조회할 이벤트의 ID
     * @return 해당 이벤트의 좌석 목록 (List<Seat>)
     */
    @GetMapping("/{eventId}/seats")
    public ResponseEntity<List<Seat>> getSeatsByEventId(@PathVariable Long eventId) {
        // Service 계층을 호출하여 좌석 목록을 가져옵니다.

        System.out.println("test1 : /{eventId}/seats 컨트롤러 통과확인");

        List<Seat> seats = eventService.findSeatsByEventId(eventId);

        System.out.println("test2 : eventService.findSeatsByEventId(eventId) 통과확인");

        // 좌석 정보가 없으면 404 Not Found 또는 빈 목록(200 OK) 반환 (여기서는 빈 목록으로 처리)
        if (seats.isEmpty()) {
            System.out.println("test3 : seats.isEmpty() 확인");

            return ResponseEntity.ok(List.of()); // 빈 배열을 반환
        }

        // HTTP 200 OK 응답과 함께 좌석 목록을 JSON 형태로 반환합니다.
        return ResponseEntity.ok(seats);
    }

    @PostMapping("/update")
    public ResponseEntity<EventDto> createEvent(@RequestBody EventDto eventDto) {

        EventDto savedEvent = eventService.createEvent(eventDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
    }

    // 이벤트 상태 조절 ACTIVE / CANCELED
    @PatchMapping("/{eventId}/status")
    public ResponseEntity<Void> cancelEvent(@PathVariable Long eventId, @RequestParam("status") String status) {
        // Service 계층을 통해 상태 변경 로직 수행
        boolean isUpdated = eventService.updateEventStatus(eventId, status);

        if (isUpdated) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
    