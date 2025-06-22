using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Interfaces;
using TodoApi.Models;

namespace TodoApi.Services
{
    public class TodoService : ITodoService
    {
        private readonly AppDbContext _context;

        public TodoService(AppDbContext context) => _context = context;

        public async Task<PaginatedResponse<Todo>> GetAllTodos(int pageNumber, int pageSize, string? filter = null)
        {
            IQueryable<Todo> query = _context.Todos.AsQueryable();

            // Apply filter
            if (!string.IsNullOrEmpty(filter))
            {
                switch (filter.ToLower())
                {
                    case "active":
                        query = query.Where(t => !t.IsCompleted);
                        break;
                    case "completed":
                        query = query.Where(t => t.IsCompleted);
                        break;
                        // "all" is the default
                }
            }

            var totalCount = await query.CountAsync();
            var activeCount = await _context.Todos.CountAsync(t => !t.IsCompleted);

            var items = await query
           .OrderBy(t => t.Id)
           .Skip((pageNumber - 1) * pageSize)
           .Take(pageSize)
           .ToListAsync();

            return new PaginatedResponse<Todo>
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                ActiveCount = await _context.Todos.CountAsync(t => !t.IsCompleted),
                Items = items
            };
        }

        public async Task<Todo> CreateTodo(CreateTodoDto dto)
        {
            if (dto.Title == null)
                throw new ArgumentNullException(nameof(dto.Title), "Title is required.");

            if (dto.Title.Length < 10)
                throw new ArgumentException("Task must be at least 10 characters.", nameof(dto.Title));

            if (dto.Title.Length > 1000)
                throw new ArgumentException("Task cannot exceed 1000 characters.", nameof(dto.Title));

            var todo = new Todo
            {
                Title = dto.Title,
                Deadline = dto.Deadline,
                IsCompleted = dto.IsCompleted
            };

            _context.Todos.Add(todo);
            await _context.SaveChangesAsync();
            return todo;
        }

        public async Task UpdateTodo(int id, UpdateTodoDto dto)
        {
            var existingTodo = await _context.Todos.FindAsync(id);
            if (existingTodo == null)
                throw new KeyNotFoundException($"Todo with ID {id} not found");

            // Update only provided properties
            if (dto.Title != null)
            {
                if (dto.Title.Length < 10)
                    throw new ArgumentException("Title must be at least 10 characters");
                if (dto.Title.Length > 1000)
                    throw new ArgumentException("Task cannot exceed 1000 characters.", nameof(dto.Title));
                existingTodo.Title = dto.Title;
            }

            if (dto.Deadline != null)
            {
                existingTodo.Deadline = dto.Deadline;
            }

            if (dto.IsCompleted.HasValue)
            {
                existingTodo.IsCompleted = dto.IsCompleted.Value;
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteTodo(int id)
        {
            var todo = await _context.Todos.FindAsync(id);
            if (todo == null)
                throw new KeyNotFoundException($"Todo with ID {id} not found");

            _context.Todos.Remove(todo);
            await _context.SaveChangesAsync();
        }
    }
}