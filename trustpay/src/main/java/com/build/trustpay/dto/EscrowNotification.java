package com.build.trustpay.dto;

import java.time.LocalDateTime;

/**
 * Payload broadcast to WebSocket topic subscribers on every escrow state change.
 * Fields are intentionally kept flat so the React client can destructure easily.
 */
public class EscrowNotification {

    private Long escrowId;
    private String eventType;    // CREATED | FUNDED | COMPLETED | RELEASED | DISPUTED
    private String status;       // current EscrowStatus name
    private String actorAddress;
    private String txHash;
    private String note;
    private LocalDateTime timestamp;

    public EscrowNotification() {}

    public EscrowNotification(Long escrowId, String eventType, String status,
                               String actorAddress, String txHash, String note) {
        this.escrowId     = escrowId;
        this.eventType    = eventType;
        this.status       = status;
        this.actorAddress = actorAddress;
        this.txHash       = txHash;
        this.note         = note;
        this.timestamp    = LocalDateTime.now();
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public Long getEscrowId()            { return escrowId; }
    public void setEscrowId(Long v)      { this.escrowId = v; }

    public String getEventType()         { return eventType; }
    public void setEventType(String v)   { this.eventType = v; }

    public String getStatus()            { return status; }
    public void setStatus(String v)      { this.status = v; }

    public String getActorAddress()      { return actorAddress; }
    public void setActorAddress(String v){ this.actorAddress = v; }

    public String getTxHash()            { return txHash; }
    public void setTxHash(String v)      { this.txHash = v; }

    public String getNote()              { return note; }
    public void setNote(String v)        { this.note = v; }

    public LocalDateTime getTimestamp()  { return timestamp; }
    public void setTimestamp(LocalDateTime v) { this.timestamp = v; }
}
