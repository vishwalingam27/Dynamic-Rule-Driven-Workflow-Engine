package com.example.workflowengine.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.expression.MapAccessor;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class RuleEngineService {

    private static final Logger logger = LoggerFactory.getLogger(RuleEngineService.class);
    private final ExpressionParser parser = new SpelExpressionParser();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean evaluate(String condition, String jsonData) {
        String trimmed = condition != null ? condition.trim() : "";
        logger.info("Evaluating rule: '{}' [JSON: {}]", trimmed, jsonData);
        
        if (trimmed.isEmpty() || "DEFAULT".equalsIgnoreCase(trimmed) || "true".equalsIgnoreCase(trimmed)) {
            logger.info("Match confirmed (DEFAULT/Empty/true)");
            return true;
        }

        try {
            Map<String, Object> data = objectMapper.readValue(jsonData, new TypeReference<Map<String, Object>>() {});
            StandardEvaluationContext context = new StandardEvaluationContext();
            context.addPropertyAccessor(new MapAccessor());
            
            // Inject helper functions
            registerFunctions(context);
            
            if (data != null) {
                // Set variables for direct access like #amount
                data.forEach(context::setVariable);
                // Also set root object for direct access like amount
                context.setRootObject(data);
                logger.debug("Injected {} variables into context", data.size());
            }

            Expression expression = parser.parseExpression(trimmed);
            Object value = expression.getValue(context);
            
            boolean result = false;
            if (value instanceof Boolean) {
                result = (Boolean) value;
            } else if (value != null) {
                result = Boolean.parseBoolean(value.toString());
            }
            
            logger.info("Rule '{}' evaluated to: {}", trimmed, result);
            return result;
        } catch (Exception e) {
            logger.error("Evaluation FAILED for rule '{}': {}", trimmed, e.getMessage());
            return false;
        }
    }

    private void registerFunctions(StandardEvaluationContext context) {
        try {
            // String helpers
            context.registerFunction("contains", String.class.getDeclaredMethod("contains", CharSequence.class));
            context.registerFunction("upper", String.class.getDeclaredMethod("toUpperCase"));
            context.registerFunction("lower", String.class.getDeclaredMethod("toLowerCase"));
            
            // Math and utility
            context.registerFunction("abs", Math.class.getDeclaredMethod("abs", double.class));
            context.registerFunction("max", Math.class.getDeclaredMethod("max", double.class, double.class));
            
            // Custom logic symbols (optional enhancements)
            logger.debug("Registered SpEL utility functions");
        } catch (NoSuchMethodException e) {
            logger.warn("Failed to register some SpEL functions: {}", e.getMessage());
        }
    }
}
