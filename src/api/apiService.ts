import Config from "react-native-config";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { NotificationManager } from "../components/notification";

interface ApiResponse<R> {
  data?: R;
  error?: {
    message: string;
    status: number;
    code?: string;
  };
}

interface ApiRequestConfig extends AxiosRequestConfig {
  useRaceCondition?: boolean;
}

export class ApiService {
  private instance: AxiosInstance | null = null;
  private raceConditionMap: Map<string, AbortController> = new Map();

  constructor(config?: AxiosRequestConfig) {
    this.instance = axios.create({
      timeout: 1000,
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      ...config,
    });

    this.instance.interceptors.response.use(
      response => ({ data: response }),
      error => {
        const status = error?.response?.status || 500;

        if (error && error?.message !== "canceled") {
          NotificationManager.showMessage(
            {
              title: error.message,
              description: status.toString(),
            },
            {
              position: "top",
              floating: false,
            },
          );

          return Promise.resolve({
            data: {
              error: {
                message: error.message,
                status,
              },
            },
          });
        }

        return Promise.resolve({});
      },
    );
  }

  public async get<R = any, P = any>(
    endpoint: string,
    params?: P,
    config?: ApiRequestConfig,
  ) {
    const response = await this.instance!.get<ApiResponse<R>>(endpoint, {
      ...config,
      ...(config?.useRaceCondition ? this.raceCondition(endpoint) : {}),
      params,
    });

    return response.data;
  }

  public async post<R = any, P = any>(
    endpoint: string,
    params?: P,
    config?: ApiRequestConfig,
  ) {
    const response = await this.instance!.post<ApiResponse<R>>(endpoint, {
      ...config,
      ...(config?.useRaceCondition ? this.raceCondition(endpoint) : {}),
      params,
    });

    return response.data;
  }

  public async patch<R = any, P = any>(
    endpoint: string,
    params?: P,
    config?: ApiRequestConfig,
  ) {
    const response = await this.instance!.patch<ApiResponse<R>>(endpoint, {
      ...config,
      ...(config?.useRaceCondition ? this.raceCondition(endpoint) : {}),
      params,
    });

    return response.data;
  }

  public async put<R = any, P = any>(
    endpoint: string,
    params?: P,
    config?: ApiRequestConfig,
  ) {
    const response = await this.instance!.put<ApiResponse<R>>(endpoint, {
      ...config,
      ...(config?.useRaceCondition ? this.raceCondition(endpoint) : {}),
      params,
    });

    return response.data;
  }

  public async delete<R = any, P = any>(
    endpoint: string,
    params?: P,
    config?: ApiRequestConfig,
  ) {
    const response = await this.instance!.delete<ApiResponse<R>>(endpoint, {
      ...config,
      ...(config?.useRaceCondition ? this.raceCondition(endpoint) : {}),
      params,
    });

    return response.data;
  }

  private raceCondition(endpoint: string) {
    const controller = new AbortController();

    if (this.raceConditionMap.has(endpoint)) {
      this.raceConditionMap.get(endpoint)?.abort();
      this.raceConditionMap.delete(endpoint);
    }
    this.raceConditionMap.set(endpoint, controller);

    return controller;
  }
}

export const apiService = new ApiService({ baseURL: `${Config.BASE_URL}/` });
