package com.busan.logistics.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users") // 테이블 이름은 환경에 맞게 확인
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

    // 💡 이 부분이 빠져있어서 에러가 난 것입니다. 아래 status 필드를 추가해 주세요!
    private String status;
}