package com.microscore.user_service.repository;

import com.microscore.user_service.entity.CompteBancaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompteBancaireRepository extends JpaRepository<CompteBancaire, Long> {

    List<CompteBancaire> findByUserId(Long userId);
}