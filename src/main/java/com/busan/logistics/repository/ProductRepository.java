package com.busan.logistics.repository;

import com.busan.logistics.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // 스프링 데이터 JPA가 기본적인 상자(저장, 조회, 수정, 삭제)를 자동으로 만들어 줍니다!
}
