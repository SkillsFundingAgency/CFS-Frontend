namespace CalculateFunding.Frontend.Clients.CommonModels
{
    using System.Collections.Generic;

    public class SearchFacet
    {
        public string Name { get; set; }

        public IEnumerable<SearchFacetValue> FacetValues { get; set; }
    }
}
