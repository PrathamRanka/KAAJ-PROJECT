import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const endpoints = {
  // Lenders
  getLenders: () => api.get('/lenders/'),
  createLender: (data: any) => api.post('/lenders/', data),
  
  // Applications
  createApplication: (data: any) => api.post('/applications/', data),
  getApplication: (id: number) => api.get(`/applications/${id}`),
  runUnderwriting: (id: number) => api.post(`/applications/${id}/run-underwriting`),
  
  // Rules
  updateRule: (id: number, data: any) => api.put(`/rules/${id}`, data),
  createRule: (policyId: number, data: any) => api.post(`/policies/${policyId}/rules`, data),
  deleteRule: (id: number) => api.delete(`/rules/${id}`),
  
  // Policy
  clonePolicy: (id: number) => api.post(`/policies/${id}/clone`),
};
