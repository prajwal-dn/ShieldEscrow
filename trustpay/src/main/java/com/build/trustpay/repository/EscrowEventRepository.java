package com.build.trustpay.repository;

import com.build.trustpay.model.EscrowEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EscrowEventRepository extends JpaRepository<EscrowEvent, Long> {
    List<EscrowEvent> findByEscrowIdOrderByTimestampDesc(Long escrowId);
}
