using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
namespace TodoApi.Models
{
    public class CreateTodoDto
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [JsonIgnore]
        public int Id { get; set; }

        [Required]
        [MinLength(10, ErrorMessage = "Task must be at least 10 characters.")]
        [StringLength(1000, ErrorMessage = "Task cannot exceed 1000 characters.")]
        public string Title { get; set; } = string.Empty;

        public DateTime? Deadline { get; set; }
        public bool IsCompleted { get; set; } = false;
    }
}
