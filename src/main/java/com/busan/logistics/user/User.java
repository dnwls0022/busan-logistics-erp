package com.busan.logistics.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private String name;
    private String phone;
    private String branch;
    private String role;
    private String provider;

    // 1. 계정 상태 필드 (ACTIVE, SUSPENDED, DEACTIVATED)
    private String status;

    // 2. 마지막 접속 일시 필드 (Lombok @Getter/@Setter가 자동으로 생성해 줍니다)
    private LocalDateTime lastLoginAt;

    // 관리자 코드 필드가 필요하다면 아래도 추가해 주세요!
    // private String adminCode;
}