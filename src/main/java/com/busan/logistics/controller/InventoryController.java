package com.busan.logistics.controller;

import com.busan.logistics.domain.Inventory;
import com.busan.logistics.service.InventoryService;
import com.busan.logistics.repository.InventoryRepository; // 👈 새로 추가됨
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryRepository inventoryRepository; // 👈 DB 전체 조회를 위해 추가!

    // ✨ [새로 추가] 리액트 fetch('/api/inventories')가 요청하는 전체 재고 조회 문!
    @GetMapping
    public List<Inventory> getAllInventories() {
        return inventoryRepository.findAll();
    }

    // 1. 특정 매장의 실시간 재고 조회 (기존 로직 보존)
    @GetMapping("/store/{storeId}")
    public List<Inventory> getStoreInventory(@PathVariable Long storeId) {
        return inventoryService.getStoreInventory(storeId);
    }

    // 2. 관리자가 실시간으로 재고 수량을 변경할 때 (기존 로직 보존)
    @PutMapping("/{inventoryId}")
    public Inventory updateStock(@PathVariable Long inventoryId, @RequestParam Integer amount) {
        return inventoryService.updateStock(inventoryId, amount);
    }
}