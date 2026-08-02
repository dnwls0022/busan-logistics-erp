package com.busan.logistics.service;

import com.busan.logistics.user.User;
import com.busan.logistics.repository.UserRepository;
import com.busan.logistics.Dto.SocialLoginRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // 소셜 로그인 및 회원가입 처리 로직
    @Transactional
    public User socialLogin(SocialLoginRequestDto requestDto) {
        return userRepository.findByEmail(requestDto.getEmail())
                .orElseGet(() -> {
                    // UserService.java 의 socialLogin 메서드 내부
                    User newUser = new User();
                    newUser.setEmail(requestDto.getEmail());
                    newUser.setName(requestDto.getName());
                    newUser.setProvider(requestDto.getProvider());
                    newUser.setPhone(requestDto.getPhone());

                   // 💡 신규 가입자는 기본적으로 '일반 사용자' 또는 'USER'로 설정!
                    newUser.setRole("USER"); // 또는 "일반 사용자"

                    return userRepository.save(newUser);
                });
    }
}
