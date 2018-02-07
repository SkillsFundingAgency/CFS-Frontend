using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.CommonModels
{
    public class SearchFilterRequest : PagedQueryOptions
    {
        public string SearchTerm { get; set; }

        public bool IncludeFacets { get; set; }

        public IDictionary<string, string[]> Filters { get; set; }
    }
}
