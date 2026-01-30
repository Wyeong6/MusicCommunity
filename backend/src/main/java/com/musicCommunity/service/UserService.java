package com.musicCommunity.service;

import com.musicCommunity.dto.*;
import com.musicCommunity.mapper.ReservationMapper;
import com.musicCommunity.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder; // 추가

import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final ReservationMapper reservationMapper;

    @Transactional
    public void registerUser(RegisterDto registerDto) {

        log.info("registerUser 시작: {}", registerDto);

        Optional<UserDto> existingUser = userMapper.findByUsername(registerDto.getUserLoginId());

        if(existingUser.isPresent()){
            throw new RuntimeException("이미 존재하는 사용자 이름입니다.");
        }

        String encodedPassword = passwordEncoder.encode(registerDto.getPassword());

        UserDto newUserDto = UserDto.builder()
                .userLoginId(registerDto.getUserLoginId())
                .password(encodedPassword)
                .nickname(registerDto.getNickname())
                .role(registerDto.getRole())
                .build();
        log.info("엔티티 생성 완료");

        userMapper.save(newUserDto);
        log.info("생성된 암호화 비밀번호: {}", encodedPassword);
        log.info("DB 저장 완료");
    }

    @Transactional(readOnly = true) // 데이터 조회만 하기때문에 readonly true
    public Long login(LoginDto loginDto) {
        // 1.DB에서 아이디로 사용자 정보 조회

        log.info("userService의 login 함수 시작");

        log.info("userService의 loginDto : " + loginDto);

        UserDto user = userMapper.findByUsername(loginDto.getUserLoginId()) //Optional에서 값을 꺼내고, 사용자가 없으면 null 반환
                .orElse(null);

        log.info("userService의 login 함수 userMapper.findByUsername 통과");

        log.info("user = " + user);


        // 2.사용자가 있는지 없는지 확인
        if (user == null) {
            return null;
        }

        log.info("userService의 login 함수 if user==null 통과");


        if (passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
            log.info("userService의 login 함수 passwordEncoder 통과");
            return user.getId();
        } else {
            return null; // 비밀번호 불일치 -> 로그인 실패
        }

    }

    /**
     * ID로 사용자 정보를 조회하고, 클라이언트에 전송하기 전 비밀번호 필드를 제거합니다.
     */
    @Transactional(readOnly = true)
    public UserDto getUserDtoById(Long userId) {
        // UserMapper에서 findById(Long id)를 호출하여 UserDto를 가져옵니다.
        // 만약 로그인 성공 직후 호출되는데도 사용자를 찾을 수 없다면 런타임 오류로 처리합니다.
        UserDto userDto = userMapper.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자 ID: " + userId + "에 해당하는 사용자를 찾을 수 없습니다. (DB 오류 가능성)"));

        // 보안: toBuilder()를 사용하여 새로운 UserDto 객체를 만들고
        // 비밀번호 필드만 null로 덮어씌워 클라이언트에게 전송하지 않도록 합니다.
        return userDto.toBuilder()
                .password(null)
                .build();
    }

    @Transactional(readOnly = true)
    public Optional<UserDto> findUserByUsername(String username) {
        return userMapper.findByUsername(username);
    }

    /**
     * 특정 사용자의 예약 목록을 조회합니다.
     * @param userId 예약을 조회할 사용자 ID
     * @return 해당 사용자의 예약 정보 목록 (ReservationDto List)
     */
    @Transactional(readOnly = true)
    public List<ReservationDto> getReservationsByUserId(Long userId) {
        // ReservationMapper를 사용하여 데이터베이스에서 해당 userId의 모든 예약 정보를 조회합니다.
        // 만약 예약을 찾지 못하면 빈 리스트(List.of())를 반환하는 것이 일반적입니다.
        return reservationMapper.findByUserId(userId);
    }

    @Transactional
    public void withdrawUser(Long userId) {
        userMapper.deleteById(userId);
    }

    @Transactional
    public void updateUser(UserUpdateDto updateDto) {
        UserDto user = userMapper.findById(updateDto.getId()).orElseThrow( () -> new IllegalArgumentException("사용자를 찾을수 없습니다."));

        if (!passwordEncoder.matches(updateDto.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        UserDto.UserDtoBuilder builder = user.toBuilder().nickname(updateDto.getNickname());

        if (updateDto.getNewPassword() != null && !updateDto.getNewPassword().isEmpty()) {
            builder.password(passwordEncoder.encode(updateDto.getNewPassword()));
        }

        userMapper.update(builder.build());

    }
}
