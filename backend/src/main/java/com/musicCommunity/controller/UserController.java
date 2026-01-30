package com.musicCommunity.controller;

import com.musicCommunity.dto.*;
import com.musicCommunity.config.JwtUtil;
import com.musicCommunity.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil; // JwtUtil 주입

    @PostMapping("/register") //회원가입
    public ResponseEntity<String> register(@Valid @RequestBody RegisterDto registerDto) {
        try {

            log.info("회원가입 /register 의 RegisterDto : " + registerDto);
            
            userService.registerUser(registerDto);

            return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Registration failed", HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto, HttpServletResponse response) {

        log.info("/login 에서 LoginDto : " + loginDto);

        Long userId = userService.login(loginDto);

        if (userId == null || userId <= 0) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        String token = jwtUtil.createToken(String.valueOf(userId));
        long maxAge = jwtUtil.getExpirationTime() / 1000L;

        response.addHeader("Set-Cookie", buildJwtCookie(token, maxAge));

        log.info("로그인 성공: userId = {}", userId);

        UserDto userDto = userService.getUserDtoById(userId);

        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {

        log.info("로그아웃 매핑 호출됨");

        response.addHeader("Set-Cookie", buildJwtCookie("", 0));

        return ResponseEntity.ok("Logout successful");

    }

    //예약목록 조회
    @GetMapping("/mypage/{id}/reservations")
    public ResponseEntity<List<ReservationDto>>getMyReservations(
            @RequestAttribute("authenticatedUser") String authenticatedUserIdString,
            @PathVariable("id") Long id) {

        Long authenticatedUserId = parseUserId(authenticatedUserIdString);

        if(authenticatedUserId == null) {
            return ResponseEntity.badRequest().build();
        }

        if (!authenticatedUserId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<ReservationDto> reservations = userService.getReservationsByUserId(authenticatedUserId);

        return ResponseEntity.ok(reservations);
    }

    // 마이페이지
    @GetMapping("/mypage/{id}")
    public ResponseEntity<UserDto> getMyProfile(
            @RequestHeader(value = "Authorization", required = false) String tokenHeader,
            @PathVariable("id") Long id) {

        if (tokenHeader == null || !tokenHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = tokenHeader.substring(7); // "Bearer " 제거
        String userIdString = jwtUtil.getUserId(token);

        if (userIdString == null || userIdString.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401 Unauthorized
        }

        Long authenticatedUserId = parseUserId(userIdString);

        if (authenticatedUserId == null) {
            return ResponseEntity.badRequest().build();
        }

        if (!authenticatedUserId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UserDto userProfile = userService.getUserDtoById(authenticatedUserId);

        return (userProfile == null)
                ? ResponseEntity.status(HttpStatus.NOT_FOUND).build()
                : ResponseEntity.ok(userProfile);
    }

    // 로그인 상태 체크, 세션체크
    @GetMapping("/me")
    public ResponseEntity<?> getAuthenticatedUser(HttpServletRequest request) {

        String token = extractJwtFromCookie(request);
        if (token == null) return unauthorized("No token");

        String userIdString = jwtUtil.getUserId(token);
        if (userIdString == null) return unauthorized("Invalid token");

        Long userId = parseUserId(userIdString);
        if (userId == null) return ResponseEntity.badRequest().body("Invalid userId format");

        UserDto userDto = userService.getUserDtoById(userId);
        if (userDto == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");

        UserStatusResponse response = new UserStatusResponse(
                userDto.getId(), userDto.getNickname(), userDto.getRole());

        return ResponseEntity.ok(response);
    }

    // 회원탈퇴
    @DeleteMapping("/withdrawal")
    public ResponseEntity<Void> withdrawUser(
            @RequestAttribute("authenticatedUser") String authenticatedUserIdString,
            HttpServletResponse response) {

        Long userId = parseUserId(authenticatedUserIdString);
        if (userId == null) return ResponseEntity.badRequest().build();

        try {
            userService.withdrawUser(userId);

            response.addHeader("Set-Cookie", buildJwtCookie("", 0));

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("회원 탈퇴 실패: userId = {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //  공통 기능 메서드
    private String buildJwtCookie(String token, long maxAge) {
        return String.format(
                "%s=%s; Max-Age=%d; Path=/; HttpOnly; Secure; SameSite=None",
                JwtUtil.AUTHORIZATION_HEADER, token, maxAge
        );
    }

    private Long parseUserId(String idStr) {
        if (idStr == null) return null;
        try {
            return Long.parseLong(idStr);
        } catch (NumberFormatException e) {
            log.error("유효하지 않은 userId 포맷: {}", idStr);
            return null;
        }
    }
    private String extractJwtFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;

        for (Cookie cookie : request.getCookies()) {
            if (JwtUtil.AUTHORIZATION_HEADER.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private ResponseEntity<String> unauthorized(String message) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(message);
    }

    @PutMapping("/update")
    public ResponseEntity<?> update(@RequestBody UserUpdateDto updateDto) {
        try {
            userService.updateUser(updateDto);
            return ResponseEntity.ok("Update Successful");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}

