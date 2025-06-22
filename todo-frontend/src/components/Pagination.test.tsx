import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pagination from './Pagination';

describe('Pagination', () => {
  let onPageChange: jest.Mock;
  let onPageSizeChange: jest.Mock;

  beforeEach(() => {
    onPageChange = jest.fn();
    onPageSizeChange = jest.fn();
  });

  it('renders pagination controls and info', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        pageSize={10}
        totalCount={42}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    );

    expect(screen.getByText('Showing 11 - 20 of 42 task')).toBeInTheDocument();

    // Navigation buttons
    expect(screen.getByLabelText('first page')).toBeInTheDocument();
    expect(screen.getByLabelText('last page')).toBeInTheDocument();
    expect(screen.getByLabelText('previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('next page')).toBeInTheDocument();

    // Active page button
    expect(screen.getByRole('button', { name: '2' })).toHaveClass('active');
  });

  it('disables prev/first on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        pageSize={10}
        totalCount={25}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    );

    expect(screen.getByLabelText('first page')).toBeDisabled();
    expect(screen.getByLabelText('previous page')).toBeDisabled();
    expect(screen.getByLabelText('next page')).not.toBeDisabled();
    expect(screen.getByLabelText('last page')).not.toBeDisabled();
  });

  it('disables next/last on last page', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={3}
        pageSize={10}
        totalCount={25}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    );

    expect(screen.getByLabelText('next page')).toBeDisabled();
    expect(screen.getByLabelText('last page')).toBeDisabled();
    expect(screen.getByLabelText('first page')).not.toBeDisabled();
    expect(screen.getByLabelText('previous page')).not.toBeDisabled();
  });

  it('calls onPageChange when navigation buttons are clicked', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={3}
        pageSize={10}
        totalCount={25}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    );

    fireEvent.click(screen.getByLabelText('first page'));
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByLabelText('previous page'));
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByLabelText('next page'));
    expect(onPageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByLabelText('last page'));
    expect(onPageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageSizeChange when page size is changed', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={2}
        pageSize={10}
        totalCount={15}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    );

    // Simulate selecting a new page size
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '20' } });
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('shows correct range for last page with fewer items', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={3}
        pageSize={10}
        totalCount={25}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    );

    expect(screen.getByText('Showing 21 - 25 of 25 task')).toBeInTheDocument();
  })
});
