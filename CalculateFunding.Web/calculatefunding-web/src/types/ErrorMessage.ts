export interface ErrorMessage {
  id: number;
  fieldName?: string;
  description?: string;
  suggestion?: any;
  message: string;
  validationErrors?: ValidationErrors | undefined;
}

export interface ValidationErrors {
  [key: string]: string[];
}
