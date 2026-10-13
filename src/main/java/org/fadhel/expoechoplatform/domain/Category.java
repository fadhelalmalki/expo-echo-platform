package org.fadhel.expoechoplatform.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String nameEn;

    @Column(nullable = false)
    private String nameAr;

    @Column(nullable = false)
    private String colorStart;

    @Column(nullable = false)
    private String colorEnd;

    @Column(nullable = false)
    private String icon;

    @ManyToMany(mappedBy = "interests")
    @Builder.Default
    private Set<Visitor> visitors = new HashSet<>();
}
