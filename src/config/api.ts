const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 
    (isDevelopment 
      ? 'http://localhost:8080'
      : 'https://w1ki-demo-backend-739333860791.asia-northeast2.run.app'),
  
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL ||
    (isDevelopment
      ? 'ws://localhost:8080'
      : 'wss://w1ki-demo-backend-739333860791.asia-northeast2.run.app'),
};

export const getApiUrl = (path: string) => `${API_CONFIG.BASE_URL}${path}`;
export const getWsUrl = (path: string) => `${API_CONFIG.WS_BASE_URL}${path}`;

console.log('環境:', isDevelopment ? '開発' : '本番');
console.log('API Base URL:', API_CONFIG.BASE_URL);
console.log('WebSocket Base URL:', API_CONFIG.WS_BASE_URL); 