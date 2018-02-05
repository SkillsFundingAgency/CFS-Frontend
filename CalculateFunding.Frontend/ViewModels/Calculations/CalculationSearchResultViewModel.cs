using System.Collections.Generic;
using CalculateFunding.Frontend.Clients.Models;
using CalculateFunding.Frontend.ViewModels.Paging;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationSearchResultViewModel
    {
        public int TotalResults { get; set; }

        public int CurrentPage { get; set; }

        /// <summary>
        /// The human readable position in the dataset the first item in the table is
        /// </summary>
        public int StartItemNumber { get; set; }

        /// <summary>
        /// The human readable position in the dataset where the last item in the table is
        /// </summary>
        public int EndItemNumber { get; set; }

        public IEnumerable<CalculationSearchResultItemViewModel> Calculations { get; set; }

        public PagerState PagerState { get; set; }

        public IEnumerable<SearchFacet> Facets { get; set; }
    }
}
