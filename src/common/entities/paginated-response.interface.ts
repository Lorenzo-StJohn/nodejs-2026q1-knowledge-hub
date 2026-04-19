export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export type ConditionalResponse<T> = T[] | PaginatedResponse<T>;
