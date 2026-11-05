package com.busan.logistics.repository;

import com.busan.logistics.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByNameAndPhone(String name, String phone);

    // 🟢 [추가] 이메일 본인인증을 위한 조회 메서드
    Optional<User> findByNameAndEmail(String name, String email);
}