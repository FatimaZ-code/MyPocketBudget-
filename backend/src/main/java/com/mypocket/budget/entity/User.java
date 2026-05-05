package com.mypocket.budget.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

/**
 * Entité représentant un utilisateur de l'application.
 * Un utilisateur possède un email unique, un mot de passe hashé,
 * et une liste de transactions financières.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // Stocké hashé via BCrypt

    // Un utilisateur a plusieurs transactions (relation bidirectionnelle)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions;
}
