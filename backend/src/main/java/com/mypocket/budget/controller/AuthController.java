package com.mypocket.budget.controller;

import com.mypocket.budget.dto.AuthResponse;
import com.mypocket.budget.dto.LoginRequest;
import com.mypocket.budget.dto.RegisterRequest;
import com.mypocket.budget.entity.User;
import com.mypocket.budget.repository.UserRepository;
import com.mypocket.budget.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST pour l'authentification.
 *
 * Endpoints publics (pas besoin de JWT) :
 * - POST /api/auth/register → Inscription
 * - POST /api/auth/login    → Connexion → retourne JWT
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    /**
     * Inscription d'un nouvel utilisateur.
     *
     * Corps JSON attendu :
     * { "email": "user@email.com", "password": "motdepasse" }
     *
     * @return JWT + infos utilisateur si succès
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        // Vérifier si l'email est déjà utilisé
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, null, "Email déjà utilisé"));
        }

        // Créer et sauvegarder l'utilisateur (mot de passe hashé)
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        user = userRepository.save(user);

        // Générer le JWT pour connexion automatique après inscription
        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getEmail(),
                user.getId(),
                "Inscription réussie"
        ));
    }

    /**
     * Connexion d'un utilisateur existant.
     *
     * Corps JSON attendu :
     * { "email": "user@email.com", "password": "motdepasse" }
     *
     * @return JWT + infos utilisateur si authentification réussie
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            // Spring Security vérifie email + mot de passe hashé
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(new AuthResponse(null, null, null, "Email ou mot de passe incorrect"));
        }

        // Récupérer l'utilisateur et générer son token
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getEmail(),
                user.getId(),
                "Connexion réussie"
        ));
    }
}
