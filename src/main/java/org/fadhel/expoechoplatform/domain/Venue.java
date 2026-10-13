package org.fadhel.expoechoplatform.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "venues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nameEn;

    @Column(nullable = false)
    private String nameAr;

    @Column(nullable = false)
    private String areaCode;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;
}
