package com.build.trustpay.service;

import com.build.trustpay.dto.CreateEscrowRequest;
import com.build.trustpay.model.Escrow;
import com.build.trustpay.model.EscrowStatus;
import com.build.trustpay.repository.EscrowRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EscrowService {

    private final EscrowRepository escrowRepository;

    // Spring automatically injects your EscrowRepository here
    public EscrowService(EscrowRepository escrowRepository) {
        this.escrowRepository = escrowRepository;
    }

    public Escrow createEscrow(CreateEscrowRequest request) {
        Escrow escrow = new Escrow(
                request.getBuyerAddress(),
                request.getSellerAddress(),
                request.getAmount(),
                request.getDescription()
        );
        return escrowRepository.save(escrow);
    }

    public List<Escrow> getAllEscrows() {
        return escrowRepository.findAll();
    }

    public Escrow getEscrowById(Long id) {
        return escrowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Escrow not found with ID: " + id));
    }

    public Escrow updateStatus(Long id, EscrowStatus newStatus) {
        Escrow escrow = getEscrowById(id);
        escrow.setStatus(newStatus);
        return escrowRepository.save(escrow);
    }
}