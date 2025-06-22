namespace TodoApi.Models
{
    public class Todo
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime? Deadline { get; set; }
        public bool IsCompleted { get; set; }
    }
}