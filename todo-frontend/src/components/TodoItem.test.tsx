import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoItem from './TodoItem';
import { Todo } from '../types';
import * as todoService from '../services/todoService';

jest.mock('../services/todoService');

const mockTodo: Todo = {
  id: 1,
  title: 'Test Todo Item',
  deadline: '2099-12-31T00:00:00.000Z',
  isCompleted: false,
};

// Helper for matching rendered date string, since toLocaleDateString may vary by environment
const getDisplayDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString();

describe('TodoItem', () => {
  let onUpdate: jest.Mock;
  let onDelete: jest.Mock;
  const renderedDate = getDisplayDate(mockTodo.deadline!);

  beforeEach(() => {
    onUpdate = jest.fn();
    onDelete = jest.fn();
    jest.clearAllMocks();
  });

  it('renders todo item', () => {
    render(
      <table>
        <tbody>
          <TodoItem todo={mockTodo} onUpdate={onUpdate} onDelete={onDelete} />
        </tbody>
      </table>
    );
    expect(screen.getByText('Test Todo Item')).toBeInTheDocument();
    expect(screen.getByText(renderedDate)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('calls updateTodo when status is toggled', async () => {
    (todoService.updateTodo as jest.Mock).mockResolvedValue({});
    render(
      <table>
        <tbody>
          <TodoItem todo={mockTodo} onUpdate={onUpdate} onDelete={onDelete} />
        </tbody>
      </table>
    );
    fireEvent.click(screen.getByRole('checkbox'));
    await waitFor(() => expect(todoService.updateTodo).toHaveBeenCalledWith(1, { isCompleted: true }));
    expect(onUpdate).toHaveBeenCalled();
  });

  it('shows error if updateTodo fails on status change', async () => {
    (todoService.updateTodo as jest.Mock).mockRejectedValue(new Error('fail'));
    render(
      <table>
        <tbody>
          <TodoItem todo={mockTodo} onUpdate={onUpdate} onDelete={onDelete} />
        </tbody>
      </table>
    );
    fireEvent.click(screen.getByRole('checkbox'));
    await waitFor(() =>
      expect(screen.getByText(/Failed to update status/i)).toBeInTheDocument()
    );
  });

  it('calls deleteTodo and onDelete when delete button is clicked', async () => {
    (todoService.deleteTodo as jest.Mock).mockResolvedValue({});
    render(
      <table>
        <tbody>
          <TodoItem todo={mockTodo} onUpdate={onUpdate} onDelete={onDelete} />
        </tbody>
      </table>
    );
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(todoService.deleteTodo).toHaveBeenCalledWith(1));
    expect(onDelete).toHaveBeenCalled();
  });

  it('shows error if deleteTodo fails', async () => {
    (todoService.deleteTodo as jest.Mock).mockRejectedValue(new Error('fail'));
    render(
      <table>
        <tbody>
          <TodoItem todo={mockTodo} onUpdate={onUpdate} onDelete={onDelete} />
        </tbody>
      </table>
    );
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() =>
      expect(screen.getByText(/Failed to delete task/i)).toBeInTheDocument()
    );
  });

  it('allows editing the title and calls updateTodo', async () => {
    (todoService.updateTodo as jest.Mock).mockResolvedValue({});
    render(
      <table>
        <tbody>
          <TodoItem todo={mockTodo} onUpdate={onUpdate} onDelete={onDelete} />
        </tbody>
      </table>
    );
    fireEvent.doubleClick(screen.getByText('Test Todo Item'));
    const input = screen.getByDisplayValue('Test Todo Item');
    fireEvent.change(input, { target: { value: 'Updated Todo Title' } });
    fireEvent.blur(input);
    await waitFor(() =>
      expect(todoService.updateTodo).toHaveBeenCalledWith(1, { title: 'Updated Todo Title' })
    );
    expect(onUpdate).toHaveBeenCalled();
  });

  it('shows error if title is too short', async () => {
    render(
      <table>
        <tbody>
          <TodoItem todo={mockTodo} onUpdate={onUpdate} onDelete={onDelete} />
        </tbody>
      </table>
    );
    fireEvent.doubleClick(screen.getByText('Test Todo Item'));
    const input = screen.getByDisplayValue('Test Todo Item');
    fireEvent.change(input, { target: { value: 'short' } });
    fireEvent.blur(input);
    expect(await screen.findByText(/at least 10 characters/i)).toBeInTheDocument();
  });

  it('allows editing the deadline and calls updateTodo', async () => {
    (todoService.updateTodo as jest.Mock).mockResolvedValue({});
    render(
      <table>
        <tbody>
          <TodoItem todo={mockTodo} onUpdate={onUpdate} onDelete={onDelete} />
        </tbody>
      </table>
    );
    // Double click the rendered deadline string (format varies by locale)
    fireEvent.doubleClick(screen.getByText(renderedDate));
    const input = screen.getByDisplayValue('2099-12-31');
    fireEvent.change(input, { target: { value: '2100-01-01' } });
    fireEvent.blur(input);
    await waitFor(() =>
      expect(todoService.updateTodo).toHaveBeenCalledWith(1, { deadline: '2100-01-01T00:00:00.000Z' })
    );
    expect(onUpdate).toHaveBeenCalled();
  });

  it('clears the deadline when clear button is clicked', async () => {
    (todoService.updateTodo as jest.Mock).mockResolvedValue({});
    render(
      <table>
        <tbody>
          <TodoItem todo={mockTodo} onUpdate={onUpdate} onDelete={onDelete} />
        </tbody>
      </table>
    );
    fireEvent.doubleClick(screen.getByText(renderedDate));
    const clearBtn = screen.getByTitle('Clear deadline');
    fireEvent.click(clearBtn);
    const input = screen.getByDisplayValue('');
    fireEvent.blur(input);
    await waitFor(() =>
      expect(todoService.updateTodo).toHaveBeenCalledWith(1, { deadline: undefined })
    );
    expect(onUpdate).toHaveBeenCalled();
  });

  it('shows error if updateTodo fails on deadline edit', async () => {
    (todoService.updateTodo as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Failed to update deadline' } }
    });
    render(
      <table>
        <tbody>
          <TodoItem todo={mockTodo} onUpdate={onUpdate} onDelete={onDelete} />
        </tbody>
      </table>
    );
    fireEvent.doubleClick(screen.getByText(renderedDate));
    const input = screen.getByDisplayValue('2099-12-31');
    fireEvent.change(input, { target: { value: '2100-01-01' } });
    fireEvent.blur(input);
    await waitFor(() =>
      expect(screen.getByText(/Failed to update deadline/i)).toBeInTheDocument()
    );
  });
});
