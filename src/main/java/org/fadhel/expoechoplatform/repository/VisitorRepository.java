package org.fadhel.expoechoplatform.repository;

import org.fadhel.expoechoplatform.domain.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisitorRepository extends JpaRepository<Visitor, String> {
}
