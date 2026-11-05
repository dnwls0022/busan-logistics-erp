package com.busan.logistics.service;

import com.busan.logistics.user.User;
import com.busan.logistics.repository.UserRepository;
import com.busan.logistics.Dto.SocialLoginRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * 1. 지정 관리자 로그인 검증 로직
     */
    public User loginAdmin(String email, String password, String adminCode) {
        if (!"dnwls00@admin.com".equals(email)) {
            throw new IllegalArgumentException("지정된 관리자 계정만 접근할 수 있습니다.");
        }
        if (!"admin00".equals(password)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        if (adminCode == null || !adminCode.matches("^\\d{4}$")) {
            throw new IllegalArgumentException("관리자 코드는 반드시 숫자 4자리여야 합니다. (ex: 7328)");
        }

        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newAdmin = new User();
                    newAdmin.setEmail(email);
                    newAdmin.setName("통합 관리자");
                    newAdmin.setRole("ADMIN");
                    newAdmin.setStatus("ACTIVE");
                    return userRepository.save(newAdmin);
                });
    }

    /**
     * 2. 일반 회원 로그인 및 미접속 상태 체크
     */
    @Transactional
    public User processUserLogin(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if ("DEACTIVATED".equals(user.getStatus()) || "승인거절".equals(user.getStatus())) {
            throw new IllegalStateException("계정이 비활성화되었습니다.");
        }

        if ("SUSPENDED".equals(user.getStatus())) {
            throw new IllegalStateException("관리자에 의해 이용이 정지된 계정입니다.");
        }

        LocalDateTime lastLogin = user.getLastLoginAt() != null ? user.getLastLoginAt() : LocalDateTime.now();
        long daysBetween = ChronoUnit.DAYS.between(lastLogin, LocalDateTime.now());

        if (daysBetween >= 14) {
            user.setStatus("DEACTIVATED");
            userRepository.save(user);
            throw new IllegalStateException("장기 미접속(14일 이상)으로 계정이 강제 비활성화되었습니다.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return user;
    }

    /**
     * 3. 소셜 로그인 및 회원가입 처리 로직
     */
    @Transactional
    public User socialLogin(SocialLoginRequestDto requestDto) {
        return userRepository.findByEmail(requestDto.getEmail())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(requestDto.getEmail());
                    newUser.setName(requestDto.getName());
                    newUser.setProvider(requestDto.getProvider());
                    newUser.setPhone(requestDto.getPhone());
                    newUser.setRole("USER");
                    newUser.setStatus("ACTIVE");
                    newUser.setLastLoginAt(LocalDateTime.now());

                    return userRepository.save(newUser);
                });
    }

    /**
     * 4. 관리자에 의한 회원 탈퇴(삭제) 기능
     */
    @Transactional
    public void deleteUserByAdmin(Long userId) {
        userRepository.deleteById(userId);
    }

    /**
     * 5. 관리자에 의한 회원 상태 변경
     */
    @Transactional
    public void updateUserStatusByAdmin(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 회원을 찾을 수 없습니다."));
        user.setStatus(status);
        userRepository.save(user);
    }

    /**
     * 🟢 6. 이름과 연락처로 회원 존재 여부 확인 및 이메일 조회 서비스 메서드 추가
     */
    public User findByNameAndPhone(String name, String phone) {
        return userRepository.findByNameAndPhone(name, phone)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보를 찾을 수 없습니다."));
    }
}