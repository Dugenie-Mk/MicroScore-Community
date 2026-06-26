package com.microscore.scoring_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "score")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pretId", nullable = false)
    private Long pretId;

    @Column(name = "clientId", nullable = false)
    private Long clientId;

    @Column(name = "scoreTotal", nullable = false)
    private Double scoreTotal;

    @Column(name = "dateCalcul")
    private LocalDateTime dateCalcul;

    @PrePersist
    protected void onCreate() {
        this.dateCalcul = LocalDateTime.now();
    }
}