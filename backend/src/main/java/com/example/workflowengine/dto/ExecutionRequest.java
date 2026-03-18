package com.example.workflowengine.dto;

public class ExecutionRequest {
    private String data;
    private String triggeredBy;

    public String getData() { return data; }
    public void setData(String data) { this.data = data; }

    public String getTriggeredBy() { return triggeredBy; }
    public void setTriggeredBy(String triggeredBy) { this.triggeredBy = triggeredBy; }
}
