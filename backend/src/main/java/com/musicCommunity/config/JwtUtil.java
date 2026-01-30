package com.musicCommunity.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    // 쿠키 이름 (JWT를 담을 HTTP-Only 쿠키의 이름)
    public static final String AUTHORIZATION_HEADER = "AccessToken";

    @Value("${jwt.secret.key}")
    private String secretKeyBase64;

    // 💡 추가: private 필드인 expirationTime을 외부로 노출하는 public getter 메서드
    @Getter
    @Value("${jwt.expiration.time}")
    private long expirationTime;

    private Key key;

    // Base64 문자열로 받은 비밀키를 실제 Key 객체로 변환
    @PostConstruct
    public void init() {
        byte[] bytes = Base64.getDecoder().decode(secretKeyBase64);
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    /**
     * JWT 토큰 생성
     * @param userId 토큰의 주체 (사용자의 DB 기본키 ID - Long 타입이지만 String으로 변환되어 넘어옴)
     */
    public String createToken(String userId) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + expirationTime);



        return Jwts.builder()
                .setSubject(userId) // 💡 Subject에 사용자 ID(String)를 저장
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * JWT 토큰을 담는 HTTP-Only 쿠키 생성
     */
    public Cookie createCookie(String token) {
        Cookie cookie = new Cookie(AUTHORIZATION_HEADER, token);

        // HttpOnly 설정: XSS 공격 방지를 위해 클라이언트 JavaScript 접근을 차단
        cookie.setHttpOnly(true);

        // Secure 설정: HTTPS에서만 전송 (운영 환경에서는 true 필수)
        // 개발 환경 테스트를 위해 false로 설정할 수 있습니다.
        cookie.setSecure(false);

        // 경로 설정: 모든 요청에서 쿠키가 전송되도록 설정
        cookie.setPath("/");

        // MaxAge 설정: 토큰 만료 시간과 동일하게 설정
        cookie.setMaxAge((int) (expirationTime / 1000L));

        return cookie;
    }

    /**
     * JWT 토큰 유효성 검증
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.err.println("Expired JWT token: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        }
        return false;
    }

    /**
     * 토큰에서 Subject (사용자 ID) 추출
     * 이전의 getUsernameFromToken 대신 사용됩니다.
     */
    public String getSubjectFromToken(String token) { // 💡 메서드 이름 변경
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
            return claims.getSubject(); // Subject는 이제 Long ID의 String 형태입니다.
        } catch (Exception e) {
            return null;
        }
    }

    public String getUserId(String token) {
        return getSubjectFromToken(token);
    }
}
