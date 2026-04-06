import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: () => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error?: unknown) => {
  for (const prom of failedQueue) {
    if (error) prom.reject(error);
    else prom.resolve();
  }
  
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean });
    
    if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise<void>(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return client.request(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await client.post('/auth/refresh', undefined);
        processQueue();
        return client.request(originalRequest);
      } catch (err) {
        processQueue(err);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

type MockOptions<TRes> = {
  mock?: boolean;
  delayMs?: number;
  resolver?: () => TRes;
};

const simulateMock = async <TRes>(opts?: MockOptions<TRes>): Promise<TRes> => {
  const delay = opts?.delayMs ?? 1000;
  await new Promise((r) => setTimeout(r, delay));
  return opts?.resolver ? opts.resolver() : ({} as TRes);
};

export const api = {
  client,
  get: async <TRes>(url: string, config?: AxiosRequestConfig, mock?: MockOptions<TRes>): Promise<TRes> => {
    if (mock?.mock) return simulateMock<TRes>(mock);
    const res: AxiosResponse<TRes> = await client.get(url, config);
    return res.data;
  },
  post: async <TReq, TRes>(url: string, data: TReq, config?: AxiosRequestConfig, mock?: MockOptions<TRes>): Promise<TRes> => {
    if (mock?.mock) return simulateMock<TRes>(mock);
    const res: AxiosResponse<TRes> = await client.post(url, data, config);
    return res.data;
  },
  put: async <TReq, TRes>(url: string, data: TReq, config?: AxiosRequestConfig, mock?: MockOptions<TRes>): Promise<TRes> => {
    if (mock?.mock) return simulateMock<TRes>(mock);
    const res: AxiosResponse<TRes> = await client.put(url, data, config);
    return res.data;
  },
  delete: async <TRes>(url: string, config?: AxiosRequestConfig, mock?: MockOptions<TRes>): Promise<TRes> => {
    if (mock?.mock) return simulateMock<TRes>(mock);
    const res: AxiosResponse<TRes> = await client.delete(url, config);
    return res.data;
  }
};
