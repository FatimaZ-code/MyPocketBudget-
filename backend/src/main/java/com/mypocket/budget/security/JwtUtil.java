package com.mypocket.budget.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Utilitaire JWT responsable de :
 * - La génération du token lors du login
 * - L'extraction des informations du token (email utilisateur)
 * - La validation du token (signature + expiration)
 *
 * Flux JWT :
 * 1. Login → generateToken(email) → JWT signé retourné au client
 * 2. Requête sécurisée → extractEmail(token) → Spring Security vérifie l'utilisateur
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration; // En millisecondes (86400000 = 24h)

    /**
     * Construit la clé de signature HMAC à partir du secret configuré.
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Génère un token JWT pour un utilisateur donné.
     * Le token contient : subject (email), date d'émission, date d'expiration.
     */
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)                         // Identifiant principal (email)
                .setIssuedAt(new Date())                   // Date de création
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // Expiration
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Signature HMAC-SHA256
                .compact();
    }

    /**
     * Extrait l'email (subject) du token JWT.
     * Utilisé par le filtre pour identifier l'utilisateur.
     */
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Vérifie si le token est valide (signature correcte et non expiré).
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token); // Lance une exception si invalide
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Parse et retourne le corps (claims) du token JWT.
     * Vérifie automatiquement la signature.
     */
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
