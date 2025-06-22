import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from './TodoList';
import { Todo } from '../types';

jest.mock('./TodoItem', () => ({
  __esModule: true,
  default: ({ todo }: { todo: Todo }) => <tr data-testid="mock-todo-item"><td>{todo.title}</td></tr>
}));

describe('TodoList', () => {
  const todos: Todo[] = [
    { id: 1, title: 'Task 1', isCompleted: false },
    { id: 2, title: 'Task 2', isCompleted: true, deadline: '2099-12-31T00:00:00.000Z' },
  ];

  it('renders no tasks message when todos is empty', () => {
    render(<TodoList todos={[]} onTodoUpdated={jest.fn()} onTodoDeleted={jest.fn()} />);
    expect(screen.getByText('No tasks found')).toBeInTheDocument();
  });

  it('renders table and TodoItem for each todo', () => {
    render(<TodoList todos={todos} onTodoUpdated={jest.fn()} onTodoDeleted={jest.fn()} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-todo-item')).toHaveLength(2);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Task')).toBeInTheDocument();
    expect(screen.getByText('Deadline')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
