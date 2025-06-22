using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Interfaces;
using TodoApi.Models;

namespace TodoApi.Services
{
    /// <summary>
    /// Service implementation for managing Todo items.
    /// Handles CRUD operations and supports pagination and filtering.
    /// </summary>
    public class TodoService : ITodoService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TodoService> _logger;

        /// <summary>
        /// Initializes a new instance of the TodoService class.
        /// </summary>
        /// <param name="context">The application's database context.</param>
        /// <param name="logger">Logger for logging service operations.</param>
        public TodoService(AppDbContext context, ILogger<TodoService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves a paginated list of todos, optionally filtered by status.
        /// </summary>
        public async Task<PaginatedResponse<Todo>> GetAllTodos(int pageNumber, int pageSize, string? filter = null)
        {
            _logger.LogInformation("Retrieving todos. Page: {PageNumber}, Size: {PageSize}, Filter: {Filter}", pageNumber, pageSize, filter);

            IQueryable<Todo> query = _context.Todos.AsQueryable();

            // Apply filter if provided
            if (!string.IsNullOrEmpty(filter))
            {
                switch (filter.ToLower())
                {
                    case "active":
                        query = query.Where(t => !t.IsCompleted);
                        _logger.LogInformation("Applied filter: active");
                        break;
                    case "completed":
                        query = query.Where(t => t.IsCompleted);
                        _logger.LogInformation("Applied filter: completed");
                        break;
                        // "all" is the default, no filter applied
                }
            }

            var totalCount = await query.CountAsync();
            var activeCount = await _context.Todos.CountAsync(t => !t.IsCompleted);

            // Retrieve paginated items
            var items = await query
                .OrderBy(t => t.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} todos for page {PageNumber}.", items.Count, pageNumber);

            return new PaginatedResponse<Todo>
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                ActiveCount = activeCount,
                Items = items
            };
        }

        /// <summary>
        /// Creates a new todo item.
        /// </summary>
        public async Task<Todo> CreateTodo(CreateTodoDto dto)
        {
            _logger.LogInformation("Creating a new todo.");

            // Validate title
            if (dto.Title == null)
            {
                _logger.LogWarning("Title is required for creating a todo.");
                throw new ArgumentNullException(nameof(dto.Title), "Title is required.");
            }

            if (dto.Title.Length < 10)
            {
                _logger.LogWarning("Title too short: {Title}", dto.Title);
                throw new ArgumentException("Task must be at least 10 characters.", nameof(dto.Title));
            }

            if (dto.Title.Length > 1000)
            {
                _logger.LogWarning("Title too long: {Title}", dto.Title);
                throw new ArgumentException("Task cannot exceed 1000 characters.", nameof(dto.Title));
            }

            var todo = new Todo
            {
                Title = dto.Title,
                Deadline = dto.Deadline,
                IsCompleted = dto.IsCompleted
            };

            _context.Todos.Add(todo);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Todo created with ID: {Id}", todo.Id);
            return todo;
        }

        /// <summary>
        /// Updates an existing todo item by its identifier.
        /// </summary>
        public async Task UpdateTodo(int id, UpdateTodoDto dto)
        {
            _logger.LogInformation("Updating todo with ID: {Id}", id);

            var existingTodo = await _context.Todos.FindAsync(id);
            if (existingTodo == null)
            {
                _logger.LogWarning("Todo with ID {Id} not found for update.", id);
                throw new KeyNotFoundException($"Todo with ID {id} not found");
            }

            // Update only provided properties
            if (dto.Title != null)
            {
                if (dto.Title.Length < 10)
                {
                    _logger.LogWarning("Title too short for update: {Title}", dto.Title);
                    throw new ArgumentException("Title must be at least 10 characters");
                }
                if (dto.Title.Length > 1000)
                {
                    _logger.LogWarning("Title too long for update: {Title}", dto.Title);
                    throw new ArgumentException("Task cannot exceed 1000 characters.", nameof(dto.Title));
                }
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
            _logger.LogInformation("Todo with ID {Id} updated successfully.", id);
        }

        /// <summary>
        /// Deletes a todo item by its identifier.
        /// </summary>
        public async Task DeleteTodo(int id)
        {
            _logger.LogInformation("Deleting todo with ID: {Id}", id);

            var todo = await _context.Todos.FindAsync(id);
            if (todo == null)
            {
                _logger.LogWarning("Todo with ID {Id} not found for deletion.", id);
                throw new KeyNotFoundException($"Todo with ID {id} not found");
            }

            _context.Todos.Remove(todo);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Todo with ID {Id} deleted successfully.", id);
        }
    }
}