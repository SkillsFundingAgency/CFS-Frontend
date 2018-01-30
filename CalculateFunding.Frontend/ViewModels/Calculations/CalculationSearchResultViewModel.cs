using System.Collections.Generic;
using CalculateFunding.Frontend.Clients.Models;
using CalculateFunding.Frontend.ViewModels.Paging;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationSearchResultViewModel
    {
        public int TotalResults { get; set; }

        public int CurrentPage { get; set; }

        public int StartItemNumber { get; set; }

        public int EndItemNumber { get; set; }

        public IEnumerable<CalculationSearchResultItemViewModel> Calculations { get; set; }

        public PagerState PagerState { get; set; }

        public IEnumerable<SearchFacet> Facets { get; set; }
    }
}
