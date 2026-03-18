package com.example.workflowengine.controller;

import com.example.workflowengine.dto.ExecutionRequest;
import com.example.workflowengine.model.Execution;
import com.example.workflowengine.model.ExecutionLog;
import com.example.workflowengine.repository.ExecutionLogRepository;
import com.example.workflowengine.repository.ExecutionRepository;
import com.example.workflowengine.service.WorkflowExecutionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ExecutionController {

    private static final Logger logger = LoggerFactory.getLogger(ExecutionController.class);
    private final WorkflowExecutionService executionService;
    private final ExecutionRepository executionRepository;
    private final ExecutionLogRepository executionLogRepository;

    public ExecutionController(WorkflowExecutionService executionService, 
                               ExecutionRepository executionRepository,
                               ExecutionLogRepository executionLogRepository) {
        this.executionService = executionService;
        this.executionRepository = executionRepository;
        this.executionLogRepository = executionLogRepository;
    }

    @PostMapping("/workflows/{workflowId}/execute")
    public Execution executeWorkflow(@PathVariable UUID workflowId, @RequestBody ExecutionRequest request) {
        Execution execution = executionService.startExecution(workflowId, request.getData(), request.getTriggeredBy());
        // Execute asynchronously in a real app, but here we can do it synchronously for simplicity or use a separate thread
        new Thread(() -> {
            try {
                executionService.executeStep(execution.getId());
            } catch (Exception e) {
                System.err.println("Fatal error during workflow execution: " + e.getMessage());
                e.printStackTrace();
                try {
                    executionService.markAsFailed(execution.getId(), "Internal Server Error: " + e.getMessage());
                } catch (Exception ex) {
                    System.err.println("Failed to mark execution as failed: " + ex.getMessage());
                }
            }
        }).start();
        return execution;
    }

    @GetMapping("/executions/{id}")
    public Execution getExecution(@PathVariable UUID id) {
        return executionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Execution not found"));
    }

    @PostMapping("/executions/{id}/approve")
    public void approveExecution(@PathVariable UUID id, @RequestBody java.util.Map<String, String> payload) {
        String reason = payload.get("reason");
        executionService.submitApprovalDecision(id, true, reason);
    }

    @PostMapping("/executions/{id}/reject")
    public void rejectExecution(@PathVariable UUID id, @RequestBody java.util.Map<String, String> payload) {
        String reason = payload.get("reason");
        executionService.submitApprovalDecision(id, false, reason);
    }

    @GetMapping("/executions")
    public List<Execution> getAllExecutions() {
        List<Execution> executions = executionRepository.findAllByOrderByStartedAtDesc();
        logger.info("getAllExecutions returned {} items", executions.size());
        return executions;
    }

    @GetMapping("/executions/{executionId}/logs")
    public List<ExecutionLog> getExecutionLogs(@PathVariable UUID executionId) {
        logger.info("Fetching logs for execution: {}", executionId);
        List<ExecutionLog> logs = executionLogRepository.findByExecutionIdOrderByStartedAtAsc(executionId);
        logger.info("Found {} logs for execution: {}", logs.size(), executionId);
        return logs;
    }

    @GetMapping("/debug/status")
    public java.util.Map<String, Object> getDebugStatus() {
        java.util.Map<String, Object> status = new java.util.HashMap<>();
        try {
            long count = executionRepository.count();
            status.put("status", "ACTIVE");
            status.put("count", count);
            status.put("version", "2.0");
            status.put("message", "Backend is ACTIVE. Executions in DB: " + count);
        } catch (Exception e) {
            logger.error("Database connectivity check failed", e);
            status.put("status", "DB_OFFLINE");
            status.put("message", "Backend is RUNNING but Database is OFFLINE: " + e.getMessage());
            status.put("version", "2.0");
        }
        return status;
    }

    @DeleteMapping("/executions/{id}")
    @Transactional
    public void deleteExecution(@PathVariable UUID id) {
        logger.info("Deleting execution: {}", id);
        executionLogRepository.deleteByExecutionId(id);
        executionRepository.deleteById(id);
    }

    @DeleteMapping("/executions")
    @Transactional
    public void deleteAllExecutions() {
        logger.info("Deleting all executions");
        executionLogRepository.deleteAllInBatch();
        executionRepository.deleteAllInBatch();
    }
}
