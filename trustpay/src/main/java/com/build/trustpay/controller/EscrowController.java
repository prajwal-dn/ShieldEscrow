package com.build.trustpay.controller;

import com.build.trustpay.dto.CreateEscrowRequest;
import com.build.trustpay.model.Escrow;
import com.build.trustpay.model.EscrowEvent;
import com.build.trustpay.service.EscrowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/escrows")
public class EscrowController {

    private final EscrowService escrowService;

    public EscrowController(EscrowService escrowService) {
        this.escrowService = escrowService;
    }

    @PostMapping
    public ResponseEntity<Escrow> createEscrow(@RequestBody CreateEscrowRequest request) {
        Escrow created = escrowService.createEscrow(request);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Escrow>> getAllEscrows() {
        return ResponseEntity.ok(escrowService.getAllEscrows());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Escrow> getEscrowById(@PathVariable Long id) {
        return ResponseEntity.ok(escrowService.getEscrowById(id));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Escrow> completeWork(
            @PathVariable Long id,
            @RequestBody(required = false) ActorRequest body) {
        String actor = body != null && body.actorAddress != null ? body.actorAddress : "unknown";
        return ResponseEntity.ok(escrowService.updateStatus(id, com.build.trustpay.model.EscrowStatus.COMPLETED, actor));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Escrow> approveWork(
            @PathVariable Long id,
            @RequestBody(required = false) ActorRequest body) {
        String actor = body != null && body.actorAddress != null ? body.actorAddress : "unknown";
        return ResponseEntity.ok(escrowService.updateStatus(id, com.build.trustpay.model.EscrowStatus.RELEASED, actor));
    }

    @PostMapping("/{id}/sync-onchain")
    public ResponseEntity<Escrow> syncOnChain(
            @PathVariable Long id,
            @RequestParam(required = false) String contractAddress,
            @RequestParam(required = false) String txHash,
            @RequestParam(required = false) com.build.trustpay.model.EscrowStatus status) {
        return ResponseEntity.ok(escrowService.syncOnChain(id, contractAddress, txHash, status));
    }

    // ── Dispute Endpoint ──────────────────────────────────────────────────
    @PostMapping("/{id}/dispute")
    public ResponseEntity<Escrow> raiseDispute(
            @PathVariable Long id,
            @RequestBody(required = false) DisputeRequest body) {
        String raisedBy = body != null ? body.raisedBy : "unknown";
        String reason   = body != null ? body.reason   : null;
        return ResponseEntity.ok(escrowService.raiseDispute(id, raisedBy, reason));
    }

    // ── Dispute Resolution Endpoint ───────────────────────────────────────
    @PostMapping("/{id}/resolve-dispute")
    public ResponseEntity<Escrow> resolveDispute(
            @PathVariable Long id,
            @RequestBody(required = false) ResolveDisputeRequest body) {
        String resolver = body != null && body.resolverAddress != null ? body.resolverAddress : "arbitrator";
        com.build.trustpay.model.EscrowStatus resolution = body != null && body.resolution != null
                ? body.resolution
                : com.build.trustpay.model.EscrowStatus.RELEASED;
        String note = body != null ? body.note : null;
        return ResponseEntity.ok(escrowService.resolveDispute(id, resolution, resolver, note));
    }

    // ── Activity Log Endpoint ────────────────────────────────────────────
    @GetMapping("/{id}/events")
    public ResponseEntity<List<EscrowEvent>> getEvents(@PathVariable Long id) {
        return ResponseEntity.ok(escrowService.getEvents(id));
    }

    // Simple DTO for dispute payload (no extra file needed)
    static class DisputeRequest {
        public String raisedBy;
        public String reason;
    }

    // DTO for dispute resolution
    static class ResolveDisputeRequest {
        public String resolverAddress;
        public com.build.trustpay.model.EscrowStatus resolution; // RELEASED or REFUNDED
        public String note;
    }

    // Simple DTO for actor identification on complete/approve
    static class ActorRequest {
        public String actorAddress;
    }
}