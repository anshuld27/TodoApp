import React from 'react';

interface FiltersProps {
  currentFilter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
  itemCount: number;
}

const Filters: React.FC<FiltersProps> = ({ currentFilter, onFilterChange, itemCount }) => {
    const getItemText = () => {
    const count = itemCount ?? 0;
        if (currentFilter === 'active') return `${count} active task`;
        if (currentFilter === 'completed') return `${count} completed task`;
        return `${count} task total`;
    };

  return (
    <div className="filters">
      <span className="items-left">{getItemText()}</span>
      <div className="filter-buttons">
        <button 
          onClick={() => onFilterChange('all')}
          className={`filter-button ${currentFilter === 'all' ? 'active' : ''}`}
        >
          All
        </button>
        <button 
          onClick={() => onFilterChange('active')}
          className={`filter-button ${currentFilter === 'active' ? 'active' : ''}`}
        >
          Active
        </button>
        <button 
          onClick={() => onFilterChange('completed')}
          className={`filter-button ${currentFilter === 'completed' ? 'active' : ''}`}
        >
          Completed
        </button>
      </div>
    </div>
  );
};

export default Filters;