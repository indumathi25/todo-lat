import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('access_token='))
      ?.split('=')[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 403 and haven't retried yet, try to refresh the token
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear the expired token
      document.cookie = 'access_token=; path=/; max-age=0';

      // Reload the page to trigger Auth0 token refresh via TokenSync
      console.warn('Token expired, refreshing page to get new token...');
      window.location.reload();

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export const youtubeSearchSuggestions = async (query: string): Promise<string[]> => {
  try {
    const response = await api.get('/youtube/search/', {
      params: { q: query },
    });
    return response.data.suggestions;
  } catch (error) {
    console.error('Error fetching YouTube suggestions:', error);
    throw error;
  }
};

export default api;
