package com.busan.logistics.user; // 본인 프로젝트 패키지에 맞게 수정

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@jakarta.persistence.Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Entity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;
    private String branch;
    private String phone;

    @Builder.Default
    private String role = "일반 사용자";

    @Builder.Default
    private String provider = "local"; // local, google 등

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}