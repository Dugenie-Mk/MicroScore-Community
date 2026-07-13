package com.microscore.scoring_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "parametre_de_scoring")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParametreDeScoring {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "blocCritere", nullable = false)
    private BlocCritere blocCritere;

    @Column(name = "nomCritere", nullable = false, unique = true)
    private String nomCritere;

    @Column(name = "poidsCritere", nullable = false)
    private Double poidsCritere;

    @Column(name = "actif", nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @Column(name = "description")
    private String description;
}