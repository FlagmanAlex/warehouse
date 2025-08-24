// Interfaces/DTO/ApiResponse.ts

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;