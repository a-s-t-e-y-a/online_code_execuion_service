export interface responseInterface {
  success: boolean;
  message?: string;
  data?: any;
}
export interface responsePaginationInterface extends responseInterface {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}