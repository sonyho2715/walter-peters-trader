// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  MEMBERS: `${API_URL}/api/v1/members`,
  STUDIES: `${API_URL}/api/v1/studies`,
  APPLICATIONS: `${API_URL}/api/v1/applications`,
  DASHBOARD: `${API_URL}/api/v1/dashboard`,
  HEALTH: `${API_URL}/health`,
};

// Development mode flag
export const IS_DEV = import.meta.env.DEV;

// Enable mock data if API URL is not configured
export const USE_MOCK_DATA = !import.meta.env.VITE_API_URL && !IS_DEV;
