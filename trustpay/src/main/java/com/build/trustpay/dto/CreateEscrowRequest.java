package com.build.trustpay.dto;

import java.math.BigDecimal;

public class CreateEscrowRequest {

    private String buyerAddress;
    private String sellerAddress;
    private BigDecimal amount;
    private String description;

    // Default constructor is required by Spring Boot to automatically map JSON payloads into this Java object
    public CreateEscrowRequest() {}

    public CreateEscrowRequest(String buyerAddress, String sellerAddress, BigDecimal amount, String description) {
        this.buyerAddress = buyerAddress;
        this.sellerAddress = sellerAddress;
        this.amount = amount;
        this.description = description;
    }

    public String getBuyerAddress() {
        return buyerAddress;
    }

    public void setBuyerAddress(String buyerAddress) {
        this.buyerAddress = buyerAddress;
    }

    public String getSellerAddress() {
        return sellerAddress;
    }

    public void setSellerAddress(String sellerAddress) {
        this.sellerAddress = sellerAddress;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}