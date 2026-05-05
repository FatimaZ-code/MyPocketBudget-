package com.mypocket.budget.security;

import com.mypocket.budget.entity.User;
import com.mypocket.budget.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Implémentation de UserDetailsService pour Spring Security.
 * Permet à Spring Security de charger un utilisateur depuis la base de données
 * à partir de son email (utilisé comme identifiant unique).
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Charge un utilisateur par son email.
     * Appelé par Spring Security lors de l'authentification et par le filtre JWT.
     *
     * @param email L'email de l'utilisateur
     * @return UserDetails avec email, mot de passe hashé et rôles
     * @throws UsernameNotFoundException Si l'utilisateur n'existe pas
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé : " + email));

        // Spring Security attend un objet UserDetails
        // On utilise l'implémentation standard avec email + password hashé
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.emptyList() // Pas de rôles complexes pour ce TP
        );
    }
}
