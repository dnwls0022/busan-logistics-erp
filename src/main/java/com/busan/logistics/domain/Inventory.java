package com.busan.logistics.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.springframework.web.bind.annotation.PutMapping;

@Entity
@Getter
@Setter  // 4. 추가!
@NoArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 매장의 재고인지 연결
    @ManyToOne
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    // 어떤 디저트의 재고인지 연결
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // 현재 실시간 재고 수량
    @Column(nullable = false)
    private Integer quantity;

    public Inventory(Store store, Product product, Integer quantity) {
        this.store = store;
        this.product = product;
        this.quantity = quantity;
    }

    // 재고 변동 시 수량을 변경해주는 핵심 비즈니스 메서드 (ERP 핵심)
    @PutMapping
    public void updateQuantity(Integer amount) {
        this.quantity = amount;
    }
}