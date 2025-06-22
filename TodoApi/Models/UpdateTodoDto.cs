using System.ComponentModel.DataAnnotations;
namespace TodoApi.Models
{
    public class UpdateTodoDto
    {
        [MinLength(10, ErrorMessage = "Task must be at least 10 characters.")]
        [StringLength(1000, ErrorMessage = "Task cannot exceed 1000 characters.")]
        public string? Title { get; set; }

        public DateTime? Deadline { get; set; }
        public bool? IsCompleted { get; set; }
    }
}
