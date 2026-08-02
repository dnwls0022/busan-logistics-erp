package com.busan.logistics.controller;

import com.busan.logistics.user.User;
import com.busan.logistics.repository.UserRepository;
import com.busan.logistics.Dto.SocialLoginRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class UserController {

    private final UserRepository userRepository;

    // 🟢 전체 사용자 목록 조회 API (관리자 페이지용)
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 일반 회원가입 API
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User signupData) {
        // 이메일 중복 체크
        if (userRepository.findByEmail(signupData.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("이미 존재하는 이메일입니다.");
        }

        // DB에 저장 (신규 가입 시 기본 상태 설정이 필요하다면 여기서 처리 가능)
        User savedUser = userRepository.save(signupData);
        return ResponseEntity.ok(savedUser);
    }

    // 🟢 일반 로그인 API (비활성화/승인거절 계정 차단 로직 추가)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        return userRepository.findByEmail(email)
                .map(user -> {
                    // 💡 권한 해제(승인거절)된 계정일 경우 로그인 차단
                    if ("승인거절".equals(user.getStatus())) {
                        return ResponseEntity.badRequest().body("계정이 비활성화되었습니다.");
                    }

                    // 비밀번호 일치 여부 확인
                    if (user.getPassword() != null && user.getPassword().equals(password)) {
                        return ResponseEntity.ok(user);
                    } else {
                        return ResponseEntity.badRequest().body("비밀번호가 일치하지 않습니다.");
                    }
                })
                .orElse(ResponseEntity.badRequest().body("존재하지 않는 이메일입니다."));
    }

    // 🟢 관리자 페이지용 사용자 상태 변경(승인/거절) API 추가
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setStatus(request.get("status")); // "승인완료" 또는 "승인거절"
                    userRepository.save(user);
                    return ResponseEntity.ok("상태가 변경되었습니다.");
                })
                .orElse(ResponseEntity.badRequest().body("사용자를 찾을 수 없습니다."));
    }

    // 🌟 소셜 로그인 연동 API
    @PostMapping("/social-login")
    public ResponseEntity<?> socialLogin(@RequestBody SocialLoginRequestDto requestDto) {
        return userRepository.findByEmail(requestDto.getEmail())
                .map(user -> {
                    if ("승인거절".equals(user.getStatus())) {
                        return ResponseEntity.badRequest().body("계정이 비활성화되었습니다.");
                    }
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(requestDto.getEmail());
                    newUser.setName(requestDto.getName());
                    newUser.setProvider(requestDto.getProvider());
                    newUser.setPhone(requestDto.getPhone());
                    newUser.setRole("일반 사용자");
                    newUser.setStatus("승인완료"); // 신규 소셜 가입 기본 상태

                    User savedUser = userRepository.save(newUser);
                    return ResponseEntity.ok(savedUser);
                });
    }

    // 🟢 네이버 로그인 연동 API
    @PostMapping("/naver-login")
    public ResponseEntity<?> naverLogin(@RequestBody Map<String, String> request) {
        String tempEmail = "naver_user@naver.com";

        return userRepository.findByEmail(tempEmail)
                .map(user -> {
                    if ("승인거절".equals(user.getStatus())) {
                        return ResponseEntity.badRequest().body("계정이 비활성화되었습니다.");
                    }
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(tempEmail);
                    newUser.setName("네이버 사용자");
                    newUser.setProvider("naver");
                    newUser.setPhone("");
                    newUser.setRole("일반 사용자");
                    newUser.setStatus("승인완료");

                    User savedUser = userRepository.save(newUser);
                    return ResponseEntity.ok(savedUser);
                });
    }

    // 🟢 카카오 로그인 연동 API
    @PostMapping("/kakao-login")
    public ResponseEntity<?> kakaoLogin(@RequestBody Map<String, String> request) {
        String tempEmail = "kakao_user@kakao.com";

        return userRepository.findByEmail(tempEmail)
                .map(user -> {
                    if ("승인거절".equals(user.getStatus())) {
                        return ResponseEntity.badRequest().body("계정이 비활성화되었습니다.");
                    }
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(tempEmail);
                    newUser.setName("카카오 사용자");
                    newUser.setProvider("kakao");
                    newUser.setPhone("");
                    newUser.setRole("일반 사용자");
                    newUser.setStatus("승인완료");

                    User savedUser = userRepository.save(newUser);
                    return ResponseEntity.ok(savedUser);
                });
    }
}