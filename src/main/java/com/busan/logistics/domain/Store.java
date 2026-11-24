package com.busan.logistics.domain; // 패키지 경로는 우진님 프로젝트 구조에 맞게 조절해주세요!

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter; // 2. 이거 임포트 확인
import lombok.NoArgsConstructor;

@Entity
@Getter
@Setter  // 4. 추가!
@NoArgsConstructor
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;         // 매장 이름 (ex: 부산 버터떡 본점)

    private String address;      // 매장 주소

    private Double latitude;     // 지도에 핀을 꽂을 위도 (X 좌표)
    private Double longitude;    // 지도에 핀을 꽂을 경도 (Y 좌표)

    public Store(String name, String address, Double latitude, Double longitude) {
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}