package com.project.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO for mapping SePay Transactions List response (v2).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class SePayTransactionResponse {
    private int status;
    private int count;
    private List<SePayTransactionDTO> transactions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class SePayTransactionDTO {
        private Long id;
        
        @com.fasterxml.jackson.annotation.JsonProperty("content")
        private String transactionContent;
        
        @com.fasterxml.jackson.annotation.JsonProperty("amount_in")
        private String amountIn;
        
        @com.fasterxml.jackson.annotation.JsonProperty("reference_number")
        private String referenceNumber;
        
        private String code;
        
        @com.fasterxml.jackson.annotation.JsonProperty("transaction_date")
        private String transactionDate;
        
        @com.fasterxml.jackson.annotation.JsonProperty("account_number")
        private String accountNumber;
    }
}
