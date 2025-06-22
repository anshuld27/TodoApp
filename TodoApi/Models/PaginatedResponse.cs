namespace TodoApi.Models
{
    /// <summary>
    /// Represents a paginated response for a collection of items.
    /// Contains pagination metadata and the items for the current page.
    /// </summary>
    /// <typeparam name="T">The type of items in the response.</typeparam>
    public class PaginatedResponse<T>
    {
        /// <summary>
        /// The current page number (1-based).
        /// </summary>
        public int PageNumber { get; set; }

        /// <summary>
        /// The number of items per page.
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// The total number of items across all pages.
        /// </summary>
        public int TotalCount { get; set; }

        /// <summary>
        /// The total number of pages based on the total count and page size.
        /// </summary>
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

        /// <summary>
        /// The number of active items (custom meaning, e.g., not completed) in the current page.
        /// </summary>
        public int ActiveCount { get; set; }

        /// <summary>
        /// The list of items for the current page.
        /// </summary>
        public List<T> Items { get; set; } = new List<T>();
    }
}