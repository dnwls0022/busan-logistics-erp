package com.busan.logistics.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*") // 👈 이 부분을 추가해주세요!
public class UserController {

    private final UserRepository userRepository;

    // 일반 회원가입 API
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User signupData) {
        // 이메일 중복 체크
        if (userRepository.findByEmail(signupData.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("이미 존재하는 이메일입니다.");
        }

        // DB에 저장
        User savedUser = userRepository.save(signupData);
        return ResponseEntity.ok(savedUser);
    }
}