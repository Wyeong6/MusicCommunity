package com.musicCommunity.filter;

import com.musicCommunity.config.JwtUtil;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.Arrays;

public class ManualJwtFilter implements Filter {

    private final JwtUtil jwtUtil;

    public ManualJwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    // ★ 모든 응답에 CORS 헤더를 붙이는 공용 메서드
    private void addCorsHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    // ManualJwtFilter.java 수정본

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        addCorsHeaders(httpResponse);

        if (httpRequest.getMethod().equalsIgnoreCase("OPTIONS")) return;

        String path = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();

        // 1. 제외 경로 정의
        boolean isBasicWhiteList = path.contains("/users/login") || path.contains("/users/register") ||
                path.contains("/api/events") || path.contains("/api/users/logout");
        // 댓글 경로는 복수/단수 모두 체크하도록 수정
        boolean isPublicGetRequest = (path.contains("/api/reviews") || path.contains("/api/comment"))
                && method.equalsIgnoreCase("GET");

        // 2. JWT 토큰 추출 시도
        String jwt = getJwtFromCookie(httpRequest);
        boolean isValidToken = (StringUtils.hasText(jwt) && jwtUtil.validateToken(jwt));

        if (isValidToken) {
            // 토큰이 유효하면 일단 사용자 정보를 심어줍니다. (조회 시에도 내가 쓴 글인지 확인 가능)
            String username = jwtUtil.getSubjectFromToken(jwt);
            httpRequest.setAttribute("authenticatedUser", username);
            System.out.println(">>> 인증 성공: [" + username + "] - 경로: " + path);
        }

        // 3. 최종 권한 판단
        if (isValidToken || isBasicWhiteList || isPublicGetRequest) {
            // 유효한 토큰이 있거나, 없어도 화이트리스트 경로라면 통과!
            chain.doFilter(request, response);
        } else {
            // 토큰도 없고 화이트리스트도 아니면 401 에러
            System.out.println(">>> 인증 실패: 유효한 토큰 없음 - 경로: " + path);
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json;charset=UTF-8");
            httpResponse.getWriter().write("{\"message\": \"로그인이 필요한 서비스입니다.\"}");
        }
    }


    private String getJwtFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            System.out.println(">>> 요청 쿠키 목록 (" + cookies.length + "개):");
            Arrays.stream(cookies).forEach(cookie -> {
                String valuePreview = cookie.getValue().length() > 20 ?
                        cookie.getValue().substring(0, 20) + "..." :
                        cookie.getValue();

                System.out.printf("  - 이름: %s, 값: %s\n", cookie.getName(), valuePreview);
            });
        }

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (JwtUtil.AUTHORIZATION_HEADER.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void destroy() {}
}

