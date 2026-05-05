package com.mypocket.budget.config;

import com.mypocket.budget.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuration principale de la sécurité Spring Security.
 *
 * Points clés :
 * - Désactivation de la session HTTP (API REST = Stateless)
 * - CSRF désactivé (JWT gère la sécurité)
 * - Endpoints publics : /api/auth/** (login, register)
 * - Endpoints protégés : /api/transactions/** (nécessite JWT)
 * - CORS configuré pour accepter les requêtes React Native (Expo)
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    /**
     * Chaîne de filtres de sécurité principale.
     * Définit quels endpoints sont publics ou protégés.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Désactiver CSRF (pas de session côté serveur, JWT protège)
            .csrf(AbstractHttpConfigurer::disable)

            // Configurer CORS (pour React Native / Expo)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Règles d'autorisation par endpoint
            .authorizeHttpRequests(auth -> auth
                // Endpoints publics (pas besoin de JWT)
                .requestMatchers("/api/auth/**").permitAll()
                // Tous les autres nécessitent une authentification JWT
                .anyRequest().authenticated()
            )

            // API REST = sans état (Stateless) — pas de session HTTP
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Fournisseur d'authentification personnalisé
            .authenticationProvider(authenticationProvider())

            // Ajouter le filtre JWT AVANT le filtre d'authentification standard
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configuration CORS pour autoriser les requêtes depuis Expo/React Native.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Fournisseur d'authentification utilisant notre UserDetailsService
     * et l'encodeur BCrypt pour vérifier les mots de passe.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * Encodeur de mots de passe BCrypt (hashage sécurisé).
     * BCrypt est résistant aux attaques par force brute.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Gestionnaire d'authentification Spring (nécessaire pour AuthController).
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
