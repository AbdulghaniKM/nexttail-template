import axios from 'axios';
import { appConfig } from '@/config/app.config';
import { getApiUrl } from '@/config/env';

export const api = axios.create({
  baseURL: appConfig.api?.baseUrl || getApiUrl(),
  timeout: appConfig.api?.timeout || 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

export default api;
