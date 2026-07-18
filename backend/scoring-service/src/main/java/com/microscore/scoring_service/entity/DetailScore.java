package com.microscore.scoring_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "detail_score")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetailScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "scoreId", nullable = false)
    private Long scoreId;

    @Column(name = "blocCritere", nullable = false)
    private String blocCritere;

    @Column(name = "nomCritere", nullable = false)
    private String nomCritere;

    @Column(name = "poids")
    private Double poids;

    @Column(name = "pointsObtenus")
    private Double pointsObtenus;
}
