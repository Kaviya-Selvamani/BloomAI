import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5001/api', // Match the backend server URL
});

// Add an interceptor to insert the token
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Auth
export const registerUser = (userData) => API.post('/auth/signup', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const updateUserProfile = (data) => API.patch('/auth/profile', data);

// Diagnostic
export const getDiagnosticQuestions = (data) => API.post('/learning/diagnostic/questions', data);
export const submitDiagnosticResults = (data) => API.post('/learning/diagnostic/submit', data);

// Learning / Roadmap
export const generateRoadmap = (data) => API.post('/learning/roadmap', data);
export const getExplanation = (data) => API.post('/learning/explain', data);
export const askAssistant = (data) => API.post('/learning/assistant', data);

// Quiz
export const getFinalQuiz = (data) => API.post('/quiz/final-quiz', data);
export const submitFinalQuiz = (data) => API.post('/quiz/final-quiz/submit', data);

// History
export const getHistory = (userId) => API.get(`/learning/history/${userId}`);

export default API;
