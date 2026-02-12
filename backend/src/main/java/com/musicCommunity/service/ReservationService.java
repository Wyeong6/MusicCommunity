package com.musicCommunity.service;

import com.musicCommunity.domain.Reservation;
import com.musicCommunity.dto.ReservationDto;
import com.musicCommunity.dto.ReservationRequestDto;
import com.musicCommunity.mapper.ReservationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    private final RedissonClient redissonClient;
    private final ReservationServiceExecutor reservationExecutor;
    private final ReservationMapper reservationMapper;

    @CacheEvict(value = "events", key = "'all_list'")
    public Reservation reserveSeat(ReservationRequestDto requestDto) {
        // 로그를 찍어 메서드 진입 여부를 확인합니다.
        log.info("예약 요청 진입 - User: {}, Seat: {}", requestDto.getUserId(), requestDto.getSeatId());

        RLock lock = redissonClient.getLock("lock:seat:" + requestDto.getSeatId());

        try {
            // waitTime: 3~5초 정도로 넉넉히 (줄은 서되 너무 오래는 안 기다림)
            // leaseTime: -1로 설정하여 Watchdog이 트랜잭션 종료 시까지 락을 유지하게 함 (핵심!)
            boolean available = lock.tryLock(100, -1, TimeUnit.MILLISECONDS);

            if (!available) {
                log.error("락 획득 실패 - 대기 시간 초과");
                throw new RuntimeException("접속자가 많아 처리에 실패했습니다. 다시 시도해주세요.");
            }

            // 2. 실제 DB 로직 실행 (트랜잭션 보장됨)
            return reservationExecutor.proceed(requestDto);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("시스템 오류가 발생했습니다.");
        } finally {
            // 3. 반드시 락 해제
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
                log.info("락 해제 완료");
            }
        }
    }

    public Reservation getReservation(Long reservationId) {
        return reservationMapper.findById(reservationId);
    }

    public List<ReservationDto> getReservationsByUserId(Long userId) {
        return reservationMapper.findByUserId(userId);
    }
}