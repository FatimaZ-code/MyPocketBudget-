package com.mypocket.budget.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

/**
 * DTO pour retourner le solde calculé de l'utilisateur.
 */
@Data
@AllArgsConstructor
public class BalanceResponse {
    private BigDecimal totalRevenus;
    private BigDecimal totalDepenses;
    private BigDecimal solde; // totalRevenus - totalDepenses
}
