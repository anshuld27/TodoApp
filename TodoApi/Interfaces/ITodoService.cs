using TodoApi.Models;

namespace TodoApi.Interfaces
{
    /// <summary>
    /// Service interface for managing Todo items.
    /// Provides methods for CRUD operations and retrieval with pagination and filtering.
    /// </summary>
    public interface ITodoService
    {
        /// <summary>
        /// Retrieves a paginated list of todos, optionally filtered by a search string.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve (1-based).</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="filter">Optional filter string to search todos.</param>
        /// <returns>A paginated response containing Todo items.</returns>
        Task<PaginatedResponse<Todo>> GetAllTodos(int pageNumber, int pageSize, string? filter = null);

        /// <summary>
        /// Creates a new todo item.
        /// </summary>
        /// <param name="todo">The data for the todo to create.</param>
        /// <returns>The created Todo item.</returns>
        Task<Todo> CreateTodo(CreateTodoDto todo);

        /// <summary>
        /// Updates an existing todo item by its identifier.
        /// </summary>
        /// <param name="id">The identifier of the todo to update.</param>
        /// <param name="todo">The updated data for the todo.</param>
        Task UpdateTodo(int id, UpdateTodoDto todo);

        /// <summary>
        /// Deletes a todo item by its identifier.
        /// </summary>
        /// <param name="id">The identifier of the todo to delete.</param>
        Task DeleteTodo(int id);
    }
}