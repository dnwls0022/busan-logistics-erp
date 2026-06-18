package com.busan.logistics.service;

import com.busan.logistics.domain.Inventory;
import com.busan.logistics.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 읽기 작업의 성능을 높여줍니다.
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    // 1. 특정 매장의 실시간 재고 현황판 보기 (조회)
    public List<Inventory> getStoreInventory(Long storeId) {
        return inventoryRepository.findByStoreId(storeId);
    }

    // 2. 실시간 재고 조정 (ERP 핵심: 입고/출고 발생 시 실시간 갱신)
    @Transactional // 데이터가 실제로 바뀔 때는 이 어노테이션이 필수입니다!
    public Inventory updateStock(Long inventoryId, Integer amount) {
        // 창고에서 해당 재고 기록을 먼저 찾습니다.
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 재고 정보가 존재하지 않습니다. ID: " + inventoryId));

        // 실시간으로 장부 수량을 업데이트합니다.
        inventory.updateQuantity(amount);

        return inventory; // 변경된 최신 재고 정보를 반환합니다.
    }
}
