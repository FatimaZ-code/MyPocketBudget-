package com.mypocket.budget.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtre JWT exécuté UNE SEULE FOIS par requête HTTP.
 *
 * Rôle : Intercepte chaque requête, extrait et valide le JWT
 * de l'en-tête Authorization, puis authentifie l'utilisateur
 * dans le contexte de sécurité Spring.
 *
 * Flux complet :
 * HTTP Request → JwtAuthFilter → [valide token?] → SecurityContext → Controller
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Lire l'en-tête Authorization
        final String authHeader = request.getHeader("Authorization");

        // 2. Si pas de token ou format incorrect → passer au filtre suivant
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extraire le token (enlever "Bearer ")
        final String token = authHeader.substring(7);

        // 4. Extraire l'email du token
        final String email = jwtUtil.extractEmail(token);

        // 5. Si email trouvé et pas encore authentifié dans le contexte
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 6. Charger les détails de l'utilisateur depuis la base
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // 7. Valider le token
            if (jwtUtil.validateToken(token)) {
                // 8. Créer l'objet d'authentification Spring Security
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 9. Placer l'authentification dans le contexte de sécurité
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 10. Continuer la chaîne de filtres
        filterChain.doFilter(request, response);
    }
}
