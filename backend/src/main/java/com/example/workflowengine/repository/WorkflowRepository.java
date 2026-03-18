package com.example.workflowengine.repository;

import com.example.workflowengine.model.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface WorkflowRepository extends JpaRepository<Workflow, UUID> {
}
