using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.CommonModels
{
    public class SearchRequestModel
    {
        public int? PageNumber { get; set; }

        public string SearchTerm { get; set; }

        public bool IncludeFacets { get; set; }

        public IDictionary<string, string[]> Filters { get; set; }
    }
}
