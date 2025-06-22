namespace TodoApi.Models
{
    public class PaginatedResponse<T>
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public int ActiveCount { get; set; }
        public List<T> Items { get; set; } = new List<T>();
    }
}