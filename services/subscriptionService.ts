// services/subscriptionService.ts
import axios from 'axios';

const API_BASE = 'http://localhost:5000'; // Adjust if your backend runs elsewhere

export const subscriptionService = {
  // Update user's subscription after payment
  updateSubscription: async (email: string, plan: string) => {
    const res = await axios.post(`${API_BASE}/api/subscription/update-subscription`, { email, plan });
    return res.data;
  },

  // Fetch user's subscription info
  fetchSubscription: async (email: string) => {
    const res = await axios.get(`${API_BASE}/api/subscription/fetch-subscription`, { params: { email } });
    return res.data;
  },
};
