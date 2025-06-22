import React from 'react';
import TodoItem from './TodoItem';
import { Todo } from '../types';

interface TodoListProps {
  todos: Todo[];
  onTodoUpdated: () => void;
  onTodoDeleted: () => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onTodoUpdated, onTodoDeleted }) => {
  if (todos.length === 0) {
    return <div className="no-tasks">No tasks found</div>;
  }

  return (
    <div className="table-container">
      <table className="todo-table">
        <colgroup>
          <col style={{ width: '50px' }} /> {/* Status - fixed width */}
          <col style={{ width: '60%' }} />  {/* Task - percentage width */}
          <col style={{ width: '20%' }} />  {/* Deadline - percentage width */}
          <col style={{ width: '100px' }} /> {/* Actions - fixed width */}
        </colgroup>
        <thead>
          <tr>
            <th className="status-header">Status</th>
            <th className="task-header">Task</th>
            <th className="deadline-header">Deadline</th>
            <th className="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={onTodoUpdated}
              onDelete={onTodoDeleted}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TodoList;