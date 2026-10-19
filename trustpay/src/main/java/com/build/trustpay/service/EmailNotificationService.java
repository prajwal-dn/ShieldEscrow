package com.build.trustpay.service;

import com.build.trustpay.dto.EscrowNotification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    @Value("${shieldescrow.notifications.email.enabled:true}")
    private boolean emailEnabled;

    @Value("${shieldescrow.notifications.email.from:notifications@shieldescrow.io}")
    private String fromAddress;

    public void sendEscrowAlert(EscrowNotification notification) {
        if (!emailEnabled) {
            return;
        }

        String subject = String.format("[ShieldEscrow Alert] Escrow #%d - %s",
                notification.getEscrowId(), notification.getEventType());

        String body = String.format(
                """
                === ShieldEscrow Notification ===
                Escrow ID : #%d
                Event Type: %s
                New Status: %s
                Actor     : %s
                Tx Hash   : %s
                Details   : %s
                =================================
                """,
                notification.getEscrowId(),
                notification.getEventType(),
                notification.getStatus(),
                notification.getActorAddress() != null ? notification.getActorAddress() : "System",
                notification.getTxHash() != null ? notification.getTxHash() : "N/A",
                notification.getNote()
        );

        log.info("📧 [EMAIL DISPATCH] From: {} | Subject: {}\n{}", fromAddress, subject, body);
    }
}
