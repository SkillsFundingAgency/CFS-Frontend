using System.Collections.Generic;

namespace CalculateFunding.Frontend.ApiClient
{
    public class PagedResult<T>
    {
        public int PageSize { get; set; }

        public int PageNumber { get; set; }

        public int TotalPages { get; set; }

        public int TotalItems { get; set; }

        public IEnumerable<T> Items { get; set; }
    }
}
