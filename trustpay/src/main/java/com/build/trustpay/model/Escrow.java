package com.build.trustpay.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "escrows")
public class Escrow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 512)
    private String buyerAddress;

    @Column(length = 512)
    private String sellerAddress;

    @Column(precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private EscrowStatus status;

    @Column(length = 512)
    private String contractAddress;

    @Column(length = 512)
    private String txHash;
    private Boolean onChainSynced = false;

    private LocalDateTime createdAt;


    public Escrow() {}


    public Escrow(String buyerAddress, String sellerAddress, BigDecimal amount, String description) {
        this.buyerAddress = buyerAddress;
        this.sellerAddress = sellerAddress;
        this.amount = amount;
        this.description = description;
        this.status = EscrowStatus.CREATED; // Default state
        this.createdAt = LocalDateTime.now();
        this.onChainSynced = false;
    }

    public Escrow(String buyerAddress, String sellerAddress, BigDecimal amount, String description, String contractAddress, String txHash) {
        this(buyerAddress, sellerAddress, amount, description);
        this.contractAddress = contractAddress;
        this.txHash = txHash;
        if (txHash != null && !txHash.isBlank()) {
            this.onChainSynced = true;
            this.status = EscrowStatus.FUNDED;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBuyerAddress() { return buyerAddress; }
    public void setBuyerAddress(String buyerAddress) { this.buyerAddress = buyerAddress; }

    public String getSellerAddress() { return sellerAddress; }
    public void setSellerAddress(String sellerAddress) { this.sellerAddress = sellerAddress; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public EscrowStatus getStatus() { return status; }
    public void setStatus(EscrowStatus status) { this.status = status; }

    public String getContractAddress() { return contractAddress; }
    public void setContractAddress(String contractAddress) { this.contractAddress = contractAddress; }

    public String getTxHash() { return txHash; }
    public void setTxHash(String txHash) { this.txHash = txHash; }

    public Boolean getOnChainSynced() { return onChainSynced; }
    public void setOnChainSynced(Boolean onChainSynced) { this.onChainSynced = onChainSynced; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}