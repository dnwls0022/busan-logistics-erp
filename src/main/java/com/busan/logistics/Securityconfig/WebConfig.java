package com.busan.logistics.Securityconfig;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*") // 기존에 allowedOrigins로 되어있다면 이걸로 변경!
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");

    }
}