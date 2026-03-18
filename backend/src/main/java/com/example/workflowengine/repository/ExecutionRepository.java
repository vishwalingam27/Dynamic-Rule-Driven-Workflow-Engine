package com.example.workflowengine.repository;

import com.example.workflowengine.model.Execution;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ExecutionRepository extends JpaRepository<Execution, UUID> {
    List<Execution> findAllByOrderByStartedAtDesc();
    long countByStatus(Execution.Status status);
    long countByStatusIn(List<Execution.Status> statuses);
    List<Execution> findByWorkflowId(UUID workflowId);
    void deleteByWorkflowId(UUID workflowId);
}
