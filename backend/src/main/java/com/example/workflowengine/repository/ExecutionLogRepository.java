package com.example.workflowengine.repository;

import com.example.workflowengine.model.ExecutionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

public interface ExecutionLogRepository extends JpaRepository<ExecutionLog, Long> {
    List<ExecutionLog> findByExecutionIdOrderByStartedAtAsc(UUID executionId);
    
    @Modifying
    @Transactional
    void deleteByExecutionId(UUID executionId);
}
