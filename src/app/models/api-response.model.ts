export interface ApiFieldError {
  path: (string | number)[];
  message: string;
  code?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiFieldError[];
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
