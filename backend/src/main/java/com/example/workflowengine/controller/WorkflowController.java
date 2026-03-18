package com.example.workflowengine.controller;

import com.example.workflowengine.model.Workflow;
import com.example.workflowengine.repository.WorkflowRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workflows")
@CrossOrigin(origins = "*")
public class WorkflowController {

    private final WorkflowRepository workflowRepository;

    public WorkflowController(WorkflowRepository workflowRepository) {
        this.workflowRepository = workflowRepository;
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
    public Workflow getWorkflow(@PathVariable UUID id) {
        return workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));
    }

    @PutMapping("/{id}")
    public Workflow updateWorkflow(@PathVariable UUID id, @RequestBody Workflow workflowDetails) {
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
    public void deleteWorkflow(@PathVariable UUID id) {
        workflowRepository.deleteById(id);
    }
}
