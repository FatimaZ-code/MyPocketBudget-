package com.mypocket.budget;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée principal de l'application MyPocketBudget.
 * Lance le serveur Spring Boot sur le port 8080.
 */
@SpringBootApplication
public class BudgetApplication {
    public static void main(String[] args) {
        SpringApplication.run(BudgetApplication.class, args);
        System.out.println("✅ MyPocketBudget API démarrée sur http://localhost:8080");
    }
}
