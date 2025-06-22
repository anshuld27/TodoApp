using TodoApi.Models;

namespace TodoApi.Interfaces
{
    public interface ITodoService
    {
        Task<PaginatedResponse<Todo>> GetAllTodos(int pageNumber, int pageSize, string? filter = null);
        Task<Todo> CreateTodo(CreateTodoDto todo);
        Task UpdateTodo(int id, UpdateTodoDto todo);
        Task DeleteTodo(int id);
    }
}