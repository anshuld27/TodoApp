import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Filters from './Filters';

describe('Filters', () => {
  let onFilterChange: jest.Mock;

  beforeEach(() => {
    onFilterChange = jest.fn();
  });

  it('renders with all filter and correct item count', () => {
    render(<Filters currentFilter="all" onFilterChange={onFilterChange} itemCount={5} />);
    expect(screen.getByText('5 task total')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all/i })).toHaveClass('active');
  });

  it('renders with active filter and correct item count', () => {
    render(<Filters currentFilter="active" onFilterChange={onFilterChange} itemCount={2} />);
    expect(screen.getByText('2 active task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /active/i })).toHaveClass('active');
  });

  it('renders with completed filter and correct item count', () => {
    render(<Filters currentFilter="completed" onFilterChange={onFilterChange} itemCount={3} />);
    expect(screen.getByText('3 completed task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /completed/i })).toHaveClass('active');
  });

  it('calls onFilterChange when filter buttons are clicked', () => {
    render(<Filters currentFilter="all" onFilterChange={onFilterChange} itemCount={1} />);
    fireEvent.click(screen.getByRole('button', { name: /active/i }));
    expect(onFilterChange).toHaveBeenCalledWith('active');
    fireEvent.click(screen.getByRole('button', { name: /completed/i }));
    expect(onFilterChange).toHaveBeenCalledWith('completed');
    fireEvent.click(screen.getByRole('button', { name: /all/i }));
    expect(onFilterChange).toHaveBeenCalledWith('all');
  });

  it('shows 0 task total if itemCount is not provided', () => {
    render(<Filters currentFilter="all" onFilterChange={onFilterChange} itemCount={0} />);
    expect(screen.getByText('0 task total')).toBeInTheDocument();
  });
});
