package com.mypocket.budget.service;

import com.mypocket.budget.dto.BalanceResponse;
import com.mypocket.budget.dto.TransactionRequest;
import com.mypocket.budget.entity.Transaction;
import com.mypocket.budget.entity.TransactionType;
import com.mypocket.budget.entity.User;
import com.mypocket.budget.repository.TransactionRepository;
import com.mypocket.budget.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service métier pour la gestion des transactions.
 * Contient toute la logique métier (CRUD + calcul solde).
 * Les contrôleurs REST délèguent le traitement à ce service.
 */
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    /**
     * Récupère l'utilisateur connecté depuis le contexte de sécurité Spring.
     * Le JWT a déjà été validé par le filtre → l'email est dans le SecurityContext.
     */
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    /**
     * Récupère toutes les transactions de l'utilisateur connecté.
     */
    public List<Transaction> getAllTransactions() {
        User user = getCurrentUser();
        return transactionRepository.findByUserIdOrderByDateDesc(user.getId());
    }

    /**
     * Récupère une transaction par son ID (vérifie qu'elle appartient à l'utilisateur).
     */
    public Transaction getTransactionById(Long id) {
        User user = getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction non trouvée"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Accès non autorisé à cette transaction");
        }
        return transaction;
    }

    /**
     * Crée une nouvelle transaction pour l'utilisateur connecté.
     */
    public Transaction createTransaction(TransactionRequest request) {
        User user = getCurrentUser();

        Transaction transaction = Transaction.builder()
                .type(request.getType())
                .montant(request.getMontant())
                .categorie(request.getCategorie())
                .date(request.getDate())
                .description(request.getDescription())
                .user(user)
                .build();

        return transactionRepository.save(transaction);
    }

    /**
     * Met à jour une transaction existante (vérifie l'appartenance).
     */
    public Transaction updateTransaction(Long id, TransactionRequest request) {
        Transaction existing = getTransactionById(id); // Vérifie ownership

        existing.setType(request.getType());
        existing.setMontant(request.getMontant());
        existing.setCategorie(request.getCategorie());
        existing.setDate(request.getDate());
        existing.setDescription(request.getDescription());

        return transactionRepository.save(existing);
    }

    /**
     * Supprime une transaction (vérifie l'appartenance).
     */
    public void deleteTransaction(Long id) {
        Transaction transaction = getTransactionById(id); // Vérifie ownership
        transactionRepository.delete(transaction);
    }

    /**
     * Calcule le solde : revenus - dépenses pour l'utilisateur connecté.
     */
    public BalanceResponse getBalance() {
        User user = getCurrentUser();

        BigDecimal revenus = transactionRepository
                .sumMontantByUserIdAndType(user.getId(), TransactionType.REVENU);
        BigDecimal depenses = transactionRepository
                .sumMontantByUserIdAndType(user.getId(), TransactionType.DEPENSE);

        BigDecimal solde = revenus.subtract(depenses);
        return new BalanceResponse(revenus, depenses, solde);
    }
}
