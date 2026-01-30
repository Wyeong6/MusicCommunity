package com.musicCommunity.dto;

import lombok.*;

/**
 * 사용자 정보를 담는 DTO.
 * DB 매핑, 조회 및 안전한 수정을 위해 Builder 패턴을 적용합니다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserDto {
    private Long id; // DB에서 조회할 때 사용
    private String userLoginId;
    private String password; // 암호화된 비밀번호
    private String nickname;
    private String role;

    /**
     * 불변 객체의 안전한 수정을 위한 빌더 메서드.
     * toBuilder()를 호출하면 현재 객체의 필드를 복사한 새로운 빌더 객체를 반환합니다.
     */
    public UserDtoBuilder toBuilder() {
        return new UserDtoBuilder()
                .id(this.id)
                .userLoginId(this.userLoginId)
                .password(this.password)
                .nickname(this.nickname)
                .role(this.role);
    }
}
