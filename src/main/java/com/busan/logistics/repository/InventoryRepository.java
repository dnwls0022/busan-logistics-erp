package com.busan.logistics.repository;

import com.busan.logistics.domain.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // 특정 매장의 모든 디저트 재고 현황을 가져오는 마법의 메서드입니다.
    List<Inventory> findByStoreId(Long storeId);
}
