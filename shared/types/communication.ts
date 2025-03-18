export interface ICommunicationResponse<T = any> {
  success?: boolean;
  error?: string;

  data?: T;
}
