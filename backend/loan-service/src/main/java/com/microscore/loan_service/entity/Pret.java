package com.microscore.loan_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "pret")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pret {

    @Id
    private Long idPret;

    @Column(name = "idClient", nullable = false)
    private Long idClient;

    @Column(name = "scoreTotal", nullable = false)
    private Double scoreTotal;

    @Column(name = "dateEnregistrement")
    private LocalDateTime dateEnregistrement;

    @PrePersist
    protected void onCreate() {
        this.dateEnregistrement = LocalDateTime.now();
    }
}