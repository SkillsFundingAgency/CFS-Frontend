using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Clients.Models
{
    public class SearchFacet
    {
        public string Name { get; set; }

        public IEnumerable<SearchFacetValue> FacetValues { get; set; }
    }
}
