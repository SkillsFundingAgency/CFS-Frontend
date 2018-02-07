using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.CommonModels
{
    public class SearchFacet
    {
        public string Name { get; set; }

        public IEnumerable<SearchFacetValue> FacetValues { get; set; }
    }
}
