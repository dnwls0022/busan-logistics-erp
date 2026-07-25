package com.busan.logistics.service;

import com.busan.logistics.domain.Product;
import com.busan.logistics.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    /**
     * 신규 상품 등록
     */
    @Transactional
    public Long registerProduct(Product product) {
        Product savedProduct = productRepository.save(product);
        return savedProduct.getId();
    }

    /**
     * 전체 상품 목록 조회
     */
    public List<Product> findAllProducts() {
        return productRepository.findAll();
    }
}