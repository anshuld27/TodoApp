import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddTodoForm from './AddTodoForm';
import * as todoService from '../services/todoService';

jest.mock('../services/todoService');

describe('AddTodoForm', () => {
  let onTodoAdded: jest.Mock;

  beforeEach(() => {
    onTodoAdded = jest.fn();
    jest.clearAllMocks();
  });

  it('renders input fields and button', () => {
    render(<AddTodoForm onTodoAdded={onTodoAdded} />);
    expect(screen.getByPlaceholderText(/min 10 characters/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    // Use getByRole with type 'date' since there's no label for date input
    const dateInput = screen.getByRole('textbox', { name: '' }) || 
      screen.getByDisplayValue(''); // fallback
    expect(document.querySelector('.date-input[type="date"]')).toBeInTheDocument();
  });

  it('shows error if title is too short', async () => {
    render(<AddTodoForm onTodoAdded={onTodoAdded} />);
    fireEvent.change(screen.getByPlaceholderText(/min 10 characters/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(await screen.findByText(/at least 10 characters/i)).toBeInTheDocument();
  });

  it('calls createTodo and onTodoAdded on valid submit', async () => {
    (todoService.createTodo as jest.Mock).mockResolvedValue({});
    render(<AddTodoForm onTodoAdded={onTodoAdded} />);
    fireEvent.change(screen.getByPlaceholderText(/min 10 characters/i), { target: { value: 'A valid todo title' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    await waitFor(() =>
      expect(todoService.createTodo).toHaveBeenCalledWith({ title: 'A valid todo title', deadline: undefined, isCompleted: false })
    );
    expect(onTodoAdded).toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/min 10 characters/i)).toHaveValue('')
    );
  });

  it('submits with deadline', async () => {
    (todoService.createTodo as jest.Mock).mockResolvedValue({});
    render(<AddTodoForm onTodoAdded={onTodoAdded} />);
    fireEvent.change(screen.getByPlaceholderText(/min 10 characters/i), { target: { value: 'A valid todo title' } });

    // Use querySelector to get the date input since there is no label
    const dateInput = document.querySelector('.date-input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2099-12-31' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    await waitFor(() =>
      expect(todoService.createTodo).toHaveBeenCalledWith({
        title: 'A valid todo title',
        deadline: '2099-12-31',
        isCompleted: false,
      })
    );
    expect(onTodoAdded).toHaveBeenCalled();
  });

  it('shows error if createTodo fails with string', async () => {
    (todoService.createTodo as jest.Mock).mockRejectedValue({ response: { data: 'Server error' } });
    render(<AddTodoForm onTodoAdded={onTodoAdded} />);
    fireEvent.change(screen.getByPlaceholderText(/min 10 characters/i), { target: { value: 'A valid todo title' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(await screen.findByText(/Server error/i)).toBeInTheDocument();
  });

  it('shows error if createTodo fails with DTO validation', async () => {
    (todoService.createTodo as jest.Mock).mockRejectedValue({ response: { data: { errors: { Title: ['Title error'] } } } });
    render(<AddTodoForm onTodoAdded={onTodoAdded} />);
    fireEvent.change(screen.getByPlaceholderText(/min 10 characters/i), { target: { value: 'A valid todo title' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(await screen.findByText(/Title error/i)).toBeInTheDocument();
  });

  it('shows error if createTodo fails with custom message', async () => {
    (todoService.createTodo as jest.Mock).mockRejectedValue({ response: { data: { message: 'Custom error' } } });
    render(<AddTodoForm onTodoAdded={onTodoAdded} />);
    fireEvent.change(screen.getByPlaceholderText(/min 10 characters/i), { target: { value: 'A valid todo title' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(await screen.findByText(/Custom error/i)).toBeInTheDocument();
  });

  it('shows fallback error if createTodo fails with unknown error', async () => {
    (todoService.createTodo as jest.Mock).mockRejectedValue({});
    render(<AddTodoForm onTodoAdded={onTodoAdded} />);
    fireEvent.change(screen.getByPlaceholderText(/min 10 characters/i), { target: { value: 'A valid todo title' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(await screen.findByText(/Failed to add task/i)).toBeInTheDocument();
  });
});
