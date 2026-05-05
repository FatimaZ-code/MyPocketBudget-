package com.mypocket.budget.controller;

import com.mypocket.budget.dto.BalanceResponse;
import com.mypocket.budget.dto.TransactionRequest;
import com.mypocket.budget.entity.Transaction;
import com.mypocket.budget.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des transactions.
 * TOUS les endpoints nécessitent un JWT valide (configuré dans SecurityConfig).
 *
 * Endpoints :
 * GET    /api/transactions           → Liste toutes les transactions
 * GET    /api/transactions/{id}      → Une transaction par ID
 * POST   /api/transactions           → Créer une transaction
 * PUT    /api/transactions/{id}      → Modifier une transaction
 * DELETE /api/transactions/{id}      → Supprimer une transaction
 * GET    /api/transactions/balance   → Calculer le solde
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * GET /api/transactions
     * Retourne toutes les transactions de l'utilisateur connecté, triées par date.
     * Header requis : Authorization: Bearer <jwt_token>
     */
    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    /**
     * GET /api/transactions/{id}
     * Retourne une transaction spécifique (si elle appartient à l'utilisateur).
     */
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    /**
     * POST /api/transactions
     * Crée une nouvelle transaction.
     *
     * Corps JSON :
     * {
     *   "type": "REVENU" | "DEPENSE",
     *   "montant": 1500.00,
     *   "categorie": "Salaire",
     *   "date": "2024-01-15",
     *   "description": "Salaire janvier"
     * }
     */
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(
            @Valid @RequestBody TransactionRequest request) {
        Transaction created = transactionService.createTransaction(request);
        return ResponseEntity.ok(created);
    }

    /**
     * PUT /api/transactions/{id}
     * Met à jour une transaction existante.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request) {
        Transaction updated = transactionService.updateTransaction(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/transactions/{id}
     * Supprime une transaction.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/transactions/balance
     * Retourne le solde calculé : revenus - dépenses.
     */
    @GetMapping("/balance")
    public ResponseEntity<BalanceResponse> getBalance() {
        return ResponseEntity.ok(transactionService.getBalance());
    }
}
