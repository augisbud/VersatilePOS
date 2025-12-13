import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface CreateStripePaymentIntentRequest {
  amount: number;
  currency?: string;
  orderId?: number;
}

export interface CreateStripePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export const createStripePaymentIntent = async (
  data: CreateStripePaymentIntentRequest
): Promise<CreateStripePaymentIntentResponse> => {
  // Get auth token from localStorage if available
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await axios.post<CreateStripePaymentIntentResponse>(
    `${API_BASE_URL}/payment/stripe/create-intent`,
    data,
    { headers }
  );
  return response.data;
};
