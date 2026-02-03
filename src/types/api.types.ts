export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AssessmentCreatedResponse {
  success: boolean;
  assessmentId?: string;
  password?: string;
  message: string;
  error?: string;
  stack?: string;
}
