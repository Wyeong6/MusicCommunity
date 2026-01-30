package com.musicCommunity.config;

import com.musicCommunity.filter.ManualJwtFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import jakarta.servlet.Filter;

@Configuration
public class FilterConfig {

    private final JwtUtil jwtUtil;

    // JwtUtil 주입
    public FilterConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public FilterRegistrationBean<Filter> jwtFilterRegistration() {
        FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();

        // ManualJwtFilter 인스턴스 생성 및 JwtUtil 주입
        registration.setFilter(new ManualJwtFilter(jwtUtil));

        // 필터가 적용될 URL 패턴 설정 (모든 /api/ 경로 또는 보호해야 할 경로에 적용)
        // 예시: 예약 관련 경로만 보호한다고 가정
        registration.addUrlPatterns("/*");

        // 필터의 순서 설정
        registration.setOrder(1);

        return registration;
    }
}