package com.build.trustpay.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "escrow_events")
public class EscrowEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long escrowId;

    @Column(length = 64)
    private String eventType;

    @Column(length = 512)
    private String actorAddress;

    @Column(length = 512)
    private String txHash;

    @Column(columnDefinition = "TEXT")
    private String note;

    private LocalDateTime timestamp;

    public EscrowEvent() {}

    public EscrowEvent(Long escrowId, String eventType, String actorAddress, String txHash, String note) {
        this.escrowId = escrowId;
        this.eventType = eventType;
        this.actorAddress = actorAddress;
        this.txHash = txHash;
        this.note = note;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEscrowId() { return escrowId; }
    public void setEscrowId(Long escrowId) { this.escrowId = escrowId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getActorAddress() { return actorAddress; }
    public void setActorAddress(String actorAddress) { this.actorAddress = actorAddress; }

    public String getTxHash() { return txHash; }
    public void setTxHash(String txHash) { this.txHash = txHash; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
