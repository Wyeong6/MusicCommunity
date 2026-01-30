package com.musicCommunity.mapper;

import com.musicCommunity.dto.UserDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface UserMapper {
    void save(UserDto user);

    Optional<UserDto> findByUsername(String username);

    Optional<UserDto> findById(Long userId);

    void deleteById(Long userId);

    void update(UserDto user);
}


