import axios, { AxiosResponse } from "axios";
import { User, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    console.log("🔍 API login request:", data);
    const response: AxiosResponse<LoginResponse> = await api.post("/api/v1/auth/login", data);
    console.log("🔍 API login response:", response.data);
    console.log("🔍 API login response access_token:", response.data.access_token);
    console.log("🔍 API login response access_token type:", typeof response.data.access_token);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    console.log("🔍 API register request:", data);
    const response: AxiosResponse<RegisterResponse> = await api.post("/api/v1/auth/signup", data);
    console.log("🔍 API register response:", response.data);
    console.log("🔍 API register response access_token:", response.data.access_token);
    console.log("🔍 API register response access_token type:", typeof response.data.access_token);
    return response.data;
  },

  logout: async (): Promise<void> => {
    console.log("🔍 API logout request");
    const response: AxiosResponse<void> = await api.post("/api/v1/auth/logout");
    console.log("🔍 API logout response:", response.data);
    return response.data;
  },

  me: async (): Promise<LoginResponse["user"]> => {
    console.log("🔍 API me request");
    const response: AxiosResponse<LoginResponse["user"]> = await api.get("/api/v1/users/me");
    console.log("🔍 API me response:", response.data);
    return response.data;
  },
};

export default api;