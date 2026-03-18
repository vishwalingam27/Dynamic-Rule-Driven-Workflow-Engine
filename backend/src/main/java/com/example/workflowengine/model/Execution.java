package com.example.workflowengine.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "executions")
public class Execution {
    @Id
    private UUID id;

    @Column(name = "workflow_id")
    private UUID workflowId;

    @Column(name = "workflow_version")
    private String workflowVersion;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "data", columnDefinition = "JSON")
    private String data;

    @Column(name = "current_step_id")
    private UUID currentStepId;

    private int retries;

    @Column(name = "triggered_by")
    private String triggeredBy;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    public Execution() {
        this.id = UUID.randomUUID();
        this.startedAt = LocalDateTime.now();
        this.status = Status.PENDING;
    }

    public enum Status {
        PENDING, IN_PROGRESS, WAITING_FOR_APPROVAL, APPROVED, REJECTED, COMPLETED, FAILED, CANCELED
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getWorkflowId() { return workflowId; }
    public void setWorkflowId(UUID workflowId) { this.workflowId = workflowId; }

    public String getWorkflowVersion() { return workflowVersion; }
    public void setWorkflowVersion(String workflowVersion) { this.workflowVersion = workflowVersion; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getData() { return data; }
    public void setData(String data) { this.data = data; }

    public UUID getCurrentStepId() { return currentStepId; }
    public void setCurrentStepId(UUID currentStepId) { this.currentStepId = currentStepId; }

    public int getRetries() { return retries; }
    public void setRetries(int retries) { this.retries = retries; }

    public String getTriggeredBy() { return triggeredBy; }
    public void setTriggeredBy(String triggeredBy) { this.triggeredBy = triggeredBy; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }
}
