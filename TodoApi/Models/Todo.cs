namespace TodoApi.Models
{
    /// <summary>
    /// Represents a Todo item in the application.
    /// </summary>
    public class Todo
    {
        /// <summary>
        /// The unique identifier for the todo item.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// The title or description of the todo task.
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// The optional deadline for completing the todo item.
        /// </summary>
        public DateTime? Deadline { get; set; }

        /// <summary>
        /// Indicates whether the todo item is completed.
        /// </summary>
        public bool IsCompleted { get; set; }
    }
}