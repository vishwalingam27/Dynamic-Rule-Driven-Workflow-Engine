package com.example.workflowengine.controller;

import com.example.workflowengine.model.Workflow;
import com.example.workflowengine.model.Step;
import com.example.workflowengine.model.Execution;
import com.example.workflowengine.repository.WorkflowRepository;
import com.example.workflowengine.repository.StepRepository;
import com.example.workflowengine.repository.RuleRepository;
import com.example.workflowengine.repository.ExecutionRepository;
import com.example.workflowengine.repository.ExecutionLogRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workflows")
@CrossOrigin(origins = "*")
public class WorkflowController {

    private final WorkflowRepository workflowRepository;
    private final StepRepository stepRepository;
    private final RuleRepository ruleRepository;
    private final ExecutionRepository executionRepository;
    private final ExecutionLogRepository executionLogRepository;

    public WorkflowController(WorkflowRepository workflowRepository,
                              StepRepository stepRepository,
                              RuleRepository ruleRepository,
                              ExecutionRepository executionRepository,
                              ExecutionLogRepository executionLogRepository) {
        this.workflowRepository = workflowRepository;
        this.stepRepository = stepRepository;
        this.ruleRepository = ruleRepository;
        this.executionRepository = executionRepository;
        this.executionLogRepository = executionLogRepository;
    }

    @PostMapping
    public Workflow createWorkflow(@RequestBody Workflow workflow) {
        return workflowRepository.save(workflow);
    }

    @GetMapping
    public List<Workflow> getAllWorkflows() {
        return workflowRepository.findAll();
    }

    @GetMapping("/{id}")
    public Workflow getWorkflow(@PathVariable("id") UUID id) {
        return workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));
    }

    @PutMapping("/{id}")
    public Workflow updateWorkflow(@PathVariable("id") UUID id, @RequestBody Workflow workflowDetails) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));
        
        workflow.setName(workflowDetails.getName());
        workflow.setVersion(workflowDetails.getVersion());
        workflow.setActive(workflowDetails.isActive());
        workflow.setInputSchema(workflowDetails.getInputSchema());
        workflow.setStartStepId(workflowDetails.getStartStepId());
        
        return workflowRepository.save(workflow);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void deleteWorkflow(@PathVariable("id") UUID id) {
        // Delete execution logs and executions
        List<Execution> executions = executionRepository.findByWorkflowId(id);
        for (Execution exec : executions) {
            executionLogRepository.deleteByExecutionId(exec.getId());
        }
        executionRepository.deleteByWorkflowId(id);

        // Delete rules and steps
        List<Step> steps = stepRepository.findByWorkflowIdOrderByStepOrder(id);
        for (Step step : steps) {
            ruleRepository.deleteByStepId(step.getId());
        }
        stepRepository.deleteByWorkflowId(id);

        // Finally delete the workflow
        workflowRepository.deleteById(id);
    }
}
