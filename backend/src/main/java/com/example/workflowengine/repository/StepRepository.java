package com.example.workflowengine.repository;

import com.example.workflowengine.model.Step;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

public interface StepRepository extends JpaRepository<Step, UUID> {
    List<Step> findByWorkflowIdOrderByStepOrder(UUID workflowId);
    void deleteByWorkflowId(UUID workflowId);

    @Query("SELECT COUNT(s) FROM Step s WHERE s.workflowId IN (SELECT w.id FROM Workflow w)")
    long countValidSteps();

    @Modifying
    @Transactional
    @Query("DELETE FROM Step s WHERE s.workflowId NOT IN (SELECT w.id FROM Workflow w)")
    void deleteOrphanSteps();
}
