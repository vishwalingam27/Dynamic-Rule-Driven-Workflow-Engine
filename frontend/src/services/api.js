import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const workflowService = {
  getAll: () => api.get('/workflows'),
  getById: (id) => api.get(`/workflows/${id}`),
  create: (data) => api.post('/workflows', data),
  update: (id, data) => api.put(`/workflows/${id}`, data),
  delete: (id) => api.delete(`/workflows/${id}`),
};

export const stepService = {
  getByWorkflow: (workflowId) => api.get(`/workflows/${workflowId}/steps`),
  create: (workflowId, data) => api.post(`/workflows/${workflowId}/steps`, data),
  update: (id, data) => api.put(`/steps/${id}`, data),
  delete: (id) => api.delete(`/steps/${id}`),
};

export const ruleService = {
  getByStep: (stepId) => api.get(`/steps/${stepId}/rules`),
  create: (stepId, data) => api.post(`/steps/${stepId}/rules`, data),
  update: (id, data) => api.put(`/rules/${id}`, data),
  delete: (id) => api.delete(`/rules/${id}`),
};

export const executionService = {
  execute: (workflowId, data) => api.post(`/workflows/${workflowId}/execute`, data),
  getById: (id) => api.get(`/executions/${id}`),
  getAll: () => api.get('/executions'),
  delete: (id) => api.delete(`/executions/${id}`),
  deleteAll: () => api.delete('/executions'),
};

export const dashboardService = {
  getActiveFlows: () => api.get('/dashboard/active-flows'),
  getTotalSteps: () => api.get('/dashboard/total-steps'),
};

export default api;
