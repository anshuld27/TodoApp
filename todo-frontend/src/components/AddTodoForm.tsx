import React, { useState } from 'react';
import { createTodo } from '../services/todoService';
import { CreateTodoDto } from '../types';

interface AddTodoFormProps {
  onTodoAdded: () => void;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ onTodoAdded }) => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.length < 10) {
      setError('Task must be at least 10 characters');
      return;
    }

    try {
      setError('');
      await createTodo({ 
        title, 
        deadline: deadline || undefined, 
        isCompleted: false 
      });
      setTitle('');
      setDeadline('');
      onTodoAdded();
    } catch (err: any) {
      // Extract specific error message from server response
      if (err.response && err.response.data) {
        // For ASP.NET validation errors
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } 
        // For DTO validation errors
        else if (err.response.data.errors && err.response.data.errors.Title) {
          setError(err.response.data.errors.Title.join(', '));
        }
        // For custom service exceptions
        else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to add task. Please try again.');
        }
      } else {
        setError('Failed to add task. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-form">
      <div className="form-group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task (min 10 characters)"
          className="task-input"
          maxLength={1000} // Prevent extremely long inputs
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="date-input"
        />
        <button type="submit" className="add-button">Add</button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};

export default AddTodoForm;