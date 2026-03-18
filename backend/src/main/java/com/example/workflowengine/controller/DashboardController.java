package com.example.workflowengine.controller;

import com.example.workflowengine.model.Execution;
import com.example.workflowengine.repository.ExecutionRepository;
import com.example.workflowengine.repository.StepRepository;
import com.example.workflowengine.repository.RuleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final ExecutionRepository executionRepository;
    private final StepRepository stepRepository;
    private final RuleRepository ruleRepository;

    public DashboardController(ExecutionRepository executionRepository, 
                               StepRepository stepRepository,
                               RuleRepository ruleRepository) {
        this.executionRepository = executionRepository;
        this.stepRepository = stepRepository;
        this.ruleRepository = ruleRepository;
    }

    @PostConstruct
    public void cleanupOrphans() {
        try {
            ruleRepository.deleteOrphanRules();
            stepRepository.deleteOrphanSteps();
            System.out.println("Cleaned up orphaned rules and steps from database.");
        } catch (Exception e) {
            System.err.println("Error cleaning up orphaned data: " + e.getMessage());
        }
    }

    @GetMapping("/active-flows")
    public Map<String, Long> getActiveFlows() {
        long count = executionRepository.countByStatusIn(
                java.util.Arrays.asList(Execution.Status.IN_PROGRESS, Execution.Status.WAITING_FOR_APPROVAL)
        );
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return response;
    }

    @GetMapping("/total-steps")
    public Map<String, Long> getTotalSteps() {
        long count = stepRepository.countValidSteps();
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return response;
    }
}
