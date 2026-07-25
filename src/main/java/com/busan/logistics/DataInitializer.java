package com.busan.logistics;

import com.busan.logistics.domain.Inventory;
import com.busan.logistics.domain.Product;
import com.busan.logistics.domain.Store;
import com.busan.logistics.repository.InventoryRepository;
import com.busan.logistics.repository.ProductRepository;
import com.busan.logistics.repository.StoreRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public DataInitializer(StoreRepository storeRepository,
                           ProductRepository productRepository,
                           InventoryRepository inventoryRepository) {
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. 기존 데이터가 데이터베이스에 이미 있으면 중복으로 넣지 않고 빠져나갑니다 (안전장치)
        if (storeRepository.count() > 0) {
            System.out.println(">>> [ERP 시스템 알림] 이미 데이터가 존재하므로 초기화를 건너뜁니다.");
            return;
        }

        // 2. 기존 지역 명칭 기반으로 100개 매장 자동 생성 로직 (100개 확장)
        String[] baseLocations = {
                "서면", "센텀", "남포", "광안리", "해운대", "영도", "사상", "덕천", "동래", "부산대",
                "경성대", "연산", "수영", "명지", "하단", "다대포", "기장", "송정", "송도", "초량",
                "부산역", "개금", "구서", "망미", "문현", "범일"
        };

        List<Store> createdStores = new ArrayList<>();
        System.out.println(">>> [ERP 시스템 알림] 부산 지역별 100개 매장 데이터 생성을 시작합니다...");

        for (int i = 0; i < 100; i++) {
            String loc = baseLocations[i % baseLocations.length];
            int suffixNum = (i / baseLocations.length) + 1;
            String storeName = suffixNum > 1 ? "부산 " + loc + " " + suffixNum + "호점" : "부산 " + loc + "점";

            Store store = new Store();
            store.setName(storeName);
            store.setAddress("부산광역시 " + loc + " 중심대로 " + (i + 1) + "번길");

            // 지도에 이쁘게 뿌려지도록 위/경도 자동 점증 세팅
            store.setLatitude(35.158 + (i * 0.001));
            store.setLongitude(129.059 + (i * 0.001));

            Store savedStore = storeRepository.save(store);
            createdStores.add(savedStore); // 아래에서 재고 매핑을 위해 리스트에 수집
        }
        System.out.println(">>> [ERP 시스템 알림] 총 100개의 매장 등록이 완료되었습니다!");

        // 3. 물류 시스템용 가상 상품 명칭 조합 리스트
        String[] productPrefix = {"맛있는", "유기농", "신선한", "부산특산", "프리미엄", "수제", "HACCP인증"};
        String[] productNames = {"버터떡", "어묵바", "밀면세트", "단팥빵", "매운소스", "간장게장", "전복죽", "만두", "김치", "새우튀김"};

        int priceBase = 1500;
        int count = 0;

        System.out.println(">>> [ERP 시스템 알림] 접두어와 명칭 조합을 통해 500개의 대량 데이터를 생성합니다...");

        // 4. 이중 루프를 통해 정확히 500개 상품을 만들고, 생성된 100개 지점에 모두 재고 등록하기
        while (count < 500) {
            for (String prefix : productPrefix) {
                for (String name : productNames) {
                    if (count >= 500) break;

                    count++;

                    // (1) 상품(Product) 생성 및 이름 조립
                    Product product = new Product();
                    product.setName(prefix + " " + name + " " + count);
                    product.setPrice(priceBase + (count * 100));
                    product = productRepository.save(product);

                    // (2) 생성된 100개 전 지점에 자동으로 재고 데이터 연동
                    for (int s = 0; s < createdStores.size(); s++) {
                        Store currentStore = createdStores.get(s);

                        Inventory inv = new Inventory();
                        inv.setStore(currentStore);
                        inv.setProduct(product);

                        if (s % 2 == 0) {
                            inv.setQuantity(100);
                        } else {
                            inv.setQuantity(50);
                        }

                        inventoryRepository.save(inv);
                    }
                }
            }
        }

        System.out.println(">>> [ERP 시스템 알림] 총 500개의 상품 및 100개 지점별 대량 재고 데이터가 성공적으로 구축되었습니다!");
    }
}