package com.busan.logistics.controller;

import com.busan.logistics.domain.Store;
import com.busan.logistics.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 나중에 리액트(포트 3000 등)와 연동할 때 발생하는 보안 차단(CORS)을 미리 예방해줍니다!
public class StoreController {

    private final StoreRepository storeRepository;

    // 1. 전체 매장 목록 조회 (지도에 핀 찍기용)
    @GetMapping
    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    // 2. 새로운 매장 등록 (관리자 기능)
    @PostMapping
    public Store createStore(@RequestBody Store store) {
        return storeRepository.save(store);
    }
}
