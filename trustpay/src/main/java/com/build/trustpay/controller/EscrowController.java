package com.build.trustpay.controller;

import com.build.trustpay.dto.CreateEscrowRequest;
import com.build.trustpay.model.Escrow;
import com.build.trustpay.service.EscrowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/escrows") // This is the API route Vaishali's React app will call
@CrossOrigin(origins = "http://localhost:5173") // Allows Vite/React frontend to connect
public class EscrowController {

    private final EscrowService escrowService;

    // Spring automatically injects your EscrowService here
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
    public ResponseEntity<Escrow> completeWork(@PathVariable Long id) {
        return ResponseEntity.ok(escrowService.updateStatus(id, com.build.trustpay.model.EscrowStatus.COMPLETED));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Escrow> approveWork(@PathVariable Long id) {
        return ResponseEntity.ok(escrowService.updateStatus(id, com.build.trustpay.model.EscrowStatus.RELEASED));
    }
}