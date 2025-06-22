using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Services;

namespace TodoApi.Tests.Services
{
    public class TodoServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly TodoService _service;

        public TodoServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);
            _service = new TodoService(_context);
        }

        public void Dispose() => _context.Dispose();

        [Fact]
        public async Task CreateTodo_ShouldAddValidTodo()
        {
            // Arrange
            var dto = new CreateTodoDto
            {
                Title = "A valid todo title",
                IsCompleted = false
            };

            // Act
            var result = await _service.CreateTodo(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("A valid todo title", result.Title);
            Assert.False(result.IsCompleted);
            Assert.Single(await _context.Todos.ToListAsync());
        }

        [Fact]
        public async Task CreateTodo_ShouldRejectShortTitle()
        {
            // Arrange
            var dto = new CreateTodoDto
            {
                Title = "Short",
                IsCompleted = false
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateTodo(dto));
        }

        [Fact]
        public async Task CreateTodo_ShouldRejectNullTitle()
        {
            // Arrange
            var dto = new CreateTodoDto
            {
                Title = null,
                IsCompleted = false
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _service.CreateTodo(dto));
        }

        [Fact]
        public async Task CreateTodo_ShouldRejectTooLongTitle()
        {
            // Arrange
            var dto = new CreateTodoDto
            {
                Title = new string('a', 1001),
                IsCompleted = false
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateTodo(dto));
        }

        [Fact]
        public async Task UpdateTodo_ShouldUpdateTitle()
        {
            // Arrange
            var todo = new Todo { Title = "Original Title", IsCompleted = false };
            _context.Todos.Add(todo);
            await _context.SaveChangesAsync();

            var dto = new UpdateTodoDto { Title = "Updated Title" };

            // Act
            await _service.UpdateTodo(todo.Id, dto);
            var result = await _context.Todos.FindAsync(todo.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Title", result.Title);
            Assert.False(result.IsCompleted);
        }

        [Fact]
        public async Task UpdateTodo_ShouldUpdateStatus()
        {
            // Arrange
            var todo = new Todo { Title = "Test", IsCompleted = false };
            _context.Todos.Add(todo);
            await _context.SaveChangesAsync();

            var dto = new UpdateTodoDto { IsCompleted = true };

            // Act
            await _service.UpdateTodo(todo.Id, dto);
            var result = await _context.Todos.FindAsync(todo.Id);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.IsCompleted);
            Assert.Equal("Test", result.Title);
        }

        [Fact]
        public async Task UpdateTodo_ShouldRejectShortTitle()
        {
            // Arrange
            var todo = new Todo { Title = "Original Title", IsCompleted = false };
            _context.Todos.Add(todo);
            await _context.SaveChangesAsync();

            var dto = new UpdateTodoDto { Title = "Short" };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateTodo(todo.Id, dto));
        }

        [Fact]
        public async Task UpdateTodo_ShouldRejectTooLongTitle()
        {
            // Arrange
            var todo = new Todo { Title = "Original Title", IsCompleted = false };
            _context.Todos.Add(todo);
            await _context.SaveChangesAsync();

            var dto = new UpdateTodoDto { Title = new string('a', 1001) };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateTodo(todo.Id, dto));
        }

        [Fact]
        public async Task UpdateTodo_ShouldRejectNonexistentTodo()
        {
            // Arrange
            var dto = new UpdateTodoDto { Title = "Updated Title" };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateTodo(999, dto));
        }

        [Fact]
        public async Task DeleteTodo_ShouldRemoveTodo()
        {
            // Arrange
            var todo = new Todo { Title = "To Delete", IsCompleted = false };
            _context.Todos.Add(todo);
            await _context.SaveChangesAsync();

            // Act
            await _service.DeleteTodo(todo.Id);
            var result = await _context.Todos.FindAsync(todo.Id);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task DeleteTodo_ShouldThrowIfNotFound()
        {
            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteTodo(999));
        }

        [Fact]
        public async Task GetAllTodos_ShouldReturnPaginatedResults()
        {
            // Arrange
            for (int i = 1; i <= 15; i++)
            {
                _context.Todos.Add(new Todo { Title = $"Todo {i:00}", IsCompleted = false });
            }
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetAllTodos(2, 5);

            // Assert
            Assert.Equal(2, result.PageNumber);
            Assert.Equal(5, result.PageSize);
            Assert.Equal(15, result.TotalCount);
            Assert.Equal(3, result.TotalPages);
            Assert.Equal(5, result.Items.Count);
            Assert.Equal("Todo 06", result.Items[0].Title);
        }

        [Fact]
        public async Task GetAllTodos_ShouldFilterActiveTasks()
        {
            // Arrange
            _context.Todos.Add(new Todo { Title = "Active 1", IsCompleted = false });
            _context.Todos.Add(new Todo { Title = "Active 2", IsCompleted = false });
            _context.Todos.Add(new Todo { Title = "Completed", IsCompleted = true });
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetAllTodos(1, 10, "active");

            // Assert
            Assert.Equal(2, result.Items.Count);
            Assert.All(result.Items, item => Assert.False(item.IsCompleted));
        }

        [Fact]
        public async Task GetAllTodos_ShouldFilterCompletedTasks()
        {
            // Arrange
            _context.Todos.Add(new Todo { Title = "Active", IsCompleted = false });
            _context.Todos.Add(new Todo { Title = "Completed 1", IsCompleted = true });
            _context.Todos.Add(new Todo { Title = "Completed 2", IsCompleted = true });
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetAllTodos(1, 10, "completed");

            // Assert
            Assert.Equal(2, result.Items.Count);
            Assert.All(result.Items, item => Assert.True(item.IsCompleted));
        }

        [Fact]
        public async Task GetAllTodos_ShouldReturnEmptyIfNoTodos()
        {
            // Act
            var result = await _service.GetAllTodos(1, 10);

            // Assert
            Assert.Empty(result.Items);
            Assert.Equal(0, result.TotalCount);
            Assert.Equal(0, result.TotalPages);
        }
    }
}