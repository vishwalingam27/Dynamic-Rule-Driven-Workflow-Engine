package com.example.workflowengine.controller;

import com.example.workflowengine.model.Execution;
import com.example.workflowengine.repository.ExecutionRepository;
import com.example.workflowengine.repository.StepRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final ExecutionRepository executionRepository;
    private final StepRepository stepRepository;

    public DashboardController(ExecutionRepository executionRepository, StepRepository stepRepository) {
        this.executionRepository = executionRepository;
        this.stepRepository = stepRepository;
    }

    @GetMapping("/active-flows")
    public Map<String, Long> getActiveFlows() {
        long count = executionRepository.countByStatus(Execution.Status.IN_PROGRESS);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return response;
    }

    @GetMapping("/total-steps")
    public Map<String, Long> getTotalSteps() {
        long count = stepRepository.count();
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return response;
    }
}
