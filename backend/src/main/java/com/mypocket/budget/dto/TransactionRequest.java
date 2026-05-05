package com.mypocket.budget.dto;

import com.mypocket.budget.entity.TransactionType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO pour créer ou modifier une transaction.
 * Utilisé dans les requêtes POST et PUT.
 */
@Data
public class TransactionRequest {

    @NotNull(message = "Le type est requis (REVENU ou DEPENSE)")
    private TransactionType type;

    @NotNull(message = "Le montant est requis")
    @Positive(message = "Le montant doit être positif")
    private BigDecimal montant;

    @NotBlank(message = "La catégorie est requise")
    private String categorie;

    @NotNull(message = "La date est requise")
    private LocalDate date;

    private String description;
}
