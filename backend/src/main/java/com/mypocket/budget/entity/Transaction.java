package com.mypocket.budget.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entité représentant une transaction financière.
 * Une transaction peut être un revenu ou une dépense,
 * et appartient obligatoirement à un utilisateur.
 */
@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Type de transaction : REVENU ou DEPENSE
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montant;

    @Column(nullable = false)
    private String categorie; // Ex: Alimentation, Salaire, Loyer...

    @Column(nullable = false)
    private LocalDate date;

    private String description; // Note optionnelle

    /**
     * Relation ManyToOne : plusieurs transactions pour un utilisateur.
     * On ne sérialise pas l'utilisateur dans les réponses JSON (évite la récursion).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;
}
