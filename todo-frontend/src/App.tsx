import React, { useState, useEffect } from 'react';
import TodoList from './components/TodoList';
import AddTodoForm from './components/AddTodoForm';
import Filters from './components/Filters';
import { Todo } from './types';
import { getTodos } from './services/todoService';
import Pagination from './components/Pagination';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 1
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch todos when pagination or filter changes
  useEffect(() => {
    fetchTodos();
  }, [pagination.pageNumber, pagination.pageSize, filter])

   const fetchTodos = async () => {
    try {
       setLoading(true);
      const response = await getTodos(pagination.pageNumber, pagination.pageSize, filter);
      setTodos(response.data.items);
      setActiveCount(response.data.activeCount || 0);
      setPagination({
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages
      });
      setError('');
    } catch (err) {
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

   const handleFilterChange = (newFilter: 'all' | 'active' | 'completed') => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, pageNumber: newPage }));
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, pageNumber: 1 }));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.isCompleted;
    if (filter === 'completed') return todo.isCompleted;
    return true;
  });

  // Helper to preserve scroll position
  const preserveScroll = async (fn: () => Promise<void>) => {
    const scrollY = window.scrollY;
    await fn();
    window.scrollTo({ top: scrollY });
  };

  // Wrap fetchTodos for update
  const fetchTodosPreserveScroll = () => preserveScroll(fetchTodos);

  return (
    <div className="app">
      <h1 className="app-title">todos</h1>
      <div className="container">
        <AddTodoForm onTodoAdded={fetchTodosPreserveScroll} />
        
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <TodoList 
              todos={filteredTodos} 
              onTodoUpdated={fetchTodosPreserveScroll} 
              onTodoDeleted={fetchTodosPreserveScroll} 
            />
            <Filters 
              currentFilter={filter} 
              onFilterChange={handleFilterChange} 
              itemCount={pagination.totalCount}
            />
          </>
        )}
      </div>
      
      <Pagination 
        currentPage={pagination.pageNumber}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount} // Pass totalCount
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

export default App;
