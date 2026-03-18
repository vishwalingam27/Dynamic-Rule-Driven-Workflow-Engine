package com.example.workflowengine.service;

import com.example.workflowengine.model.*;
import com.example.workflowengine.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class WorkflowExecutionService {

    private final WorkflowRepository workflowRepository;
    private final ExecutionRepository executionRepository;
    private final StepExecutionService stepExecutionService;

    private static final int MAX_ITERATIONS = 50;

    public WorkflowExecutionService(WorkflowRepository workflowRepository,
                                   ExecutionRepository executionRepository,
                                   StepExecutionService stepExecutionService) {
        this.workflowRepository = workflowRepository;
        this.executionRepository = executionRepository;
        this.stepExecutionService = stepExecutionService;
    }

    @Transactional
    public Execution startExecution(UUID workflowId, String inputData, String triggeredBy) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        Execution execution = new Execution();
        execution.setWorkflowId(workflowId);
        execution.setWorkflowVersion(workflow.getVersion());
        execution.setData(inputData);
        
        if (workflow.getStartStepId() == null) {
            execution.setStatus(Execution.Status.FAILED);
            // We set current step to null explicitly
            execution.setCurrentStepId(null);
            execution.setTriggeredBy(triggeredBy);
            // Optionally add an error message if the model supports it, 
            // but for now, we'll let StepExecutionService handle the log.
            return executionRepository.save(execution);
        }

        execution.setCurrentStepId(workflow.getStartStepId());
        execution.setStatus(Execution.Status.IN_PROGRESS);
        execution.setTriggeredBy(triggeredBy);
        
        return executionRepository.save(execution);
    }

    public void executeStep(UUID executionId) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found"));

        if (execution.getStatus() != Execution.Status.IN_PROGRESS) {
            return;
        }

        int iterations = 0;
        while (iterations < MAX_ITERATIONS) {
            UUID nextStepId = stepExecutionService.processSingleStep(executionId);
            
            // Refresh execution status from DB
            execution = executionRepository.findById(executionId).get();
            
            iterations++;
            if (nextStepId == null || execution.getStatus() != Execution.Status.IN_PROGRESS) {
                break;
            }
        }

        if (iterations >= MAX_ITERATIONS && execution.getStatus() == Execution.Status.IN_PROGRESS) {
            stepExecutionService.markAsFailed(executionId, "Max iterations reached. Possible loop detected.");
        }
    }

    public void markAsFailed(UUID executionId, String error) {
        stepExecutionService.markAsFailed(executionId, error);
    }

    @Transactional
    public void submitApprovalDecision(UUID executionId, boolean approved, String reason) {
        stepExecutionService.submitApprovalDecision(executionId, approved, reason);
        // After approval, try to execute the next steps automatically in a new thread
        new Thread(() -> {
            try {
                executeStep(executionId);
            } catch (Exception e) {
                System.err.println("Fatal error during workflow execution post-approval: " + e.getMessage());
                e.printStackTrace();
                try {
                    markAsFailed(executionId, "Internal Server Error: " + e.getMessage());
                } catch (Exception ex) {
                    System.err.println("Failed to mark execution as failed: " + ex.getMessage());
                }
            }
        }).start();
    }
}
