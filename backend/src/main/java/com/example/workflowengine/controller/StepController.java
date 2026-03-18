package com.example.workflowengine.controller;

import com.example.workflowengine.model.Rule;
import com.example.workflowengine.model.Step;
import com.example.workflowengine.repository.RuleRepository;
import com.example.workflowengine.repository.StepRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class StepController {

    private final StepRepository stepRepository;
    private final RuleRepository ruleRepository;

    public StepController(StepRepository stepRepository, RuleRepository ruleRepository) {
        this.stepRepository = stepRepository;
        this.ruleRepository = ruleRepository;
    }

    @PostMapping("/workflows/{workflowId}/steps")
    public Step createStep(@PathVariable UUID workflowId, @RequestBody Step step) {
        step.setWorkflowId(workflowId);
        return stepRepository.save(step);
    }

    @GetMapping("/workflows/{workflowId}/steps")
    public List<Step> getSteps(@PathVariable UUID workflowId) {
        return stepRepository.findByWorkflowIdOrderByStepOrder(workflowId);
    }

    @PutMapping("/steps/{id}")
    public Step updateStep(@PathVariable UUID id, @RequestBody Step stepDetails) {
        Step step = stepRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Step not found"));
        
        step.setName(stepDetails.getName());
        step.setStepType(stepDetails.getStepType());
        step.setStepOrder(stepDetails.getStepOrder());
        step.setMetadata(stepDetails.getMetadata());
        
        return stepRepository.save(step);
    }

    @DeleteMapping("/steps/{id}")
    @Transactional
    public void deleteStep(@PathVariable UUID id) {
        ruleRepository.deleteByStepId(id);
        stepRepository.deleteById(id);
    }

    // Rule endpoints
    @PostMapping("/steps/{stepId}/rules")
    public Rule createRule(@PathVariable UUID stepId, @RequestBody Rule rule) {
        rule.setStepId(stepId);
        return ruleRepository.save(rule);
    }

    @GetMapping("/steps/{stepId}/rules")
    public List<Rule> getRules(@PathVariable UUID stepId) {
        return ruleRepository.findByStepIdOrderByPriorityAsc(stepId);
    }

    @PutMapping("/rules/{id}")
    public Rule updateRule(@PathVariable Long id, @RequestBody Rule ruleDetails) {
        Rule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found"));
        
        rule.setCondition(ruleDetails.getCondition());
        rule.setNextStepId(ruleDetails.getNextStepId());
        rule.setPriority(ruleDetails.getPriority());
        
        return ruleRepository.save(rule);
    }

    @DeleteMapping("/rules/{id}")
    public void deleteRule(@PathVariable Long id) {
        ruleRepository.deleteById(id);
    }
}
