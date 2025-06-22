export interface Todo {
  id: number;
  title: string;
  deadline?: string;
  isCompleted: boolean;
}

export interface CreateTodoDto {
  title: string;
  deadline?: string;
  isCompleted: boolean;
}

export interface UpdateTodoDto {
  title?: string;
  deadline?: string;
  isCompleted?: boolean;
}

export interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  activeCount: number;
  items: T[];
}