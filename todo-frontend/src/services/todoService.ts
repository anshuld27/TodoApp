import axios from 'axios';
import { CreateTodoDto, PaginatedResponse, Todo, UpdateTodoDto } from '../types';

const API_URL = 'https://localhost:5000/api/todos';

export const getTodos = (
  pageNumber: number = 1, 
  pageSize: number = 10,
  filter: 'all' | 'active' | 'completed' = 'all'
) => 
  axios.get<PaginatedResponse<Todo>>(API_URL, {
    params: { 
      pageNumber, 
      pageSize,
      filter: filter === 'all' ? null : filter // Don't send 'all' to backend
    }
  });
export const createTodo = (todo: CreateTodoDto) => axios.post<Todo>(API_URL, todo);
export const updateTodo = (id: number, updateData: UpdateTodoDto) => 
  axios.put(`${API_URL}/${id}`, updateData);
export const deleteTodo = (id: number) => axios.delete(`${API_URL}/${id}`);