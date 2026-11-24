package com.busan.logistics.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity // 이 클래스는 DB의 테이블과 1:1로 매칭되는 녀석이라고 스프링에게 알려줍니다.
@Table(name = "products") // DB에 생성될 테이블 이름을 'products'로 지정합니다.
@Getter // Lombok 덕분에 getter 메서드를 일일이 안 짜도 자동 생성됩니다.
@Setter // 값 변경을 위한 setter 메서도 자동 생성됩니다.
@NoArgsConstructor // 기본 생성자를 자동으로 만들어줍니다.
public class Product {

    @Id // 테이블의 주인공 열(PK, 기본키)로 지정합니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 숫자가 1, 2, 3... 자동으로 증가하게 합니다.
    private Long id;

    @Column(nullable = false, length = 100) // 빈 값일 수 없고, 길이는 최대 100자
    private String name; // 상품명

    @Column(nullable = false)
    private Integer price; // 상품 단가
}
