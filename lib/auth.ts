import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'candidate' | 'lecturer' | 'admin';
}

export interface SignInData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'candidate' | 'lecturer' | 'admin';
  date_joined: string;
  avatar_url?: string;
}

export const authService = {
  async signUp(data: SignUpData): Promise<User> {
    const response = await axios.post(`${API_URL}/auth/signup`, data);
    return response.data;
  },

  async signIn(data: SignInData): Promise<{ user: User; token: string }> {
    const response = await axios.post(`${API_URL}/auth/signin`, data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}; 