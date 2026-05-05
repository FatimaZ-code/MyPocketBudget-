package com.mypocket.budget.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO pour la réponse d'authentification.
 * Contient le token JWT et les infos de base de l'utilisateur.
 */
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private Long userId;
    private String message;
}
