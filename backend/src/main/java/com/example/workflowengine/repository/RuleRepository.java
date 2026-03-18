package com.example.workflowengine.repository;

import com.example.workflowengine.model.Rule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

public interface RuleRepository extends JpaRepository<Rule, Long> {
    List<Rule> findByStepIdOrderByPriorityAsc(UUID stepId);
    void deleteByStepId(UUID stepId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Rule r WHERE r.stepId NOT IN (SELECT s.id FROM Step s)")
    void deleteOrphanRules();
}
