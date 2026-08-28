export interface TErrorSources {
  path: string;
  message: string;
}

export interface TErrorResponse {
    statusCode?: number;
  success: boolean;
  message: string;
    errorSource: TErrorSources[];
    stack?: string;
  error?: unknown;
}