using System.Collections.Generic;
using CalculateFunding.Frontend.Clients.Models;

namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    public class CalculationSearchResults
    {
        public int TotalCount { get; set; }

        public IEnumerable<CalculationSearchResultItem> Results { get; set; }

        public IEnumerable<SearchFacet> Facets { get; set; }
    }
}
