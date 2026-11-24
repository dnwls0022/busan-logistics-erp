package com.busan.logistics.Dto;

import lombok.Getter;
import lombok.Setter;

// SocialLoginRequestDto.java
@Getter
@Setter
public class SocialLoginRequestDto {
    private String email;
    private String name;
    private String provider; // 예: "google"
    private String phone;    // 선택 사항
}