package com.musicCommunity.dto;
import lombok.ToString;
import lombok.Value;

@Value
@ToString
public class LoginDto {
    private String userLoginId;
    private String password;
}