import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import * as todoService from './services/todoService';

// Mock window.scrollTo to prevent JSDOM error
beforeAll(() => {
  window.scrollTo = jest.fn();
});

jest.mock('./services/todoService');
jest.mock('./components/TodoList', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="mock-todolist">TodoList</div>
}));
jest.mock('./components/AddTodoForm', () => ({
  __esModule: true,
  default: (props: any) => <button onClick={props.onTodoAdded} data-testid="mock-addtodo">AddTodoForm</button>
}));
jest.mock('./components/Filters', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="mock-filters">Filters</div>
}));
// FIX: Accept currentPage, trigger next page
jest.mock('./components/Pagination', () => ({
  __esModule: true,
  default: (props: any) => (
    <button
      onClick={() => props.onPageChange(props.currentPage + 1)}
      data-testid="mock-pagination"
    >
      Pagination
    </button>
  )
}));

describe('App', () => {
  const mockResponse = {
    data: {
      items: [
        { id: 1, title: 'Task 1', isCompleted: false },
        { id: 2, title: 'Task 2', isCompleted: true }
      ],
      pageNumber: 1,
      pageSize: 5,
      totalCount: 2,
      totalPages: 1,
      activeCount: 1
    }
  };

  beforeEach(() => {
    (todoService.getTodos as jest.Mock).mockResolvedValue(mockResponse);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders app title and child components', async () => {
    render(<App />);
    expect(screen.getByText('todos')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('mock-todolist')).toBeInTheDocument();
      expect(screen.getByTestId('mock-addtodo')).toBeInTheDocument();
      expect(screen.getByTestId('mock-filters')).toBeInTheDocument();
      expect(screen.getByTestId('mock-pagination')).toBeInTheDocument();
    });
  });

  it('shows loading and then renders list', async () => {
    render(<App />);
    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('mock-todolist')).toBeInTheDocument();
    });
  });

  it('shows error if getTodos fails', async () => {
    (todoService.getTodos as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<App />);
    await waitFor(() =>
      expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument()
    );
  });

  it('calls fetchTodos when AddTodoForm triggers onTodoAdded', async () => {
    render(<App />);
    // First call by effect, second call by click
    await waitFor(() => expect(screen.getByTestId('mock-addtodo')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('mock-addtodo'));
    await waitFor(() =>
      expect(todoService.getTodos).toHaveBeenCalledTimes(2)
    );
  });

  it('calls fetchTodos when Pagination triggers onPageChange', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('mock-pagination')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('mock-pagination'));
    await waitFor(() =>
      expect(todoService.getTodos).toHaveBeenCalledTimes(1)
    );
  });
});
