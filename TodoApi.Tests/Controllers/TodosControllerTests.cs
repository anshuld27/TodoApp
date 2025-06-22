using Microsoft.AspNetCore.Mvc;
using Moq;
using TodoApi.Controllers;
using TodoApi.Interfaces;
using TodoApi.Models;

namespace TodoApi.Tests.Controllers
{
    public class TodosControllerTests
    {
        private readonly Mock<ITodoService> _mockService = new Mock<ITodoService>();
        private readonly TodosController _controller;

        public TodosControllerTests()
        {
            _controller = new TodosController(_mockService.Object);
        }

        [Fact]
        public async Task Get_ShouldReturnOkWithTodos()
        {
            // Arrange
            var response = new PaginatedResponse<Todo>
            {
                Items = new List<Todo> { new Todo { Id = 1, Title = "Test" } }
            };
            _mockService.Setup(s => s.GetAllTodos(1, 10, null)).ReturnsAsync(response);

            // Act
            var result = await _controller.Get() as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            var data = result.Value as PaginatedResponse<Todo>;
            Assert.Single(data.Items);
        }

        [Fact]
        public async Task Get_ShouldReturnEmptyList()
        {
            // Arrange
            var response = new PaginatedResponse<Todo>
            {
                Items = new List<Todo>(),
                PageNumber = 1,
                PageSize = 10,
                TotalCount = 0
            };
            _mockService.Setup(s => s.GetAllTodos(1, 10, null)).ReturnsAsync(response);

            // Act
            var result = await _controller.Get() as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            var data = result.Value as PaginatedResponse<Todo>;
            Assert.Empty(data.Items);
            Assert.Equal(0, data.TotalCount);
        }

        [Fact]
        public async Task Get_ShouldApplyFilter()
        {
            // Arrange
            var response = new PaginatedResponse<Todo>
            {
                Items = new List<Todo> { new Todo { Id = 2, Title = "Filtered" } }
            };
            _mockService.Setup(s => s.GetAllTodos(1, 10, "active")).ReturnsAsync(response);

            // Act
            var result = await _controller.Get(1, 10, "active") as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            var data = result.Value as PaginatedResponse<Todo>;
            Assert.Single(data.Items);
            Assert.Equal("Filtered", data.Items[0].Title);
        }

        [Fact]
        public async Task Post_ShouldCreateTodo()
        {
            // Arrange
            var dto = new CreateTodoDto { Title = "New Task" };
            var todo = new Todo { Id = 1, Title = dto.Title };
            _mockService.Setup(s => s.CreateTodo(dto)).ReturnsAsync(todo);

            // Act
            var result = await _controller.Post(dto) as CreatedAtActionResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(201, result.StatusCode);
            Assert.Equal(todo, result.Value);
        }

        [Fact]
        public async Task Post_ShouldReturnBadRequestForInvalidModel()
        {
            // Arrange
            _controller.ModelState.AddModelError("Title", "Required");

            // Act
            var result = await _controller.Post(new CreateTodoDto()) as BadRequestObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(400, result.StatusCode);
        }

        [Fact]
        public async Task Put_ShouldUpdateTodo()
        {
            // Arrange
            var dto = new UpdateTodoDto { Title = "Updated" };
            _mockService.Setup(s => s.UpdateTodo(1, dto)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Put(1, dto) as NoContentResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(204, result.StatusCode);
        }

        [Fact]
        public async Task Put_ShouldReturnNotFoundForInvalidId()
        {
            // Arrange
            var dto = new UpdateTodoDto { Title = "Updated" };
            _mockService.Setup(s => s.UpdateTodo(1, dto)).ThrowsAsync(new KeyNotFoundException());

            // Act
            var result = await _controller.Put(1, dto) as NotFoundObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(404, result.StatusCode);
        }

        [Fact]
        public async Task Put_ShouldReturnBadRequestForServiceValidation()
        {
            // Arrange
            var dto = new UpdateTodoDto { Title = "Short" };
            _mockService.Setup(s => s.UpdateTodo(1, dto)).ThrowsAsync(new ArgumentException("Task must be at least 10 characters."));

            // Act
            var result = await _controller.Put(1, dto) as BadRequestObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(400, result.StatusCode);
            Assert.Contains("Task must be at least 10 characters.", result.Value.ToString());
        }

        [Fact]
        public async Task Delete_ShouldRemoveTodo()
        {
            // Arrange
            _mockService.Setup(s => s.DeleteTodo(1)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Delete(1) as NoContentResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(204, result.StatusCode);
        }

        [Fact]
        public async Task Delete_ShouldReturnNotFoundForInvalidId()
        {
            // Arrange
            _mockService.Setup(s => s.DeleteTodo(1)).ThrowsAsync(new KeyNotFoundException());

            // Act
            var result = await _controller.Delete(1) as NotFoundObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(404, result.StatusCode);
        }
    }
}