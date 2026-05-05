package com.mypocket.budget.repository;

import com.mypocket.budget.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository pour l'accès aux données des utilisateurs.
 * Spring Data JPA génère automatiquement les requêtes SQL.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Recherche un utilisateur par son email.
     * Utilisé lors de la connexion et pour vérifier l'unicité.
     */
    Optional<User> findByEmail(String email);

    /**
     * Vérifie si un email est déjà utilisé.
     * Utilisé lors de l'inscription.
     */
    boolean existsByEmail(String email);
}
