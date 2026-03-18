package com.example.workflowengine.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rules")
public class Rule {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "step_id")
    private UUID stepId;

    @Column(name = "condition_expression")
    private String condition;

    @Column(name = "next_step_id")
    private UUID nextStepId;

    private int priority;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Rule() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getStepId() { return stepId; }
    public void setStepId(UUID stepId) { this.stepId = stepId; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public UUID getNextStepId() { return nextStepId; }
    public void setNextStepId(UUID nextStepId) { this.nextStepId = nextStepId; }

    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
