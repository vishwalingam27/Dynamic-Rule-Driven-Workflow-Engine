package com.example.workflowengine.service;

import com.example.workflowengine.model.*;
import com.example.workflowengine.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class StepExecutionService {

    private final StepRepository stepRepository;
    private final RuleRepository ruleRepository;
    private final ExecutionRepository executionRepository;
    private final ExecutionLogRepository executionLogRepository;
    private final RuleEngineService ruleEngineService;

    public StepExecutionService(StepRepository stepRepository,
                              RuleRepository ruleRepository,
                              ExecutionRepository executionRepository,
                              ExecutionLogRepository executionLogRepository,
                              RuleEngineService ruleEngineService) {
        this.stepRepository = stepRepository;
        this.ruleRepository = ruleRepository;
        this.executionRepository = executionRepository;
        this.executionLogRepository = executionLogRepository;
        this.ruleEngineService = ruleEngineService;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public UUID processSingleStep(UUID executionId) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found"));
        
        if (execution.getCurrentStepId() == null) {
            execution.setStatus(Execution.Status.COMPLETED);
            execution.setEndedAt(LocalDateTime.now());
            executionRepository.save(execution);
            return null;
        }

        Step currentStep = stepRepository.findById(execution.getCurrentStepId())
                .orElseThrow(() -> new RuntimeException("Step not found: " + execution.getCurrentStepId()));

        ExecutionLog log = new ExecutionLog();
        log.setExecutionId(executionId);
        log.setStepName(currentStep.getName());
        log.setStepType(currentStep.getStepType() != null ? currentStep.getStepType().name() : "TASK");
        log.setStartedAt(LocalDateTime.now());

        List<Rule> rules = ruleRepository.findByStepIdOrderByPriorityAsc(currentStep.getId());
        UUID nextStepId = null;
        StringBuilder evaluatedRules = new StringBuilder();

        for (Rule rule : rules) {
            boolean match = ruleEngineService.evaluate(rule.getCondition(), execution.getData());
            evaluatedRules.append("Rule: ").append(rule.getCondition()).append(" -> ").append(match).append("\n");
            if (match) {
                nextStepId = rule.getNextStepId();
                break;
            }
        }

        log.setEvaluatedRules(evaluatedRules.toString());
        log.setSelectedNextStep(nextStepId);
        log.setEndedAt(LocalDateTime.now());
        log.setStatus("SUCCESS");
        executionLogRepository.save(log);

        execution.setCurrentStepId(nextStepId);
        if (nextStepId == null) {
            execution.setStatus(Execution.Status.COMPLETED);
            execution.setEndedAt(LocalDateTime.now());
        }
        
        executionRepository.save(execution);
        return nextStepId;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markAsFailed(UUID executionId, String error) {
        Execution execution = executionRepository.findById(executionId).orElseThrow();
        execution.setStatus(Execution.Status.FAILED);
        execution.setEndedAt(LocalDateTime.now());
        executionRepository.save(execution);

        ExecutionLog failureLog = new ExecutionLog();
        failureLog.setExecutionId(executionId);
        failureLog.setStepName("SYSTEM");
        failureLog.setStepType("ERROR");
        failureLog.setStatus("FAILED");
        failureLog.setErrorMessage(error);
        failureLog.setEvaluatedRules("");
        failureLog.setStartedAt(LocalDateTime.now());
        executionLogRepository.save(failureLog);
    }
}
