package com.build.trustpay.service;

import com.build.trustpay.dto.EscrowNotification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Phase 3 — Thin wrapper around Spring's SimpMessagingTemplate.
 *
 * Two channels:
 *  • /topic/escrows          → global feed (all escrow events)
 *  • /topic/escrows/{id}     → per-escrow feed (only events for that escrow)
 *
 * Usage: inject NotificationService and call push().
 */
@Service
public class NotificationService {

    private static final String GLOBAL_TOPIC = "/topic/escrows";

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Broadcast an event notification to both the global and the per-escrow topics.
     *
     * @param notification the payload to broadcast
     */
    public void push(EscrowNotification notification) {
        // Global feed — dashboard-level notifications / toasts
        messagingTemplate.convertAndSend(GLOBAL_TOPIC, notification);

        // Per-escrow feed — EscrowDetails page live updates
        messagingTemplate.convertAndSend(
                GLOBAL_TOPIC + "/" + notification.getEscrowId(),
                notification
        );
    }
}
