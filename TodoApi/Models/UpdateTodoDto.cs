using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models
{
    /// <summary>
    /// Data Transfer Object for updating an existing Todo item.
    /// Contains optional fields for partial updates.
    /// </summary>
    public class UpdateTodoDto
    {
        /// <summary>
        /// The updated title or description of the todo task.
        /// Must be between 10 and 1000 characters if provided.
        /// </summary>
        [MinLength(10, ErrorMessage = "Task must be at least 10 characters.")]
        [StringLength(1000, ErrorMessage = "Task cannot exceed 1000 characters.")]
        public string? Title { get; set; }

        /// <summary>
        /// The updated deadline for the todo item, if any.
        /// </summary>
        public DateTime? Deadline { get; set; }

        /// <summary>
        /// The updated completion status of the todo item, if any.
        /// </summary>
        public bool? IsCompleted { get; set; }
    }
}
