import React, { useState, useRef, useEffect } from 'react';
import { Todo, UpdateTodoDto } from '../types';
import { updateTodo, deleteTodo } from '../services/todoService';

interface TodoItemProps {
  todo: Todo;
  onUpdate: () => void;
  onDelete: () => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDeadline, setEditedDeadline] = useState(
    todo.deadline ? new Date(todo.deadline).toISOString().split('T')[0] : ''
  );
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLSpanElement>(null);
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);
  
  // Check if title is truncated
  useEffect(() => {
    if (titleRef.current) {
      setIsTitleTruncated(
        titleRef.current.scrollWidth > titleRef.current.clientWidth
      );
    }
  }, [todo.title, isEditingTitle]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateTodo(todo.id, { isCompleted: !todo.isCompleted });
      setError('');
      onUpdate();
    } catch (err: any) {
      setError('Failed to update status. Please try again.');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await deleteTodo(todo.id);
      setError('');
      onDelete();
    } catch (err: any) {
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleTitleEdit = async () => {
    if (editedTitle.length < 10) {
      setError('Task must be at least 10 characters');
      return;
    }
    
    try {
      await updateTodo(todo.id, { title: editedTitle });
      setError('');
      setIsEditingTitle(false);
      onUpdate();
    } catch (err: any) {
      // Extract specific error message
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to update task. Please try again.');
        }
      } else {
        setError('Failed to update task. Please try again.');
      }
    }
  };

  const handleDeadlineEdit = async () => {
    try {
      const updateData: UpdateTodoDto = {};
      
      if (editedDeadline) {
        // Convert to ISO string at midnight UTC
        updateData.deadline = `${editedDeadline}T00:00:00.000Z`;
      } else {
        updateData.deadline = undefined;
      }
      
      await updateTodo(todo.id, updateData);
      setError('');
      setIsEditingDeadline(false);
      onUpdate();
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to update deadline');
      } else {
        setError('Failed to update deadline. Please try again.');
      }
    }
  };

  const isOverdue = todo.deadline && 
    new Date(todo.deadline) < new Date() && 
    !todo.isCompleted;

  return (
    <tr className={`todo-item ${isOverdue ? 'overdue' : ''} ${isEditingDeadline ? 'editing-row' : ''}`}>
      <td className="status-cell">
        <input 
          type="checkbox" 
          checked={todo.isCompleted} 
          onChange={handleStatusChange} 
          onClick={e => e.stopPropagation()} 
          className="status-checkbox"
        />
      </td>
      <td className="title-cell">
        {isEditingTitle ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleEdit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleEdit()}
            autoFocus
            className="edit-input"
            maxLength={1000}
          />
        ) : (
          <span 
            ref={titleRef}
            className={`title-text ${todo.isCompleted ? 'completed' : ''}`}
            onDoubleClick={() => setIsEditingTitle(true)}
            title={isTitleTruncated ? todo.title : undefined}
          >
            {todo.title}
          </span>
        )}
        {error && <div className="error-message">{error}</div>}
      </td>
      <td className="deadline-cell">
        {isEditingDeadline ? (
          <div className="deadline-edit-container">
            <input
              type="date"
              value={editedDeadline}
              onChange={(e) => setEditedDeadline(e.target.value)}
              onBlur={handleDeadlineEdit}
              onKeyDown={(e) => e.key === 'Enter' && handleDeadlineEdit()}
              autoFocus
              className="date-input"
            />
            <button 
              onClick={(e) => {
                e.preventDefault();
                setEditedDeadline('');
              }}
              className="clear-button"
              title="Clear deadline"
            >
              ×
            </button>
          </div>
        ) : todo.deadline ? (
          <span 
            className="deadline-text"
            onDoubleClick={() => setIsEditingDeadline(true)}
          >
            {new Date(todo.deadline).toLocaleDateString()}
          </span>
        ) : (
          <span 
            className="no-deadline"
            onDoubleClick={() => setIsEditingDeadline(true)}
          >
            -
          </span>
        )}
      </td>
      <td className="actions-cell">
        <button onClick={handleDelete} className="delete-button">Delete</button>
      </td>
    </tr>
  );
};

export default TodoItem;