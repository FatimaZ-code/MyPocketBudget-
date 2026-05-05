package com.mypocket.budget.repository;

import com.mypocket.budget.entity.Transaction;
import com.mypocket.budget.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository pour l'accès aux données des transactions.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Récupère toutes les transactions d'un utilisateur donné.
     */
    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    /**
     * Récupère les transactions d'un utilisateur par type.
     */
    List<Transaction> findByUserIdAndType(Long userId, TransactionType type);

    /**
     * Calcule la somme des montants par type pour un utilisateur.
     * Utilisé pour calculer le solde (revenus - dépenses).
     */
    @Query("SELECT COALESCE(SUM(t.montant), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type")
    java.math.BigDecimal sumMontantByUserIdAndType(Long userId, TransactionType type);
}
