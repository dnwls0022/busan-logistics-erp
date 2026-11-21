package com.busan.logistics.controller;

import com.busan.logistics.user.User;
import com.busan.logistics.repository.UserRepository;
import com.busan.logistics.service.UserService;
import com.busan.logistics.Dto.SocialLoginRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final JavaMailSender mailSender;

    // 만약 PostRepository나 CommentRepository가 있다면 여기에 주입(DI)하여 사용하시면 됩니다.
    // private final PostRepository postRepository;
    // private final CommentRepository commentRepository;

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
                    // 탈퇴 계정 또는 승인거절 계정 로그인 차단
                    if ("승인거절".equals(user.getStatus()) || "DEACTIVATED".equals(user.getStatus())) {
                        return ResponseEntity.badRequest().body("탈퇴한 계정이거나 비활성화된 계정입니다.");
                    }

                    if (user.getPassword() != null && user.getPassword().equals(password)) {
                        return ResponseEntity.ok(user);
                    } else {
                        return ResponseEntity.badRequest().body("비밀번호가 일치하지 않습니다.");
                    }
                })
                .orElse(ResponseEntity.badRequest().body("존재하지 않는 이메일입니다."));
    }

    // ==========================================
    // 🟢 [1번 해결] 지점 관리자 / 어드민 로그인 API 추가
    // ==========================================
    @PostMapping("/login/admin")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String adminCode = request.get("adminCode");

        // 관리자 코드 검증 (숫자 4자리 '7328')
        if (!"7328".equals(adminCode)) {
            return ResponseEntity.badRequest().body("관리자 코드가 일치하지 않습니다. (예: 7328)");
        }

        return userRepository.findByEmail(email)
                .map(user -> {
                    if ("승인거절".equals(user.getStatus()) || "DEACTIVATED".equals(user.getStatus())) {
                        return ResponseEntity.badRequest().body("탈퇴한 계정이거나 비활성화된 계정입니다.");
                    }

                    if (user.getPassword() != null && user.getPassword().equals(password)) {
                        return ResponseEntity.ok(user);
                    } else {
                        return ResponseEntity.badRequest().body("관리자 비밀번호가 일치하지 않습니다.");
                    }
                })
                .orElse(ResponseEntity.badRequest().body("존재하지 않는 관리자 이메일입니다."));
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
                    if ("승인거절".equals(user.getStatus()) || "DEACTIVATED".equals(user.getStatus())) {
                        return ResponseEntity.badRequest().body("탈퇴한 계정이거나 비활성화된 계정입니다.");
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
                    if ("승인거절".equals(user.getStatus()) || "DEACTIVATED".equals(user.getStatus())) {
                        return ResponseEntity.badRequest().body("탈퇴한 계정이거나 비활성화된 계정입니다.");
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
                    if ("승인거절".equals(user.getStatus()) || "DEACTIVATED".equals(user.getStatus())) {
                        return ResponseEntity.badRequest().body("탈퇴한 계정이거나 비활성화된 계정입니다.");
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
    // 🟢 [13번] 마이페이지 내 활동 내역(작성 글/댓글) 조회 API
    // ==========================================
    @GetMapping("/me/activities")
    public ResponseEntity<?> getMyActivities(@RequestParam("email") String email) {
        System.out.println("📊 활동 내역 조회 요청 이메일: " + email);

        Map<String, Object> response = new HashMap<>();

        try {
            /*
              [참고] 추후 PostRepository와 CommentRepository가 주입되면 아래 주석을 풀어 실제 DB와 연동하세요.
              List<Post> posts = postRepository.findByAuthorEmail(email);
              List<Comment> comments = commentRepository.findByAuthorEmail(email);

              response.put("posts", posts.stream().map(p -> {
                  Map<String, Object> map = new HashMap<>();
                  map.put("id", p.getId());
                  map.put("title", p.getTitle());
                  map.put("date", p.getCreatedAt() != null ? p.getCreatedAt().toString().substring(0, 10) : "");
                  return map;
              }).collect(Collectors.toList()));

              response.put("comments", comments.stream().map(c -> {
                  Map<String, Object> map = new HashMap<>();
                  map.put("id", c.getId());
                  map.put("content", c.getContent());
                  map.put("postTitle", c.getPost() != null ? c.getPost().getTitle() : "게시글");
                  map.put("date", c.getCreatedAt() != null ? c.getCreatedAt().toString().substring(0, 10) : "");
                  return map;
              }).collect(Collectors.toList()));
            */

            // 현재는 임시 테스트용 데이터 바인딩 (에러 방지)
            response.put("posts", List.of());
            response.put("comments", List.of());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ 활동 내역 조회 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body("활동 내역을 불러오지 못했습니다.");
        }
    }

    // ==========================================
    // 🟢 [12번 수정] 회원 탈퇴 API (DB 삭제 -> 상태를 DEACTIVATED로 변경)
    // ==========================================
    @DeleteMapping("/me")
    @Transactional
    public ResponseEntity<?> deleteUser(@RequestParam("email") String email) {
        System.out.println("⚠️ 회원탈퇴(비활성화) 요청 이메일: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));

        // 계정 상태를 탈퇴(DEACTIVATED)로 변경하여 재로그인 차단
        user.setStatus("DEACTIVATED");
        userRepository.save(user);

        return ResponseEntity.ok("회원탈퇴가 정상적으로 처리되었습니다.");
    }

    // ==========================================
    // 🟢 아이디 찾기 및 비밀번호 찾기 API (이메일 인증 기반)
    // ==========================================

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

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");

        try {
            User user = userRepository.findByNameAndEmail(name, email)
                    .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보를 찾을 수 없습니다."));

            String tempPassword = "pass" + ((int)(Math.random() * 8999) + 1000);

            user.setPassword(tempPassword);
            userRepository.save(user);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("[카페물류시스템] 임시 비밀번호 안내");
            message.setText("안녕하세요 " + name + "님,\n요청하신 임시 비밀번호는 [ " + tempPassword + " ] 입니다.\n로그인 후 반드시 비밀번호를 변경해 주세요.");
            mailSender.send(message);

            return ResponseEntity.ok("임시 비밀번호가 이메일로 전송되었습니다. 메일함을 확인해주세요.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("일치하는 회원 정보를 찾을 수 없습니다.");
        }
    }
}