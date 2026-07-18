package com.microscore.loan_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "parametre_app")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Parametre {

    @Id
    @Column(name = "cle", nullable = false)
    private String cle;

    @Column(name = "valeur")
    private String valeur;
}
