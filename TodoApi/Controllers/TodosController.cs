using Microsoft.AspNetCore.Mvc;
using TodoApi.Interfaces;
using TodoApi.Models;

namespace TodoApi.Controllers
{
    /// <summary>
    /// Controller for managing Todo items.
    /// Provides endpoints to create, retrieve, update, and delete todos.
    /// All actions are logged for traceability and debugging purposes.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class TodosController : ControllerBase
    {
        private readonly ITodoService _todoService;
        private readonly ILogger<TodosController> _logger;

        public TodosController(ITodoService todoService, ILogger<TodosController> logger)
        {
            _todoService = todoService;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves a paginated list of todos, optionally filtered.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? filter = null)
        {
            _logger.LogInformation("Getting todos - Page: {Page}, Size: {Size}, Filter: {Filter}", pageNumber, pageSize, filter);

            // Validate pagination parameters
            if (pageNumber < 1 || pageSize < 1)
            {
                _logger.LogWarning("Invalid pagination parameters - Page: {Page}, Size: {Size}", pageNumber, pageSize);
                return BadRequest(new { error = "Invalid pagination parameters" });
            }

            var result = await _todoService.GetAllTodos(pageNumber, pageSize, filter);
            _logger.LogInformation("Todos retrieved successfully. Count: {Count}", result.Items.Count);
            return Ok(result);
        }

        /// <summary>
        /// Creates a new todo item.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CreateTodoDto dto)
        {
            // Check model state validity
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for CreateTodoDto.");
                return BadRequest(ModelState);
            }

            try
            {
                var createdTodo = await _todoService.CreateTodo(dto);
                _logger.LogInformation("Todo created successfully. Id: {Id}", createdTodo.Id);
                return CreatedAtAction(nameof(Get), new { id = createdTodo.Id }, createdTodo);
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogError(ex, "ArgumentNullException while creating todo.");
                return BadRequest(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "ArgumentException while creating todo.");
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Updates an existing todo item by id.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] UpdateTodoDto dto)
        {
            // Check model state validity
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for UpdateTodoDto. Id: {Id}", id);
                return BadRequest(ModelState);
            }

            try
            {
                await _todoService.UpdateTodo(id, dto);
                _logger.LogInformation("Todo updated successfully. Id: {Id}", id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Todo not found for update. Id: {Id}", id);
                return NotFound(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "ArgumentException while updating todo. Id: {Id}", id);
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a todo item by id.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _todoService.DeleteTodo(id);
                _logger.LogInformation("Todo deleted successfully. Id: {Id}", id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Todo not found for deletion. Id: {Id}", id);
                return NotFound(new { error = ex.Message });
            }
        }
    }
}