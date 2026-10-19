package com.build.trustpay.service;

import com.build.trustpay.dto.CreateEscrowRequest;
import com.build.trustpay.dto.EscrowNotification;
import com.build.trustpay.model.Escrow;
import com.build.trustpay.model.EscrowEvent;
import com.build.trustpay.model.EscrowStatus;
import com.build.trustpay.repository.EscrowEventRepository;
import com.build.trustpay.repository.EscrowRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class EscrowService {

    private final EscrowRepository escrowRepository;
    private final EscrowEventRepository escrowEventRepository;
    private final NotificationService notificationService;
    private final EmailNotificationService emailNotificationService;

    // Valid state transitions: key = current status, value = allowed next statuses
    private static final java.util.Map<EscrowStatus, Set<EscrowStatus>> VALID_TRANSITIONS =
            java.util.Map.of(
                    EscrowStatus.CREATED,   Set.of(EscrowStatus.FUNDED, EscrowStatus.COMPLETED, EscrowStatus.DISPUTED),
                    EscrowStatus.FUNDED,    Set.of(EscrowStatus.COMPLETED, EscrowStatus.RELEASED, EscrowStatus.DISPUTED),
                    EscrowStatus.COMPLETED, Set.of(EscrowStatus.RELEASED, EscrowStatus.DISPUTED),
                    EscrowStatus.RELEASED,  Set.of(),
                    EscrowStatus.DISPUTED,  Set.of(EscrowStatus.RELEASED, EscrowStatus.REFUNDED),
                    EscrowStatus.REFUNDED,  Set.of()
            );

    public EscrowService(EscrowRepository escrowRepository,
                         EscrowEventRepository escrowEventRepository,
                         NotificationService notificationService,
                         EmailNotificationService emailNotificationService) {
        this.escrowRepository          = escrowRepository;
        this.escrowEventRepository     = escrowEventRepository;
        this.notificationService       = notificationService;
        this.emailNotificationService  = emailNotificationService;
    }

    public Escrow createEscrow(CreateEscrowRequest request) {
        Escrow escrow = new Escrow(
                request.getBuyerAddress(),
                request.getSellerAddress(),
                request.getAmount(),
                request.getDescription(),
                request.getContractAddress(),
                request.getTxHash()
        );
        Escrow saved = escrowRepository.save(escrow);
        String note = "Escrow created for " + saved.getDescription();
        logEvent(saved.getId(), "CREATED", saved.getBuyerAddress(), saved.getTxHash(), note);
        dispatchNotification(new EscrowNotification(
                saved.getId(), "CREATED", saved.getStatus().name(),
                saved.getBuyerAddress(), saved.getTxHash(), note));
        return saved;
    }

    public List<Escrow> getAllEscrows() {
        return escrowRepository.findAll();
    }

    public Escrow getEscrowById(Long id) {
        return escrowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Escrow not found with ID: " + id));
    }

    public Escrow updateStatus(Long id, EscrowStatus newStatus, String actorAddress) {
        Escrow escrow = getEscrowById(id);

        // Validate the state transition
        EscrowStatus currentStatus = escrow.getStatus();
        Set<EscrowStatus> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new RuntimeException(
                    "Invalid state transition: cannot move from " + currentStatus + " to " + newStatus);
        }

        escrow.setStatus(newStatus);
        Escrow saved = escrowRepository.save(escrow);
        String note = "Status changed to " + newStatus.name();
        logEvent(id, newStatus.name(), actorAddress, null, note);
        dispatchNotification(new EscrowNotification(
                id, newStatus.name(), newStatus.name(),
                actorAddress, null, note));
        return saved;
    }

    public Escrow raiseDispute(Long id, String raisedBy, String reason) {
        Escrow escrow = getEscrowById(id);
        if (escrow.getStatus() == EscrowStatus.RELEASED || escrow.getStatus() == EscrowStatus.REFUNDED || escrow.getStatus() == EscrowStatus.DISPUTED) {
            throw new RuntimeException("Cannot raise a dispute on an escrow with status: " + escrow.getStatus());
        }
        escrow.setStatus(EscrowStatus.DISPUTED);
        Escrow saved = escrowRepository.save(escrow);
        String note = reason != null && !reason.isBlank() ? reason : "Dispute raised by " + raisedBy;
        logEvent(id, "DISPUTED", raisedBy, null, note);
        dispatchNotification(new EscrowNotification(
                id, "DISPUTED", "DISPUTED", raisedBy, null, note));
        return saved;
    }

    public Escrow resolveDispute(Long id, EscrowStatus resolutionStatus, String resolverAddress, String resolutionNote) {
        Escrow escrow = getEscrowById(id);
        if (escrow.getStatus() != EscrowStatus.DISPUTED) {
            throw new RuntimeException("Cannot resolve an escrow that is not in DISPUTED status (current: " + escrow.getStatus() + ")");
        }
        if (resolutionStatus != EscrowStatus.RELEASED && resolutionStatus != EscrowStatus.REFUNDED) {
            throw new RuntimeException("Dispute resolution must be either RELEASED (to seller) or REFUNDED (to buyer). Given: " + resolutionStatus);
        }

        escrow.setStatus(resolutionStatus);
        Escrow saved = escrowRepository.save(escrow);
        String note = (resolutionNote != null && !resolutionNote.isBlank())
                ? resolutionNote
                : "Dispute resolved as " + resolutionStatus.name() + " by " + resolverAddress;
        logEvent(id, "DISPUTE_RESOLVED", resolverAddress, null, note);
        dispatchNotification(new EscrowNotification(
                id, "DISPUTE_RESOLVED", resolutionStatus.name(), resolverAddress, null, note));
        return saved;
    }

    public List<EscrowEvent> getEvents(Long escrowId) {
        return escrowEventRepository.findByEscrowIdOrderByTimestampDesc(escrowId);
    }

    private void logEvent(Long escrowId, String eventType, String actor, String txHash, String note) {
        EscrowEvent event = new EscrowEvent(escrowId, eventType, actor, txHash, note);
        escrowEventRepository.save(event);
    }

    private void dispatchNotification(EscrowNotification notification) {
        notificationService.push(notification);
        try {
            emailNotificationService.sendEscrowAlert(notification);
        } catch (Exception e) {
            // Non-blocking email alert logging failure
        }
    }

    public Escrow syncOnChain(Long id, String contractAddress, String txHash, EscrowStatus status) {
        Escrow escrow = getEscrowById(id);
        if (contractAddress != null && !contractAddress.isBlank()) {
            escrow.setContractAddress(contractAddress);
        }
        if (txHash != null && !txHash.isBlank()) {
            escrow.setTxHash(txHash);
            escrow.setOnChainSynced(true);
        }
        if (status != null) {
            escrow.setStatus(status);
        }
        Escrow saved = escrowRepository.save(escrow);
        String note = "On-chain sync: " + (contractAddress != null ? contractAddress : "updated");
        dispatchNotification(new EscrowNotification(
                id, "SYNCED", saved.getStatus().name(),
                escrow.getBuyerAddress(), txHash, note));
        return saved;
    }
}