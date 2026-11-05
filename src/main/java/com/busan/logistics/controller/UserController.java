package com.busan.logistics.controller;

import com.busan.logistics.user.User;
import com.busan.logistics.repository.UserRepository;
import com.busan.logistics.service.UserService;
import com.busan.logistics.Dto.SocialLoginRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final JavaMailSender mailSender;

    // 전체 사용자 목록 조회 API (관리자 페이지용)
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 일반 회원가입 API
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User signupData) {
        if (userRepository.findByEmail(signupData.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("이미 존재하는 이메일입니다.");
        }

        User savedUser = userRepository.save(signupData);
        return ResponseEntity.ok(savedUser);
    }

    // 일반 로그인 API
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        return userRepository.findByEmail(email)
                .map(user -> {
                    if ("승인거절".equals(user.getStatus()) || "DEACTIVATED".equals(user.getStatus())) {
                        return ResponseEntity.badRequest().body("계정이 비활성화되었습니다.");
                    }

                    if (user.getPassword() != null && user.getPassword().equals(password)) {
                        return ResponseEntity.ok(user);
                    } else {
                        return ResponseEntity.badRequest().body("비밀번호가 일치하지 않습니다.");
                    }
                })
                .orElse(ResponseEntity.badRequest().body("존재하지 않는 이메일입니다."));
    }

    // 관리자 페이지용 사용자 상태 변경 API
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setStatus(request.get("status"));
                    userRepository.save(user);
                    return ResponseEntity.ok("상태가 변경되었습니다.");
                })
                .orElse(ResponseEntity.badRequest().body("사용자를 찾을 수 없습니다."));
    }

    // 소셜 로그인 연동 API
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
                    newUser.setStatus("승인완료");

                    User savedUser = userRepository.save(newUser);
                    return ResponseEntity.ok(savedUser);
                });
    }

    // 네이버 로그인 연동 API
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

    // 카카오 로그인 연동 API
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

    // ==========================================
    // 🟢 아이디 찾기 및 비밀번호 찾기 API (이메일 인증 기반)
    // ==========================================

    /**
     * [아이디 찾기 Step 1] 이름과 이메일 일치 확인 후 인증메일 전송
     */
    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerification(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");

        try {
            userRepository.findByNameAndEmail(name, email)
                    .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보를 찾을 수 없습니다."));

            String authCode = "123456";

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("[카페물류시스템] 아이디 찾기 인증번호");
            message.setText("안녕하세요 " + name + "님,\n요청하신 인증번호는 [ " + authCode + " ] 입니다.");
            mailSender.send(message);

            return ResponseEntity.ok("인증메일이 전송되었습니다. 메일함을 확인해주세요.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("일치하는 회원 정보를 찾을 수 없습니다.");
        }
    }

    /**
     * [아이디 찾기 Step 2] 인증번호 확인 후 이메일 반환
     */
    @PostMapping("/verify-and-find-id")
    public ResponseEntity<?> verifyAndFindId(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String code = request.get("code");

        if (!"123456".equals(code)) {
            return ResponseEntity.badRequest().body("인증번호가 일치하지 않습니다.");
        }

        try {
            User user = userRepository.findByNameAndEmail(name, email)
                    .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

            return ResponseEntity.ok(Map.of("email", user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("회원 정보를 찾을 수 없습니다.");
        }
    }

    /**
     * [비밀번호 찾기] 이름과 이메일 확인 후 임시 비밀번호 발급 및 메일 전송
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");

        System.out.println("🔍 비밀번호 찾기 요청 - 이름: " + name + ", 이메일: " + email);

        try {
            User user = userRepository.findByNameAndEmail(name, email)
                    .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보를 찾을 수 없습니다."));

            String tempPassword = "pass" + ((int)(Math.random() * 8999) + 1000);

            user.setPassword(tempPassword);
            userRepository.save(user);

            System.out.println("✅ 임시 비밀번호 변경 완료 [" + user.getEmail() + "] -> " + tempPassword);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("[카페물류시스템] 임시 비밀번호 안내");
            message.setText("안녕하세요 " + name + "님,\n요청하신 임시 비밀번호는 [ " + tempPassword + " ] 입니다.\n로그인 후 반드시 비밀번호를 변경해 주세요.");
            mailSender.send(message);

            return ResponseEntity.ok("임시 비밀번호가 이메일로 전송되었습니다. 메일함을 확인해주세요.");
        } catch (Exception e) {
            System.out.println("❌ 비밀번호 찾기 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body("일치하는 회원 정보를 찾을 수 없습니다.");
        }
    }
}