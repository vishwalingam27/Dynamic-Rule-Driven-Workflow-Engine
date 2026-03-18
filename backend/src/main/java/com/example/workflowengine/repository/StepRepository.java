package com.example.workflowengine.repository;

import com.example.workflowengine.model.Step;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StepRepository extends JpaRepository<Step, UUID> {
    List<Step> findByWorkflowIdOrderByStepOrder(UUID workflowId);
}
