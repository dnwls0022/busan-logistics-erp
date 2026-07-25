package com.busan.logistics.repository;

import com.busan.logistics.domain.Store;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, Long> {
    // 기본적인 저장(save), 전체조회(findAll) 기능을 상속받아 자동으로 쓸 수 있게 됩니다!
}
