package com.build.trustpay.repository;

import com.build.trustpay.model.Escrow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EscrowRepository extends JpaRepository<Escrow, Long> {

}
