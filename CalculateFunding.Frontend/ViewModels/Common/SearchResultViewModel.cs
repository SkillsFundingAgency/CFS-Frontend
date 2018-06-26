namespace CalculateFunding.Frontend.ViewModels.Common
{
    using System.Collections.Generic;

    public class SearchResultViewModel
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

        public PagerState PagerState { get; set; }

        public IEnumerable<SearchFacetViewModel> Facets { get; set; }
    }
}
