export type BaseRequest<T extends object> = T & {
  search?: string;
  page?: number;
  size?: number;
  sortField?: string;
  sort: "asc" | "dsc";
};

export interface BaseResponse<T extends object> {
  data: T;
  page?: {
    number: number;
    count: number;
    totalElements: number;
  };
  error?: {
    error: Error;
    message: string;
    code: string;
  };
  status?: number;
}
