using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Common
{
    public class SearchRequestBaseModel : PublishedProviderFilters
    {
        public string SearchTerm { get; set; }

        public IDictionary<string, string[]> Filters { get; set; }

        public IEnumerable<string> SearchFields { get; set; }
    }
}