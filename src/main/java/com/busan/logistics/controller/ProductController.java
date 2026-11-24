package com.busan.logistics.controller;

import com.busan.logistics.domain.Product;
import com.busan.logistics.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * 신규 상품 등록 주문 받기
     */
    @PostMapping
    public ResponseEntity<Long> createProduct(@RequestBody Product product) {
        Long productId = productService.registerProduct(product);
        return ResponseEntity.ok(productId);
    }

    /**
     * 전체 상품 목록 가져오기 주문 받기
     */
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.findAllProducts();
        return ResponseEntity.ok(products);
    }
}
